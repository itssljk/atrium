import { describe, it, expect } from "vitest";
import { getDomain } from "./quicklinks";
describe("quicklinks utilities", () => {
    it("extracts hostname from full URLs", () => {
        expect(getDomain("https://github.com/itssljk/atrium-tabs")).toBe("github.com");
        expect(getDomain("http://localhost:5173/test")).toBe("localhost");
    });
    it("extracts hostname when protocol is omitted", () => {
        expect(getDomain("youtube.com")).toBe("youtube.com");
        expect(getDomain("news.ycombinator.com/item?id=123")).toBe("news.ycombinator.com");
    });
    it("handles whitespace and invalid inputs safely", () => {
        expect(getDomain("  https://reddit.com  ")).toBe("reddit.com");
        expect(getDomain("   ")).toBe("");
    });
});
