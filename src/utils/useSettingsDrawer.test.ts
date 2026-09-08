import { describe, it, expect, vi } from "vitest";
import { openSettingsDrawer, closeSettingsDrawer } from "./useSettingsDrawer";
describe("useSettingsDrawer helpers", () => {
    it("dispatches atrium-open-settings custom event with specified pane", () => {
        const listener = vi.fn();
        window.addEventListener("atrium-open-settings", listener);
        openSettingsDrawer("search");
        expect(listener).toHaveBeenCalled();
        const event = listener.mock.calls[0][0] as CustomEvent;
        expect(event.detail?.pane).toBe("search");
        window.removeEventListener("atrium-open-settings", listener);
    });
    it("dispatches atrium-close-settings custom event", () => {
        const listener = vi.fn();
        window.addEventListener("atrium-close-settings", listener);
        closeSettingsDrawer();
        expect(listener).toHaveBeenCalled();
        window.removeEventListener("atrium-close-settings", listener);
    });
});
