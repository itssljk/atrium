import { describe, it, expect, beforeEach } from "vitest";
import { getExportData, importSettingsFromJson, resetAllSettings } from "./backup";
import { settings } from "./settings";
import { SYNC_KEYS } from "./settingsSchema";
describe("backup", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });
    it("getExportData includes only sync keys with non-empty values", () => {
        settings.set("username", "Alex");
        settings.set("settings-greeting", "false");
        settings.set("custom-engines", JSON.stringify([{ id: "x", name: "X", url: "https://x", domain: "x.com" }]));
        const data = getExportData();
        expect(data.app).toBe("atrium-tabs");
        expect(data.settings["username"]).toBe("Alex");
        expect(data.settings["custom-engines"]).toContain("x.com");
        expect(data.settings["settings-greeting"]).toBeUndefined();
    });
    it("importSettingsFromJson restores known keys and strips prefixes", () => {
        const result = importSettingsFromJson(JSON.stringify({ settings: { "atrium-username": "Imported", "temp-unit": "fahrenheit" } }));
        expect(result.success).toBe(true);
        expect(result.importedCount).toBe(2);
        expect(settings.get("username")).toBe("Imported");
        expect(settings.get("temp-unit")).toBe("fahrenheit");
    });
    it("importSettingsFromJson ignores unknown keys", () => {
        const result = importSettingsFromJson(JSON.stringify({ settings: { "totally-unknown": "x", username: "Keep" } }));
        expect(result.success).toBe(true);
        expect(result.importedCount).toBe(1);
    });
    it("importSettingsFromJson rejects invalid payloads", () => {
        expect(importSettingsFromJson("not json").success).toBe(false);
        expect(importSettingsFromJson(JSON.stringify([1, 2])).success).toBe(false);
    });
    it("resetAllSettings clears exactly the sync keys", () => {
        for (const key of SYNC_KEYS)
            settings.set(key, "value");
        resetAllSettings();
        for (const key of SYNC_KEYS) {
            expect(settings.get(key)).toBe("");
        }
    });
});
