import { describe, it, expect } from "vitest";
import { optimizeWallpaperBlob, DEFAULT_BG_SETTINGS } from "./backgroundDb";
describe("backgroundDb utilities", () => {
    it("provides default background settings", () => {
        expect(DEFAULT_BG_SETTINGS.type).toBe("default");
        expect(DEFAULT_BG_SETTINGS.opacity).toBe(50);
        expect(DEFAULT_BG_SETTINGS.blur).toBe(0);
        expect(DEFAULT_BG_SETTINGS.dim).toBe(40);
    });
    it("passes through SVG and GIF files without downscaling/converting", async () => {
        const svgBlob = new Blob(["<svg></svg>"], { type: "image/svg+xml" });
        const resultSvg = await optimizeWallpaperBlob(svgBlob);
        expect(resultSvg).toBe(svgBlob);
        const gifBlob = new Blob(["GIF89a"], { type: "image/gif" });
        const resultGif = await optimizeWallpaperBlob(gifBlob);
        expect(resultGif).toBe(gifBlob);
    });
    it("passes non-image blobs through untouched", async () => {
        const textBlob = new Blob(["hello"], { type: "text/plain" });
        const result = await optimizeWallpaperBlob(textBlob);
        expect(result).toBe(textBlob);
    });
});
