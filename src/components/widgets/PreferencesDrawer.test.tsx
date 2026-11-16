import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ControlHub from "./ControlHub";
import { ThemeProvider } from "@/components/core/ThemeProvider";
import { REDUCED_MOTION_QUERY } from "@/themeBoot";
import { settings } from "@/utils/settings";
import { openSettingsDrawer } from "@/utils/useSettingsDrawer";

vi.mock("@/utils/backgroundDb", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/utils/backgroundDb")>(),
    getBackgroundBlob: async () => null,
}));

describe("Preferences keyboard navigation", () => {
    let container: HTMLDivElement;
    let root: Root;
    let mediaPreference: EventTarget & { matches: boolean };

    beforeEach(async () => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        localStorage.clear();
        mediaPreference = Object.assign(new EventTarget(), { matches: false });
        vi.stubGlobal("matchMedia", vi.fn(() => mediaPreference));
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
        await import("./PreferencesDrawer");
        await act(async () => root.render(<ThemeProvider><ControlHub /></ThemeProvider>));
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        localStorage.clear();
        document.documentElement.removeAttribute("data-perf");
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("focuses the active pane and makes the closed drawer and inactive panes inert", async () => {
        const trigger = container.querySelector<HTMLButtonElement>('[aria-label="Customize start page"]')!;
        await act(async () => trigger.click());
        const heading = container.querySelector("h2")!;
        expect(document.activeElement).toBe(heading);
        expect(heading.textContent).toBe("Preferences");

        const wallpaper = Array.from(container.querySelectorAll("button"))
            .find((button) => button.textContent?.includes("Wallpaper & Background"))!;
        expect(wallpaper.closest("[inert]")).toBeNull();
        await act(async () => wallpaper.click());
        expect(document.activeElement).toBe(heading);
        expect(heading.textContent).toBe("Wallpaper");
        expect(wallpaper.closest("[inert]")).not.toBeNull();

        const close = container.querySelector<HTMLButtonElement>('button[title="Close"]')!;
        await act(async () => close.click());
        expect(heading.closest("[inert]")).not.toBeNull();
        expect(document.activeElement).toBe(trigger);
    });

    it("returns focus to the supplied opener on Escape from the overview", async () => {
        const opener = document.createElement("button");
        container.appendChild(opener);
        await act(async () => openSettingsDrawer("main", opener));
        const heading = container.querySelector("h2")!;
        expect(document.activeElement).toBe(heading);

        await act(async () => heading.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
        expect(document.activeElement).toBe(opener);
    });

    it("wraps Tab and Shift+Tab between active drawer controls", async () => {
        // jsdom has no layout. Give the rendered tab stops a client rect.
        vi.spyOn(HTMLElement.prototype, "getClientRects")
            .mockReturnValue([new DOMRect()] as unknown as DOMRectList);
        const trigger = container.querySelector<HTMLButtonElement>('[aria-label="Customize start page"]')!;
        await act(async () => trigger.click());
        const first = container.querySelector<HTMLButtonElement>('button[title="Close"]')!;
        const last = container.querySelector<HTMLAnchorElement>('a[href*="trademarks"]')!;

        last.focus();
        const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
        last.dispatchEvent(tab);
        expect(tab.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(first);

        const shiftTab = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
        first.dispatchEvent(shiftTab);
        expect(shiftTab.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(last);
    });

    function changeSystemMotion(matches: boolean) {
        act(() => {
            mediaPreference.matches = matches;
            mediaPreference.dispatchEvent(new Event("change"));
        });
    }

    it("updates effective motion before the drawer opens and keeps the saved switch independent", async () => {
        expect(window.matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
        expect(document.documentElement.dataset.perf).toBe("false");
        changeSystemMotion(true);
        expect(document.documentElement.dataset.perf).toBe("true");
        expect(settings.get("settings-perf")).toBe("");

        await act(async () => openSettingsDrawer());
        const toggle = container.querySelector<HTMLButtonElement>('[aria-label="Low Motion Mode"]')!;
        expect(toggle.getAttribute("aria-checked")).toBe("false");
        await act(async () => toggle.click());
        expect(toggle.getAttribute("aria-checked")).toBe("true");
        expect(settings.get("settings-perf")).toBe("true");
        changeSystemMotion(false);
        expect(document.documentElement.dataset.perf).toBe("true");

        changeSystemMotion(true);
        await act(async () => toggle.click());
        expect(toggle.getAttribute("aria-checked")).toBe("false");
        expect(settings.get("settings-perf")).toBe("false");
        expect(document.documentElement.dataset.perf).toBe("true");
        changeSystemMotion(false);
        expect(document.documentElement.dataset.perf).toBe("false");
    });

    it("uses the effective motion at the time a settings search result scrolls into view", async () => {
        vi.useFakeTimers();
        const scrollIntoView = vi.fn();
        const scrollTo = vi.fn();
        const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
        const originalScrollTo = HTMLElement.prototype.scrollTo;
        HTMLElement.prototype.scrollIntoView = scrollIntoView;
        HTMLElement.prototype.scrollTo = scrollTo;
        try {
            await act(async () => openSettingsDrawer());
            const input = container.querySelector<HTMLInputElement>('[aria-label="Search settings"]')!;
            const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
            await act(async () => {
                setValue.call(input, "Open in New Tab");
                input.dispatchEvent(new Event("input", { bubbles: true }));
            });
            await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
            changeSystemMotion(true);
            await act(async () => vi.advanceTimersByTimeAsync(600));

            expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: "auto", block: "center" });
            expect(document.activeElement).toBe(container.querySelector("h2"));
        }
        finally {
            HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
            HTMLElement.prototype.scrollTo = originalScrollTo;
            vi.clearAllTimers();
            vi.useRealTimers();
        }
    });
});
