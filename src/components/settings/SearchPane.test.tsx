import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchPane from "./SearchPane";
import SearchBar from "@/components/widgets/SearchBar";
import { settings } from "@/utils/settings";
import { useSearchManager } from "@/utils/useSearchManager";

function SearchControls() {
    const search = useSearchManager();
    return <><SearchBar /><SearchPane search={search} drawerOpen /></>;
}

describe("search provider selection", () => {
    let container: HTMLDivElement;
    let root: Root;
    let group: HTMLElement;

    beforeEach(async () => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        localStorage.clear();
        settings.set("search-engine-id", "google");
        settings.set("settings-search-autofocus", "false");
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
        await act(async () => root.render(<SearchControls />));
        group = container.querySelector<HTMLElement>('[role="radiogroup"]')!;
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        localStorage.clear();
        vi.unstubAllGlobals();
    });

    function radio(name: string) {
        return group.querySelector<HTMLInputElement>(`input[type="radio"][aria-label="${name}"]`)!;
    }

    it("exposes a named native radio group and updates the home search provider on selection", async () => {
        expect(document.getElementById(group.getAttribute("aria-labelledby")!)?.textContent)
            .toBe("Search Provider");
        const google = radio("Google");
        const duckDuckGo = radio("DuckDuckGo");
        expect(google.name).toBe(duckDuckGo.name);
        expect(google.checked).toBe(true);
        expect(duckDuckGo.checked).toBe(false);
        expect(document.getElementById(duckDuckGo.getAttribute("aria-describedby")!)?.getAttribute("aria-label"))
            .toBe("Privacy: Zero Tracking");

        duckDuckGo.focus();
        expect(document.activeElement).toBe(duckDuckGo);
        await act(async () => duckDuckGo.click());
        expect(duckDuckGo.checked).toBe(true);
        expect(google.checked).toBe(false);
        expect(settings.get("search-engine-id")).toBe("duckduckgo");
        expect(container.querySelector('input[inputmode="search"]')?.getAttribute("placeholder")).toBe("Search DuckDuckGo...");
    });

    it("deletes an unselected engine independently and restores focus to the selected radio", async () => {
        const google = radio("Google");
        const deleteBrave = group.querySelector<HTMLButtonElement>('button[aria-label="Delete Brave Search"]')!;
        expect(deleteBrave.closest("label")).toBeNull();
        expect(group.querySelector('button[aria-label="Delete Google"]')).toBeNull();

        deleteBrave.focus();
        await act(async () => deleteBrave.click());
        expect(radio("Brave Search")).toBeNull();
        expect(google.checked).toBe(true);
        expect(settings.get("search-engine-id")).toBe("google");
        expect(document.activeElement).toBe(google);
    });
});
