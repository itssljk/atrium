import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import SearchBar from "./SearchBar";
import Greeting from "./Greeting";
import MailWidget from "./MailWidget";
import SupportPane from "../settings/SupportPane";
import { settings } from "@/utils/settings";
(globalThis as {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
}).IS_REACT_ACT_ENVIRONMENT = true;
describe("Widgets & UI Components", () => {
    let container: HTMLDivElement;
    let root: Root;
    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        document.body.innerHTML = "";
        vi.restoreAllMocks();
    });
    describe("SearchBar", () => {
        it("renders search input field", async () => {
            await act(async () => {
                root.render(<SearchBar />);
            });
            const input = container.querySelector("input");
            expect(input).not.toBeNull();
            expect(input?.placeholder).toContain("Search");
        });
        it("typing text updates input value", async () => {
            await act(async () => {
                root.render(<SearchBar />);
            });
            const input = container.querySelector("input")!;
            await act(async () => {
                input.value = "vite js";
                input.dispatchEvent(new Event("input", { bubbles: true }));
            });
            expect(input.value).toBe("vite js");
        });
    });
    describe("Greeting", () => {
        it("renders greeting headline when enabled", async () => {
            settings.set("settings-greeting", "true");
            settings.set("username", "Alex");
            await act(async () => {
                root.render(<Greeting />);
            });
            const heading = container.querySelector("h1");
            expect(heading).not.toBeNull();
            expect(heading?.textContent).toContain("Alex");
        });
        it("returns null when greeting is disabled", async () => {
            settings.set("settings-greeting", "false");
            await act(async () => {
                root.render(<Greeting />);
            });
            expect(container.querySelector("h1")).toBeNull();
        });
        it("renders quote button with clean em-dash separating quote and author", async () => {
            settings.set("settings-greeting", "true");
            settings.set("settings-greeting-mode", "quote");
            await act(async () => {
                root.render(<Greeting />);
            });
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 50));
            });
            const button = container.querySelector("button");
            expect(button).not.toBeNull();
            expect(button?.textContent).toMatch(/—/);
        });
    });
    describe("MailWidget", () => {
        it("renders mail button with link to configured service", async () => {
            settings.set("settings-show-mail", "true");
            settings.set("mail-service", "outlook");
            settings.set("mail-style", "pill");
            await act(async () => {
                root.render(<MailWidget />);
            });
            const link = container.querySelector("a");
            expect(link).not.toBeNull();
            expect(link?.getAttribute("href")).toBe("https://outlook.live.com/mail/");
        });
        it("does not render when mail button is disabled", async () => {
            settings.set("settings-show-mail", "false");
            await act(async () => {
                root.render(<MailWidget />);
            });
            expect(container.querySelector("a")).toBeNull();
        });
    });
    describe("SupportPane", () => {
        it("renders support sections and opens settings from Explore Atrium", async () => {
            const onNavigate = vi.fn();
            await act(async () => {
                root.render(<SupportPane onNavigate={onNavigate} />);
            });
            const explore = container.querySelector("section");
            expect(explore?.querySelector("h3")?.textContent).toBe("Explore Atrium");
            expect(explore?.textContent).toContain("Start a query with a bang such as !g to search Google directly.");
            expect(explore?.textContent).toContain("Press 1–9 outside a text field to open the matching shortcut in order.");
            expect(explore?.textContent).toContain("Try a daily wallpaper, choose a curated image, or use your own.");

            const buttons = Array.from(explore?.querySelectorAll("button") ?? []);
            expect(buttons.map((button) => button.textContent?.trim())).toEqual([
                "Search settings",
                "Quicklinks settings",
                "Background settings",
            ]);
            for (const button of buttons) {
                act(() => button.click());
            }
            expect(onNavigate.mock.calls).toEqual([["search"], ["quicklinks"], ["background"]]);

            expect(container.textContent).toContain("Atrium Community");
            expect(container.textContent).toContain("Backup & Reset");
            expect(container.textContent).toContain("Export Backup");
            expect(container.textContent).toContain("Restore Backup");
            expect(container.textContent).toContain("Reset Settings");
            expect(container.textContent).toContain("Terms of Service");
            expect(container.textContent).toContain("Privacy Policy");
            expect(container.textContent).toContain("Trademarks & Branding");
        });
    });
});
