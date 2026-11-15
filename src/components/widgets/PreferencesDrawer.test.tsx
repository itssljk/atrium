import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ControlHub from "./ControlHub";
import { openSettingsDrawer } from "@/utils/useSettingsDrawer";

vi.mock("@/utils/backgroundDb", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/utils/backgroundDb")>(),
    getBackgroundBlob: async () => null,
}));

describe("Preferences keyboard navigation", () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(async () => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
        await import("./PreferencesDrawer");
        await act(async () => root.render(<ControlHub />));
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
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
});
