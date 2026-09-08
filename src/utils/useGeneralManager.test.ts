import { describe, it, expect } from "vitest";
import { getMailUrl, getMailName, MAIL_PROVIDERS } from "./useGeneralManager";
describe("useGeneralManager mail helpers", () => {
    it("provides correct URLs for standard providers", () => {
        expect(getMailUrl("gmail", "")).toBe("https://mail.google.com");
        expect(getMailUrl("outlook", "")).toBe("https://outlook.live.com/mail/");
        expect(getMailUrl("yahoo", "")).toBe("https://mail.yahoo.com");
        expect(getMailUrl("proton", "")).toBe("https://mail.proton.me");
        expect(getMailUrl("icloud", "")).toBe("https://www.icloud.com/mail");
        expect(getMailUrl("fastmail", "")).toBe("https://app.fastmail.com");
    });
    it("handles custom mail URL with and without protocol", () => {
        expect(getMailUrl("custom", "https://mail.example.com")).toBe("https://mail.example.com");
        expect(getMailUrl("custom", "mail.example.com")).toBe("https://mail.example.com");
        expect(getMailUrl("custom", "mailto:user@example.com")).toBe("mailto:user@example.com");
        expect(getMailUrl("custom", "   ")).toBe("https://mail.google.com");
    });
    it("returns proper labels via getMailName", () => {
        expect(getMailName("gmail")).toBe("Gmail");
        expect(getMailName("outlook")).toBe("Outlook");
        expect(getMailName("proton")).toBe("Proton");
        expect(getMailName("custom")).toBe("Custom Mail");
    });
});
