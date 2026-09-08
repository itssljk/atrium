import { describe, it, expect } from "vitest";
import { DEFAULT_AUTO_ACCENT, getActiveBackgroundAccent } from "./colorExtractor";
import { settings } from "./settings";
describe("colorExtractor utilities", () => {
    it("defines default auto accent as sage", () => {
        expect(DEFAULT_AUTO_ACCENT.dark).toBe("#7ca38e");
    });
    it("getActiveBackgroundAccent returns curated accent when curated background is active", async () => {
        settings.set("bg-type", "curated");
        settings.set("bg-curated-url", "https://images.unsplash.com/photo-1534447677768-be436bb09401");
        const accent = await getActiveBackgroundAccent();
        expect(accent).toBeDefined();
        expect(accent.dark).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
    it("getActiveBackgroundAccent falls back cleanly on default background", async () => {
        settings.set("bg-type", "default");
        const accent = await getActiveBackgroundAccent();
        expect(accent.dark).toBe(DEFAULT_AUTO_ACCENT.dark);
    });
});
