import { describe, it, expect } from "vitest";
import { getSettingsUrl } from "./navigation";
describe("navigation utilities", () => {
    it("returns default open settings url without pane", () => {
        expect(getSettingsUrl()).toBe("./index.html?settings=open");
    });
    it("returns url with encoded pane parameter when pane is provided", () => {
        expect(getSettingsUrl("search")).toBe("./index.html?settings=open&pane=search");
        expect(getSettingsUrl("background")).toBe("./index.html?settings=open&pane=background");
        expect(getSettingsUrl("custom pane name")).toBe("./index.html?settings=open&pane=custom%20pane%20name");
    });
});
