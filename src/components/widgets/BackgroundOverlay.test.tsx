import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BackgroundOverlay from "./BackgroundOverlay";
import { settings } from "@/utils/settings";
import * as colors from "@/utils/colorExtractor";
import * as bing from "@/utils/bingWallpaper";

describe("wallpaper browser tint", () => {
    let container: HTMLDivElement;
    let themeColor: HTMLMetaElement;
    let root: Root;
    const sample = { ...colors.DEFAULT_BRIGHTNESS, topColor: [203, 103, 57] as const };

    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        localStorage.clear();
        themeColor = document.createElement("meta");
        themeColor.name = "theme-color";
        themeColor.content = "#030307";
        document.head.appendChild(themeColor);
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        themeColor.remove();
        container.remove();
        localStorage.clear();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    function expectTint(color: string) {
        expect(themeColor.content).toBe(color);
        expect(document.documentElement.style.getPropertyValue("--browser-tint"))
            .toBe(color === "#030307" ? "" : color);
    }

    it("uses the existing photo sample and follows opacity and readability", async () => {
        const analyze = vi.spyOn(colors, "analyzeImageBrightness").mockResolvedValue(sample);
        await act(async () => {
            settings.set("bg-type", "curated");
            settings.set("bg-curated-url", "/photo.jpg");
            root.render(<BackgroundOverlay />);
        });
        expect(analyze).toHaveBeenCalledWith("/photo.jpg");
        expectTint("#371d14");

        await act(async () => settings.set("bg-opacity", "100"));
        expectTint("#6a3721");
        await act(async () => settings.set("settings-bg-readability", "false"));
        expectTint("#030307");
        expect(container.querySelector<HTMLElement>("[style*='background-image']")?.style.backgroundImage)
            .toContain("/photo.jpg");
    });

    it("ignores a stale photo sample after switching to an unreadable image", async () => {
        let resolveOldPhoto!: (result: colors.ImageBrightnessAnalysis) => void;
        vi.spyOn(colors, "analyzeImageBrightness")
            .mockImplementation((source) => source === "/old.jpg"
                ? new Promise((resolve) => { resolveOldPhoto = resolve; })
                : Promise.resolve(colors.DEFAULT_BRIGHTNESS));
        await act(async () => {
            settings.set("bg-type", "url");
            settings.set("bg-url-link", "/old.jpg");
            root.render(<BackgroundOverlay />);
        });
        await act(async () => settings.set("bg-url-link", "/blocked.jpg"));
        await act(async () => resolveOldPhoto(sample));
        expectTint("#030307");
        expect(container.querySelector<HTMLElement>("[style*='background-image']")?.style.backgroundImage)
            .toContain("/blocked.jpg");
    });

    it("applies a newly loaded Bing photo tint and resets on the default gradient", async () => {
        vi.spyOn(colors, "analyzeImageBrightness").mockResolvedValue(sample);
        vi.spyOn(bing, "fetchBingWallpaper").mockResolvedValue({
            url: "/daily.jpg", title: "Daily photo", copyright: "Test", copyrightLink: "", date: "20261115", updatedAt: 0,
        });
        await act(async () => {
            settings.set("bg-type", "bing");
            root.render(<BackgroundOverlay />);
        });
        expectTint("#371d14");
        await act(async () => settings.set("bg-type", "default"));
        expectTint("#030307");
    });
});
