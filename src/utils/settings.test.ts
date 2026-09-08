import { describe, it, expect, beforeEach } from "vitest";
import { settings, STORAGE_PREFIX, LEGACY_STORAGE_PREFIX } from "./settings";
import { SETTINGS_SCHEMA, SYNC_KEYS } from "./settingsSchema";
import { getMailUrl, getMailName } from "./useGeneralManager";
describe("settings store", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });
    it("get returns fallback when key is unset", () => {
        expect(settings.get("nonexistent-key", "fallback")).toBe("fallback");
        expect(settings.get("nonexistent-key")).toBe("");
    });
    it("set/get round-trips a value under the prefixed key", () => {
        settings.set("username", "Alex");
        expect(settings.get("username")).toBe("Alex");
        expect(window.localStorage.getItem(`${STORAGE_PREFIX}username`)).toBe("Alex");
    });
    it("remove clears both prefixed and legacy keys", () => {
        window.localStorage.setItem(`${LEGACY_STORAGE_PREFIX}username`, "Old");
        window.localStorage.setItem(`${STORAGE_PREFIX}username`, "New");
        settings.remove("username");
        expect(settings.get("username")).toBe("");
        expect(window.localStorage.getItem(`${LEGACY_STORAGE_PREFIX}username`)).toBeNull();
    });
    it("get reads legacy slate- keys when the atrium- key is unset", () => {
        window.localStorage.setItem(`${LEGACY_STORAGE_PREFIX}username`, "Legacy");
        expect(settings.get("username")).toBe("Legacy");
    });
    it("getValue parses through the schema with defaults", () => {
        expect(settings.getValue("settings-glow")).toBe(true);
        expect(settings.getValue("temp-unit")).toBe("celsius");
        expect(settings.getValue("settings-search-autofocus")).toBe(true);
        expect(settings.getValue("settings-search-new-tab")).toBe(false);
        settings.set("settings-glow", "false");
        expect(settings.getValue("settings-glow")).toBe(false);
        settings.set("settings-search-autofocus", "false");
        expect(settings.getValue("settings-search-autofocus")).toBe(false);
        settings.set("settings-search-new-tab", "true");
        expect(settings.getValue("settings-search-new-tab")).toBe(true);
        settings.set("temp-unit", "nonsense");
        expect(settings.getValue("temp-unit")).toBe("celsius");
    });
    it("setValue serializes through the schema", () => {
        settings.setValue("settings-perf", true);
        expect(window.localStorage.getItem(`${STORAGE_PREFIX}settings-perf`)).toBe("true");
        expect(settings.getValue("settings-perf")).toBe(true);
    });
    it("getValue rejects malformed JSON with the schema default", () => {
        window.localStorage.setItem(`${STORAGE_PREFIX}quicklinks`, "{not json");
        expect(settings.getValue("quicklinks")).toEqual(SETTINGS_SCHEMA.quicklinks.default);
    });
    it("getNumber parses or falls back", () => {
        settings.set("bg-opacity", "80");
        expect(settings.getNumber("bg-opacity", 100)).toBe(80);
        expect(settings.getNumber("missing-number", 42)).toBe(42);
        settings.set("bg-opacity", "abc");
        expect(settings.getNumber("bg-opacity", 100)).toBe(100);
    });
    it("notify subscribers fire on set and remove, deferred per key", async () => {
        const seen: string[] = [];
        const unsub = settings.subscribe((key) => seen.push(key));
        settings.set("username", "Alex");
        settings.set("temp-unit", "fahrenheit");
        expect(seen).toEqual([]);
        await Promise.resolve();
        expect(seen).toContain("username");
        expect(seen).toContain("temp-unit");
        seen.length = 0;
        settings.remove("username");
        await Promise.resolve();
        expect(seen).toContain("username");
        unsub();
    });
});
describe("settings schema", () => {
    it("every schema entry has a key matching its property name", () => {
        for (const [prop, def] of Object.entries(SETTINGS_SCHEMA)) {
            expect(def.key).toBe(prop);
        }
    });
    it("SYNC_KEYS is derived from sync:true entries only", () => {
        const expected = new Set(Object.values(SETTINGS_SCHEMA)
            .filter((d) => d.sync)
            .map((d) => d.key));
        expect(SYNC_KEYS.size).toBe(expected.size);
        for (const key of expected) {
            expect(SYNC_KEYS.has(key)).toBe(true);
        }
        expect(SYNC_KEYS.has("settings-greeting")).toBe(false);
        expect(SYNC_KEYS.has("settings-greeting-mode")).toBe(false);
        expect(SYNC_KEYS.has("settings-sync")).toBe(false);
    });
    it("parsers always return a value of the right shape", () => {
        expect(settings.getValue("custom-engines")).toEqual([]);
        expect(settings.getValue("deleted-engines")).toEqual([]);
        expect(Array.isArray(settings.getValue("quicklinks"))).toBe(true);
        expect(settings.getValue("settings-greeting-mode")).toBe("both");
    });
    it("settings-greeting-mode validates allowed values and falls back to default", () => {
        settings.set("settings-greeting-mode", "greeting");
        expect(settings.getValue("settings-greeting-mode")).toBe("greeting");
        settings.set("settings-greeting-mode", "quote");
        expect(settings.getValue("settings-greeting-mode")).toBe("quote");
        settings.set("settings-greeting-mode", "invalid-mode");
        expect(settings.getValue("settings-greeting-mode")).toBe("both");
    });
    it("mail settings validate allowed values and fall back to defaults", () => {
        expect(settings.getValue("settings-show-mail")).toBe(true);
        expect(settings.getValue("mail-service")).toBe("gmail");
        expect(settings.getValue("mail-style")).toBe("pill");
        expect(settings.getValue("mail-label-mode")).toBe("generic");
        settings.set("mail-service", "proton");
        expect(settings.getValue("mail-service")).toBe("proton");
        settings.set("mail-service", "invalid-service");
        expect(settings.getValue("mail-service")).toBe("gmail");
        settings.set("mail-style", "glass");
        expect(settings.getValue("mail-style")).toBe("glass");
        settings.set("mail-style", "icon");
        expect(settings.getValue("mail-style")).toBe("icon");
        settings.set("mail-style", "unknown-style");
        expect(settings.getValue("mail-style")).toBe("pill");
        settings.set("mail-label-mode", "provider");
        expect(settings.getValue("mail-label-mode")).toBe("provider");
        settings.set("mail-label-mode", "invalid-mode");
        expect(settings.getValue("mail-label-mode")).toBe("generic");
    });
    it("getMailUrl and getMailName resolve configured and custom providers", () => {
        expect(getMailUrl("gmail", "")).toBe("https://mail.google.com");
        expect(getMailUrl("outlook", "")).toBe("https://outlook.live.com/mail/");
        expect(getMailUrl("proton", "")).toBe("https://mail.proton.me");
        expect(getMailUrl("icloud", "")).toBe("https://www.icloud.com/mail");
        expect(getMailUrl("fastmail", "")).toBe("https://app.fastmail.com");
        expect(getMailName("gmail")).toBe("Gmail");
        expect(getMailName("proton")).toBe("Proton");
        expect(getMailName("custom")).toBe("Custom Mail");
        expect(getMailUrl("custom", "")).toBe("https://mail.google.com");
        expect(getMailUrl("custom", "https://mail.corp.com")).toBe("https://mail.corp.com");
        expect(getMailUrl("custom", "mail.corp.com")).toBe("https://mail.corp.com");
        expect(getMailUrl("custom", "mailto:user@corp.com")).toBe("mailto:user@corp.com");
    });
    it("settings-sync defaults to false and controls isSyncEnabled", () => {
        expect(settings.getValue("settings-sync")).toBe(false);
        expect(settings.isSyncEnabled()).toBe(false);
        settings.setValue("settings-sync", true);
        expect(settings.getValue("settings-sync")).toBe(true);
        expect(settings.isSyncEnabled()).toBe(true);
        settings.setValue("settings-sync", false);
        expect(settings.isSyncEnabled()).toBe(false);
    });
});
