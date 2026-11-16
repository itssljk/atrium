import { afterEach, describe, it, expect, vi } from "vitest";
import { clearBackgroundBlob, optimizeWallpaperBlob, DEFAULT_BG_SETTINGS } from "./backgroundDb";
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

describe("clearBackgroundBlob", () => {
    afterEach(() => vi.unstubAllGlobals());

    function mockWallpaperStorage(abortDatabase?: string) {
        const deleted: Array<[string, string]> = [];
        vi.stubGlobal("indexedDB", {
            open(name: string) {
                const transaction = {
                    oncomplete: () => {},
                    onabort: () => {},
                    error: new DOMException("Deletion aborted", "AbortError"),
                    objectStore: () => ({ delete(key: string) {
                        queueMicrotask(() => {
                            if (name === abortDatabase) {
                                transaction.onabort();
                                return;
                            }
                            deleted.push([name, key]);
                            transaction.oncomplete();
                        });
                    } }),
                };
                const request = {
                    onsuccess: () => {},
                    result: { transaction: () => transaction, close: () => {} },
                };
                queueMicrotask(() => request.onsuccess());
                return request;
            },
        });
        return deleted;
    }

    it("waits for the deletion of only the custom upload in both databases", async () => {
        const deleted = mockWallpaperStorage();
        await clearBackgroundBlob();
        expect(deleted).toEqual([
            ["slate-tabs-db", "custom-upload"],
            ["atrium-tabs-db", "custom-upload"],
        ]);
    });

    it("rejects if IndexedDB aborts the deletion transaction", async () => {
        const deleted = mockWallpaperStorage("atrium-tabs-db");
        await expect(clearBackgroundBlob()).rejects.toThrow("Deletion aborted");
        expect(deleted).toEqual([["slate-tabs-db", "custom-upload"]]);
    });
});
