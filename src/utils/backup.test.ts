import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getExportData, importSettingsFromJson, resetAllSettings } from "./backup";
import { settings } from "./settings";
import { SETTINGS_SCHEMA, SYNC_KEYS } from "./settingsSchema";
import * as wallpaper from "./backgroundDb";

describe("backup and reset", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
        let lock = Promise.resolve();
        vi.stubGlobal("browser", { storage: {
            sync: { set: vi.fn(), remove: vi.fn() },
            onChanged: { addListener: vi.fn() },
        } });
        vi.stubGlobal("navigator", {
            locks: {
                request: (_name: string, run: () => Promise<void>) => {
                    const result = lock.then(run);
                    lock = result.catch(() => {});
                    return result;
                },
            },
        });
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        localStorage.clear();
    });

    it("round-trips local-only preferences and excludes device sync consent and cached image data", async () => {
        settings.set("username", "Alex");
        settings.set("settings-greeting", "false");
        localStorage.setItem("atrium-settings-sync", "true");
        localStorage.setItem("atrium-bg-bing-cache", "derived");
        const data = getExportData();
        expect(data.app).toBe("atrium-tabs");
        expect(data.settings).toEqual({ username: "Alex", "settings-greeting": "false" });

        localStorage.clear();
        expect(await importSettingsFromJson(JSON.stringify(data))).toMatchObject({ success: true, importedCount: 2 });
        expect(settings.getValue("settings-greeting")).toBe(false);
        expect(settings.isSyncEnabled()).toBe(false);
    });

    it("restores version 1 and legacy flat backups and ignores unknown keys and sync consent", async () => {
        const versionOne = { app: "atrium-tabs", version: "1.0.0", settings: {
            "atrium-username": "Imported", "temp-unit": "fahrenheit", "settings-sync": "true",
        } };
        expect(await importSettingsFromJson(JSON.stringify(versionOne))).toMatchObject({ success: true, importedCount: 2 });
        expect(await importSettingsFromJson('{"slate-settings-greeting":"false","unknown":"ignore"}'))
            .toMatchObject({ success: true, importedCount: 1 });
        expect(settings.get("username")).toBe("Imported");
        expect(settings.get("temp-unit")).toBe("fahrenheit");
        expect(settings.getValue("settings-greeting")).toBe(false);
        expect(settings.isSyncEnabled()).toBe(false);
    });

    it("rejects malformed payloads and reports storage write failures", async () => {
        expect((await importSettingsFromJson("not json")).success).toBe(false);
        expect((await importSettingsFromJson("[1, 2]")).success).toBe(false);
        vi.spyOn(settings, "set").mockReturnValue(false);
        expect(await importSettingsFromJson('{"username":"Alex"}')).toMatchObject({ success: false, importedCount: 0 });
    });

    it("uses the default background with a warning if an imported upload is not available locally", async () => {
        vi.spyOn(wallpaper, "getBackgroundBlob").mockResolvedValue(null);
        expect(await importSettingsFromJson('{"settings":{"bg-type":"upload"}}')).toMatchObject({
            success: true, importedCount: 1, warning: expect.stringContaining("No local upload was available"),
        });
        expect(settings.get("bg-type")).toBe("default");
    });

    it("preserves the local image and only changes the active background when requested", async () => {
        const read = vi.spyOn(wallpaper, "getBackgroundBlob").mockResolvedValue(new Blob(["photo"]));
        const clear = vi.spyOn(wallpaper, "clearBackgroundBlob");
        settings.set("bg-type", "upload");
        await importSettingsFromJson('{"username":"Alex"}');
        expect(settings.get("bg-type")).toBe("upload");
        expect(read).not.toHaveBeenCalled();

        await importSettingsFromJson('{"bg-type":"bing"}');
        expect(settings.get("bg-type")).toBe("bing");
        expect(await importSettingsFromJson('{"bg-type":"upload"}')).toMatchObject({ success: true, warning: undefined });
        expect(settings.get("bg-type")).toBe("upload");
        expect(clear).not.toHaveBeenCalled();
    });

    async function freshSyncSettings() {
        vi.resetModules();
        const { settings: fresh } = await import("./settings");
        const { sync, onChanged } = (window as unknown as { browser: { storage: {
            sync: { set: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };
            onChanged: { addListener: ReturnType<typeof vi.fn> };
        } } }).browser.storage;
        return { fresh, sync, onChanged };
    }

    it("resets all schema keys and both prefixes with sync off, preserving unrelated data", async () => {
        const { fresh, sync } = await freshSyncSettings();
        for (const key of Object.keys(SETTINGS_SCHEMA)) {
            localStorage.setItem(`atrium-${key}`, "value");
            localStorage.setItem(`slate-${key}`, "old");
        }
        localStorage.setItem("atrium-settings-sync", "false");
        localStorage.setItem("other-app", "keep");
        await fresh.resetUserSettings();

        expect(localStorage.length).toBe(1);
        expect(localStorage.getItem("other-app")).toBe("keep");
        expect(fresh.isSyncEnabled()).toBe(false);
        expect(sync.remove).not.toHaveBeenCalled();
    });

    it("waits for a write in flight, removes only sync keys, then disables sync and drops stale queued writes", async () => {
        const { fresh, sync, onChanged } = await freshSyncSettings();
        let completeWrite!: () => void;
        let completeRemoval!: () => void;
        fresh.startExternalSyncObserver();
        const applySyncChange = onChanged.addListener.mock.calls[0][0];
        sync.set.mockImplementation(() => new Promise<void>((resolve) => { completeWrite = resolve; }));
        sync.remove.mockImplementation(() => new Promise<void>((resolve) => { completeRemoval = resolve; }));
        fresh.setValue("settings-sync", true);
        fresh.set("username", "Alex");
        await vi.advanceTimersByTimeAsync(400);
        expect(sync.set).toHaveBeenCalledWith({ "atrium-username": "Alex" });

        fresh.set("accent", "cyan");
        const reset = fresh.resetUserSettings();
        expect(sync.remove).not.toHaveBeenCalled();
        completeWrite();
        // Let the debounced accent write queue behind the reset lock.
        await vi.advanceTimersByTimeAsync(400);
        expect(sync.remove).toHaveBeenCalledOnce();
        expect(sync.remove).toHaveBeenCalledWith([...SYNC_KEYS].flatMap((key) => [`atrium-${key}`, `slate-${key}`]));
        expect(fresh.isSyncEnabled()).toBe(true);
        applySyncChange({ "atrium-settings-glow": { newValue: "false" } }, "sync");
        completeRemoval();
        await reset;
        await vi.advanceTimersByTimeAsync(400);
        expect(fresh.isSyncEnabled()).toBe(false);
        expect(fresh.get("username")).toBe("");
        expect(fresh.get("settings-glow")).toBe("");
        expect(sync.set).toHaveBeenCalledOnce();
    });

    it("keeps local settings and sync enabled when the browser rejects sync removal", async () => {
        const { fresh, sync } = await freshSyncSettings();
        sync.remove.mockRejectedValue(new Error("Sync unavailable"));
        localStorage.setItem("atrium-settings-sync", "true");
        localStorage.setItem("atrium-username", "Alex");

        await expect(fresh.resetUserSettings()).rejects.toThrow("Could not remove settings from browser sync");
        expect(fresh.isSyncEnabled()).toBe(true);
        expect(fresh.get("username")).toBe("Alex");
    });

    it("reports IndexedDB cleanup failure after resetting settings and permits a retry", async () => {
        const clear = vi.spyOn(wallpaper, "clearBackgroundBlob").mockRejectedValueOnce(new Error("IndexedDB blocked")).mockResolvedValueOnce();
        settings.set("settings-greeting", "false");
        await expect(resetAllSettings()).rejects.toThrow("could not remove the uploaded wallpaper");
        expect(settings.get("settings-greeting")).toBe("");
        await expect(resetAllSettings()).resolves.toBeUndefined();
        expect(clear).toHaveBeenCalledTimes(2);
    });
});
