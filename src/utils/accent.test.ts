import { describe, it, expect } from "vitest";
import { ACCENT_PRESETS, normalizeAccent, hexToHsl, hslToHex } from "./accent";
describe("accent utilities", () => {
    describe("ACCENT_PRESETS", () => {
        it("includes all standard presets including cyan", () => {
            const ids = ACCENT_PRESETS.map((p) => p.id);
            expect(ids).toContain("sage");
            expect(ids).toContain("violet");
            expect(ids).toContain("amber");
            expect(ids).toContain("rose");
            expect(ids).toContain("cyan");
        });
        it("has valid hex colors for each preset", () => {
            for (const preset of ACCENT_PRESETS) {
                expect(preset.color).toMatch(/^#[0-9a-fA-F]{6}$/);
            }
        });
    });
    describe("normalizeAccent", () => {
        it("maps removed 'slate' accent to 'sage'", () => {
            expect(normalizeAccent("slate")).toBe("sage");
        });
        it("passes through existing accents unchanged", () => {
            expect(normalizeAccent("sage")).toBe("sage");
            expect(normalizeAccent("cyan")).toBe("cyan");
            expect(normalizeAccent("violet")).toBe("violet");
            expect(normalizeAccent("custom")).toBe("custom");
            expect(normalizeAccent("auto")).toBe("auto");
        });
    });
    describe("hexToHsl & hslToHex", () => {
        it("correctly converts standard 6-digit hex with hash", () => {
            const hsl = hexToHsl("#7ca38e");
            expect(hsl.h).toBeGreaterThan(140);
            expect(hsl.h).toBeLessThan(155);
            expect(hsl.s).toBeGreaterThan(10);
            expect(hsl.l).toBeGreaterThan(50);
        });
        it("handles hex without leading hash", () => {
            const withHash = hexToHsl("#22D3EE");
            const withoutHash = hexToHsl("22D3EE");
            expect(withoutHash).toEqual(withHash);
        });
        it("handles 3-digit shorthand hex", () => {
            const hsl3 = hexToHsl("#fff");
            expect(hsl3.l).toBe(100);
            const hslBlack = hexToHsl("#000");
            expect(hslBlack.l).toBe(0);
        });
        it("handles invalid hex by returning zeroed hsl", () => {
            expect(hexToHsl("invalid")).toEqual({ h: 0, s: 0, l: 0 });
            expect(hexToHsl("")).toEqual({ h: 0, s: 0, l: 0 });
        });
        it("converts hsl back to valid hex", () => {
            const hex = hslToHex(147, 18, 56);
            expect(hex).toMatch(/^#[0-9a-f]{6}$/);
        });
    });
});
