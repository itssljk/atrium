import { describe, it, expect } from "vitest";
import { getLiveQuote } from "./quotes";
import { getRandomCuratedQuote, CURATED_QUOTES } from "@/config/curatedQuotes";
describe("quotes utilities", () => {
    it("curated collection has multiple inspiring quotes", () => {
        expect(CURATED_QUOTES.length).toBeGreaterThan(10);
        for (const item of CURATED_QUOTES) {
            expect(item.quote.length).toBeGreaterThan(5);
            expect(item.author.length).toBeGreaterThan(1);
        }
    });
    it("getRandomCuratedQuote returns a valid quote and author", () => {
        const q = getRandomCuratedQuote();
        expect(q).toBeDefined();
        expect(q.quote).toBeTruthy();
        expect(q.author).toBeTruthy();
    });
    it("getLiveQuote falls back to curated collection in non-extension environment", async () => {
        const quote = await getLiveQuote();
        expect(quote).not.toBeNull();
        expect(quote?.quote).toBeTruthy();
        expect(quote?.formatted).toContain(quote?.quote);
        if (quote?.author && quote.author !== "Unknown") {
            expect(quote.formatted).toContain(`"${quote.quote}" — ${quote.author}`);
        }
    });
});
