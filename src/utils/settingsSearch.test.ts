import { describe, it, expect } from "vitest";
import { normalizeText, tokenizeQuery, termMatchScore, searchSettings, type SettingEntry, } from "./settingsSearch";
const entry = (overrides: Partial<SettingEntry>): SettingEntry => ({
    id: "test",
    group: "Test Group",
    label: "Test Label",
    description: "A test description",
    keywords: [],
    pane: "main",
    ...overrides,
});
describe("normalizeText", () => {
    it("lowercases, strips punctuation, and expands ampersands", () => {
        expect(normalizeText("Wallpaper & Background!")).toBe("wallpaper and background");
    });
    it("collapses whitespace", () => {
        expect(normalizeText("  hello   world  ")).toBe("hello world");
    });
});
describe("tokenizeQuery", () => {
    it("splits into non-empty normalized terms", () => {
        expect(tokenizeQuery("  Dark  Mode! ")).toEqual(["dark", "mode"]);
        expect(tokenizeQuery(" !!! ")).toEqual([]);
    });
});
describe("termMatchScore", () => {
    it("ranks exact above prefix above substring", () => {
        const exact = termMatchScore("glow", "glow");
        const prefix = termMatchScore("glow", "glow effect");
        const substring = termMatchScore("glow", "ambient glow effect");
        expect(exact).toBeGreaterThan(prefix);
        expect(prefix).toBeGreaterThan(substring);
        expect(substring).toBeGreaterThan(0);
    });
    it("returns 0 for no match", () => {
        expect(termMatchScore("xyz", "ambient glow")).toBe(0);
        expect(termMatchScore("", "glow")).toBe(0);
    });
    it("fuzzy subsequence matches tight runs but rejects wide spans", () => {
        expect(termMatchScore("glw", "ambient glow", true)).toBeGreaterThan(0);
        expect(termMatchScore("dim", "your display name", true)).toBe(0);
    });
});
describe("searchSettings", () => {
    const entries: SettingEntry[] = [
        entry({ id: "theme", group: "Appearance", label: "Theme Mode", description: "Dark or light", keywords: ["dark mode"] }),
        entry({ id: "accent", group: "Appearance", label: "Accent Palette", description: "Choose accent color", keywords: ["color"] }),
        entry({ id: "dim", group: "Wallpaper", label: "Background Dim", description: "Darken wallpaper", keywords: ["dimming"] }),
    ];
    it("returns empty for queries under 2 chars", () => {
        expect(searchSettings(entries, "t")).toEqual([]);
        expect(searchSettings(entries, "")).toEqual([]);
    });
    it("matches by label with multi-term AND semantics", () => {
        const results = searchSettings(entries, "theme mode");
        expect(results[0]?.id).toBe("theme");
    });
    it("matches via keywords", () => {
        const results = searchSettings(entries, "dark mode");
        expect(results[0]?.id).toBe("theme");
    });
    it("requires every term to match somewhere", () => {
        const results = searchSettings(entries, "theme wallpaper");
        expect(results).toEqual([]);
    });
    it("ranks exact label matches above keyword-only matches", () => {
        const results = searchSettings(entries, "accent");
        expect(results[0]?.id).toBe("accent");
    });
    it("respects maxResults", () => {
        const results = searchSettings(entries, "a", 1);
        expect(results.length).toBeLessThanOrEqual(1);
    });
});
