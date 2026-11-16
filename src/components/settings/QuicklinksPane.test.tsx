import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import QuicklinksPane from "./QuicklinksPane";
import { settings } from "@/utils/settings";
import { useQuicklinksManager } from "@/utils/useQuicklinksManager";

const longTitle = "A very long shortcut title from an existing backup";
const initialShortcuts = [
    { id: "long", title: longTitle, url: "https://example.com/long" },
    { id: "docs", title: "Docs", url: "https://example.com/docs" },
];

function ShortcutSettings() {
    const quicklinksManager = useQuicklinksManager();
    return <QuicklinksPane quicklinksManager={quicklinksManager}/>;
}

describe("Quicklinks settings editor", () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(async () => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        localStorage.clear();
        settings.set("quicklinks", JSON.stringify(initialShortcuts));
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
        await act(async () => root.render(<ShortcutSettings />));
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        localStorage.clear();
        vi.unstubAllGlobals();
    });

    function button(name: string) {
        return Array.from(container.querySelectorAll("button"))
            .find((button) => (button.getAttribute("aria-label") ?? button.textContent?.trim()) === name)!;
    }

    function field(name: string) {
        const label = Array.from(container.querySelectorAll("label"))
            .find((label) => label.textContent?.trim() === name);
        return label?.control as HTMLInputElement;
    }

    async function fill(input: HTMLInputElement, value: string) {
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
        await act(async () => {
            setValue.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
    }

    it("adds and edits a shortcut through labeled fields and restores focus to the opener", async () => {
        await act(async () => button("Add Link").click());
        expect(document.activeElement?.textContent).toBe("Add Shortcut");
        await fill(field("Name"), "Work");
        await fill(field("URL"), "example.com/work");
        await act(async () => button("Badge").click());
        expect(button("Badge").getAttribute("aria-pressed")).toBe("true");
        await fill(field("Badge (1-2 chars)"), "WK");
        await act(async () => button("Save").click());
        expect(document.activeElement).toBe(button("Add Link"));
        expect(JSON.parse(settings.get("quicklinks")).at(-1)).toMatchObject({
            title: "Work", url: "https://example.com/work", iconType: "text", customIcon: "WK",
        });

        await act(async () => button("Edit Work").click());
        expect(document.activeElement?.textContent).toBe("Edit Shortcut");
        expect(field("Badge (1-2 chars)").value).toBe("WK");
        await fill(field("Name"), "Work links");
        await act(async () => button("Save").click());
        expect(document.activeElement).toBe(button("Edit Work links"));
        expect(JSON.parse(settings.get("quicklinks")).at(-1)?.title).toBe("Work links");
    });

    it("provides named independent actions for long titles and enforces reorder boundaries", async () => {
        expect(button(`Move ${longTitle} up`).disabled).toBe(true);
        expect(button(`Move ${longTitle} down`).disabled).toBe(false);
        expect(button("Move Docs down").disabled).toBe(true);
        expect(button(`Edit ${longTitle}`)).toBeDefined();

        await act(async () => button(`Move ${longTitle} down`).click());
        expect(button(`Move ${longTitle} down`).disabled).toBe(true);
        expect(JSON.parse(settings.get("quicklinks"))).toEqual(initialShortcuts.toReversed());
        await act(async () => button("Delete Docs").click());
        expect(button("Edit Docs")).toBeUndefined();
        expect(JSON.parse(settings.get("quicklinks"))).toEqual([initialShortcuts[0]]);
    });
});
