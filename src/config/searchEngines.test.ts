import { describe, it, expect, beforeEach } from "vitest";
import { ENGINES, getEngines, parseSearchQuery, detectBang, getBangSuggestions, isSuggestEngine, supportsRemoteSuggestions, resolveSuggestUrl, suggestionTransport, } from "./searchEngines";
import { settings } from "@/utils/settings";
describe("searchEngines configuration", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });
    it("contains curated default engines with privacy metadata", () => {
        const ids = ENGINES.map((e) => e.id);
        expect(ids).toEqual(["google", "duckduckgo", "brave", "ecosia", "startpage"]);
        for (const engine of ENGINES) {
            expect(engine.name).toBeTruthy();
            expect(engine.domain).toBeTruthy();
            expect(engine.privacyLabel).toBeTruthy();
            expect(["private", "eco", "standard", "custom"]).toContain(engine.privacyLevel);
            expect(engine.privacyDetail).toBeTruthy();
        }
    });
    it("configures autocomplete for Google, DuckDuckGo, and Brave", () => {
        const suggestEngines = ENGINES.filter(isSuggestEngine);
        expect(suggestEngines.map((e) => e.id)).toEqual(["google", "duckduckgo", "brave"]);
        const [google, ddg, brave] = suggestEngines;
        expect(google.suggestUrl).toContain("suggestqueries.google.com");
        expect(ddg.suggestUrl).toContain("duckduckgo.com/ac");
        expect(brave.suggestUrl).toContain("search.brave.com/api/suggest");
        const payload = ["weather", ["weather radar", "weather channel"]];
        for (const engine of suggestEngines) {
            expect(engine.parseSuggestions?.(payload)).toEqual(["weather radar", "weather channel"]);
            expect(engine.parseSuggestions?.(null)).toEqual([]);
        }
    });
    it("supportsRemoteSuggestions gates on transport availability outside extensions", () => {
        const byId = Object.fromEntries(ENGINES.map((e) => [e.id, e]));
        expect(supportsRemoteSuggestions(byId.google)).toBe(true);
        expect(supportsRemoteSuggestions(byId.duckduckgo)).toBe(true);
        expect(supportsRemoteSuggestions(byId.brave)).toBe(true);
        expect(supportsRemoteSuggestions(byId.ecosia)).toBe(false);
        expect(isSuggestEngine(byId.startpage)).toBe(false);
        expect(supportsRemoteSuggestions(byId.startpage)).toBe(false);
    });
    it("resolveSuggestUrl and suggestionTransport pick per-build routes", () => {
        const [google, ddg, brave] = ENGINES.filter(isSuggestEngine);
        expect(suggestionTransport(google)).toBe("jsonp");
        expect(suggestionTransport(ddg)).toBe("fetch");
        expect(suggestionTransport(brave)).toBe("fetch");
        expect(resolveSuggestUrl(ddg)).toBe("/ddg-ac/ac/?type=list&q=");
        expect(resolveSuggestUrl(brave)).toBe("/brave-suggest/api/suggest?rich=false&q=");
    });
    it("getEngines returns default engines when no deletions exist", () => {
        const engines = getEngines();
        expect(engines.map((e) => e.id)).toEqual(["google", "duckduckgo", "brave", "ecosia", "startpage"]);
    });
    it("getEngines respects deleted engines and falls back to default if all deleted", () => {
        settings.set("deleted-engines", JSON.stringify(["duckduckgo", "brave"]));
        const remaining = getEngines();
        expect(remaining.map((e) => e.id)).toEqual(["google", "ecosia", "startpage"]);
        settings.set("deleted-engines", JSON.stringify(["google", "duckduckgo", "brave", "ecosia", "startpage"]));
        const fallback = getEngines();
        expect(fallback.length).toBe(1);
        expect(fallback[0].id).toBe("google");
    });
    it("parseSearchQuery routes standard queries and bangs correctly", () => {
        const google = ENGINES[0];
        const res = parseSearchQuery("test query", google);
        expect(res.url).toBe("https://www.google.com/search?q=test%20query");
        expect(res.isBang).toBe(false);
        const bangRes = parseSearchQuery("!ddg privacy test", google);
        expect(bangRes.isBang).toBe(true);
        expect(bangRes.url).toBe("https://duckduckgo.com/?q=privacy%20test");
        expect(bangRes.engineName).toBe("DuckDuckGo");
        const trailingRes = parseSearchQuery("react docs !gh", google);
        expect(trailingRes.isBang).toBe(true);
        expect(trailingRes.url).toBe("https://github.com/search?q=react%20docs");
        expect(trailingRes.engineName).toBe("GitHub");
    });
    it("routes bang queries with empty arguments to the service homepage", () => {
        const google = ENGINES[0];
        const ytRes = parseSearchQuery("!yt", google);
        expect(ytRes.isBang).toBe(true);
        expect(ytRes.url).toBe("https://youtube.com");
        expect(ytRes.engineName).toBe("YouTube");
        const ghRes = parseSearchQuery("!gh", google);
        expect(ghRes.isBang).toBe(true);
        expect(ghRes.url).toBe("https://github.com");
        expect(ghRes.engineName).toBe("GitHub");
        const ppxRes = parseSearchQuery("!ppx", google);
        expect(ppxRes.isBang).toBe(true);
        expect(ppxRes.url).toBe("https://perplexity.ai");
        expect(ppxRes.engineName).toBe("Perplexity");
    });
    it("supports popular aliases and Perplexity bang", () => {
        const google = ENGINES[0];
        expect(parseSearchQuery("!y lofi", google).url).toBe("https://www.youtube.com/results?search_query=lofi");
        expect(parseSearchQuery("!youtube lofi", google).url).toBe("https://www.youtube.com/results?search_query=lofi");
        expect(parseSearchQuery("!github atrium", google).url).toBe("https://github.com/search?q=atrium");
        expect(parseSearchQuery("!reddit webdev", google).url).toBe("https://www.reddit.com/search/?q=webdev");
        expect(parseSearchQuery("!perplexity deep learning", google).url).toBe("https://www.perplexity.ai/search?q=deep%20learning");
        expect(parseSearchQuery("!duck privacy", google).url).toBe("https://duckduckgo.com/?q=privacy");
        expect(parseSearchQuery("!google test", google).url).toBe("https://www.google.com/search?q=test");
    });
    it("detectBang detects leading and trailing bangs correctly", () => {
        expect(detectBang("!yt lofi")).toEqual({
            bangToken: "!yt",
            name: "YouTube",
            domain: "youtube.com",
            url: "https://www.youtube.com/results?search_query=%s",
            remainingQuery: "lofi",
            isTrailing: false,
        });
        expect(detectBang("lofi beats !yt")).toEqual({
            bangToken: "!yt",
            name: "YouTube",
            domain: "youtube.com",
            url: "https://www.youtube.com/results?search_query=%s",
            remainingQuery: "lofi beats",
            isTrailing: true,
        });
        expect(detectBang("just a normal search")).toBeNull();
        expect(detectBang("!unknownbang query")).toBeNull();
    });
    it("getBangSuggestions provides matching bangs for prefixes", () => {
        const suggestions = getBangSuggestions("!y");
        const bangs = suggestions.map((s) => s.bang);
        expect(bangs).toContain("!yt");
        expect(bangs).toContain("!y");
        expect(bangs).toContain("!youtube");
        const allPrompt = getBangSuggestions("!");
        expect(allPrompt.length).toBeGreaterThan(0);
        expect(allPrompt.length).toBeLessThanOrEqual(8);
    });
    it("supports user-defined custom bangs with priority over defaults", () => {
        const google = ENGINES[0];
        const customBangs = [
            {
                id: "kagi-1",
                bang: "!k",
                name: "Kagi",
                url: "https://kagi.com/search?q=%s",
                domain: "kagi.com",
            },
            {
                id: "wiki-de",
                bang: "!w",
                name: "Wikipedia (DE)",
                url: "https://de.wikipedia.org/wiki/Special:Search?search=%s",
                domain: "de.wikipedia.org",
            },
        ];
        const kagiRes = parseSearchQuery("!k privacy search", google, [], customBangs);
        expect(kagiRes.isBang).toBe(true);
        expect(kagiRes.engineName).toBe("Kagi");
        expect(kagiRes.url).toBe("https://kagi.com/search?q=privacy%20search");
        const kagiHome = parseSearchQuery("!k", google, [], customBangs);
        expect(kagiHome.url).toBe("https://kagi.com");
        const wikiRes = parseSearchQuery("!w berlin", google, [], customBangs);
        expect(wikiRes.engineName).toBe("Wikipedia (DE)");
        expect(wikiRes.url).toBe("https://de.wikipedia.org/wiki/Special:Search?search=berlin");
        const suggestions = getBangSuggestions("!w", 5, customBangs);
        expect(suggestions[0].bang).toBe("!w");
        expect(suggestions[0].name).toBe("Wikipedia (DE)");
        expect(suggestions[0].isCustom).toBe(true);
    });
    it("ignores deleted default bangs and routes queries to default engine", () => {
        const google = ENGINES[0];
        const deletedBangs = ["!yt", "!y", "!youtube"];
        const res = parseSearchQuery("!yt lofi", google, [], [], deletedBangs);
        expect(res.isBang).toBe(false);
        expect(res.engineName).toBe("Google");
        expect(res.url).toBe("https://www.google.com/search?q=!yt%20lofi");
        expect(detectBang("!yt lofi", [google], [], deletedBangs)).toBeNull();
        expect(detectBang("!y lofi", [google], [], deletedBangs)).toBeNull();
        const suggestions = getBangSuggestions("!y", 8, [], deletedBangs);
        const suggestionBangs = suggestions.map((s) => s.bang);
        expect(suggestionBangs).not.toContain("!yt");
        expect(suggestionBangs).not.toContain("!y");
        expect(suggestionBangs).not.toContain("!youtube");
        const restoredRes = parseSearchQuery("!yt lofi", google, [], [], []);
        expect(restoredRes.isBang).toBe(true);
        expect(restoredRes.engineName).toBe("YouTube");
        const customYouTube = [
            {
                id: "yt-custom",
                bang: "!yt",
                name: "Custom Invidious",
                url: "https://yewtu.be/search?q=%s",
                domain: "yewtu.be",
            },
        ];
        const customRes = parseSearchQuery("!yt lofi", google, [], customYouTube, deletedBangs);
        expect(customRes.isBang).toBe(true);
        expect(customRes.engineName).toBe("Custom Invidious");
        expect(customRes.url).toBe("https://yewtu.be/search?q=lofi");
    });
});
