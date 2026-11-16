import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REDUCED_MOTION_QUERY, THEME_BOOT_SCRIPT } from "./themeBoot";

const runBootScript = new Function("window", "document", THEME_BOOT_SCRIPT);

describe("pre-paint motion settings", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute("data-perf");
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.removeAttribute("data-accent");
    });

    it.each([
        [null, false, "false"],
        ["true", false, "true"],
        [null, true, "true"],
        ["false", true, "true"],
        ["true", true, "true"],
    ])("applies saved %s and system %s before React mounts", (saved, system, expected) => {
        if (saved !== null)
            localStorage.setItem("atrium-settings-perf", saved);
        const matchMedia = vi.fn(() => ({ matches: system }));

        runBootScript({ localStorage, matchMedia }, document);

        expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
        expect(document.documentElement.dataset.perf).toBe(expected);
        expect(localStorage.getItem("atrium-settings-perf")).toBe(saved);
    });

    it("uses a legacy saved setting until a current value overrides it", () => {
        localStorage.setItem("slate-settings-perf", "true");
        runBootScript({ localStorage }, document);
        expect(document.documentElement.dataset.perf).toBe("true");

        localStorage.setItem("atrium-settings-perf", "false");
        runBootScript({ localStorage }, document);
        expect(document.documentElement.dataset.perf).toBe("false");
    });
});
