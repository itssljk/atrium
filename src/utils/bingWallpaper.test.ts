import { describe, it, expect } from "vitest";
import { getTodayDateString, getCachedBingWallpaper } from "./bingWallpaper";
import { settings } from "./settings";
describe("bingWallpaper utilities", () => {
    it("generates 8-digit date string formatted YYYYMMDD", () => {
        const str = getTodayDateString();
        expect(str).toMatch(/^\d{8}$/);
        const year = new Date().getFullYear().toString();
        expect(str.startsWith(year)).toBe(true);
    });
    it("getCachedBingWallpaper returns null when cache is empty", () => {
        settings.remove("bg-bing-cache");
        expect(getCachedBingWallpaper()).toBeNull();
    });
    it("getCachedBingWallpaper returns cached data when valid for today", () => {
        const today = getTodayDateString();
        const fakeData = {
            url: "https://www.bing.com/th?id=test.jpg",
            title: "Test Wallpaper",
            copyright: "Test Copyright",
            copyrightLink: "https://bing.com",
            date: today,
            updatedAt: Date.now(),
        };
        settings.set("bg-bing-cache", JSON.stringify(fakeData));
        const cached = getCachedBingWallpaper();
        expect(cached).not.toBeNull();
        expect(cached?.title).toBe("Test Wallpaper");
        expect(cached?.url).toBe("https://www.bing.com/th?id=test.jpg");
    });
});
