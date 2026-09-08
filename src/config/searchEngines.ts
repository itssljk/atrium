import { settings } from "@/utils/settings";
import type { CustomBang } from "@/settings/types";
export type PrivacyLevel = "private" | "eco" | "standard" | "custom";
export interface SearchEngine {
    id: string;
    name: string;
    url: string;
    domain: string;
    suggestUrl?: string;
    parseSuggestions?: (data: unknown) => string[];
    jsonpCallbackParam?: string;
    supportsJsonp?: boolean;
    webSuggestPath?: string;
    defaultEnabled?: boolean;
    privacyLabel: string;
    privacyLevel: PrivacyLevel;
    privacyDetail?: string;
}
export interface SuggestEngine extends SearchEngine {
    suggestUrl: string;
    parseSuggestions: (data: unknown) => string[];
    jsonpCallbackParam?: string;
}
export function isExtensionContext(): boolean {
    return typeof window !== "undefined" && (window.location.protocol === "chrome-extension:" ||
        window.location.protocol === "moz-extension:");
}
export interface BangDefinition {
    bang: string;
    name: string;
    url: string;
    domain: string;
    alias?: boolean;
}
export const DEFAULT_WEB_ENGINE_ID = "google";
export const SEARCH_BANGS: Record<string, BangDefinition> = {
    "!g": { bang: "!g", name: "Google", url: "https://www.google.com/search?q=%s", domain: "google.com" },
    "!google": { bang: "!google", name: "Google", url: "https://www.google.com/search?q=%s", domain: "google.com", alias: true },
    "!ddg": { bang: "!ddg", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s", domain: "duckduckgo.com" },
    "!duck": { bang: "!duck", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s", domain: "duckduckgo.com", alias: true },
    "!b": { bang: "!b", name: "Brave Search", url: "https://search.brave.com/search?q=%s", domain: "brave.com" },
    "!brave": { bang: "!brave", name: "Brave Search", url: "https://search.brave.com/search?q=%s", domain: "brave.com", alias: true },
    "!bing": { bang: "!bing", name: "Bing", url: "https://www.bing.com/search?q=%s", domain: "bing.com" },
    "!yt": { bang: "!yt", name: "YouTube", url: "https://www.youtube.com/results?search_query=%s", domain: "youtube.com" },
    "!y": { bang: "!y", name: "YouTube", url: "https://www.youtube.com/results?search_query=%s", domain: "youtube.com", alias: true },
    "!youtube": { bang: "!youtube", name: "YouTube", url: "https://www.youtube.com/results?search_query=%s", domain: "youtube.com", alias: true },
    "!w": { bang: "!w", name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Special:Search?search=%s", domain: "wikipedia.org" },
    "!wiki": { bang: "!wiki", name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Special:Search?search=%s", domain: "wikipedia.org", alias: true },
    "!gh": { bang: "!gh", name: "GitHub", url: "https://github.com/search?q=%s", domain: "github.com" },
    "!github": { bang: "!github", name: "GitHub", url: "https://github.com/search?q=%s", domain: "github.com", alias: true },
    "!r": { bang: "!r", name: "Reddit", url: "https://www.reddit.com/search/?q=%s", domain: "reddit.com" },
    "!reddit": { bang: "!reddit", name: "Reddit", url: "https://www.reddit.com/search/?q=%s", domain: "reddit.com", alias: true },
    "!a": { bang: "!a", name: "Amazon", url: "https://www.amazon.com/s?k=%s", domain: "amazon.com" },
    "!amazon": { bang: "!amazon", name: "Amazon", url: "https://www.amazon.com/s?k=%s", domain: "amazon.com", alias: true },
    "!m": { bang: "!m", name: "Google Maps", url: "https://www.google.com/maps/search/%s", domain: "google.com" },
    "!maps": { bang: "!maps", name: "Google Maps", url: "https://www.google.com/maps/search/%s", domain: "google.com", alias: true },
    "!eco": { bang: "!eco", name: "Ecosia", url: "https://www.ecosia.org/search?q=%s", domain: "ecosia.org" },
    "!ecosia": { bang: "!ecosia", name: "Ecosia", url: "https://www.ecosia.org/search?q=%s", domain: "ecosia.org", alias: true },
    "!sp": { bang: "!sp", name: "Startpage", url: "https://www.startpage.com/sp/search?q=%s", domain: "startpage.com" },
    "!startpage": { bang: "!startpage", name: "Startpage", url: "https://www.startpage.com/sp/search?q=%s", domain: "startpage.com", alias: true },
    "!x": { bang: "!x", name: "X (Twitter)", url: "https://x.com/search?q=%s&src=typed_query", domain: "x.com" },
    "!tw": { bang: "!tw", name: "X (Twitter)", url: "https://x.com/search?q=%s&src=typed_query", domain: "x.com", alias: true },
    "!so": { bang: "!so", name: "Stack Overflow", url: "https://stackoverflow.com/search?q=%s", domain: "stackoverflow.com" },
    "!npm": { bang: "!npm", name: "npm", url: "https://www.npmjs.com/search?q=%s", domain: "npmjs.com" },
    "!mdn": { bang: "!mdn", name: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/search?q=%s", domain: "developer.mozilla.org" },
    "!imdb": { bang: "!imdb", name: "IMDb", url: "https://www.imdb.com/find/?q=%s", domain: "imdb.com" },
    "!hn": { bang: "!hn", name: "Hacker News", url: "https://hn.algolia.com/?q=%s", domain: "news.ycombinator.com" },
    "!wa": { bang: "!wa", name: "Wolfram|Alpha", url: "https://www.wolframalpha.com/input?i=%s", domain: "wolframalpha.com" },
    "!d": { bang: "!d", name: "Dictionary.com", url: "https://www.dictionary.com/browse/%s", domain: "dictionary.com" },
    "!urban": { bang: "!urban", name: "Urban Dictionary", url: "https://www.urbandictionary.com/define.php?term=%s", domain: "urbandictionary.com" },
    "!scholar": { bang: "!scholar", name: "Google Scholar", url: "https://scholar.google.com/scholar?q=%s", domain: "scholar.google.com" },
    "!news": { bang: "!news", name: "Google News", url: "https://news.google.com/search?q=%s", domain: "news.google.com" },
    "!finance": { bang: "!finance", name: "Google Finance", url: "https://www.google.com/finance/search?q=%s", domain: "google.com" },
    "!ebay": { bang: "!ebay", name: "eBay", url: "https://www.ebay.com/sch/i.html?_nkw=%s", domain: "ebay.com" },
    "!twitch": { bang: "!twitch", name: "Twitch", url: "https://www.twitch.tv/search?term=%s", domain: "twitch.tv" },
    "!spotify": { bang: "!spotify", name: "Spotify", url: "https://open.spotify.com/search/%s", domain: "spotify.com" },
    "!gpt": { bang: "!gpt", name: "ChatGPT", url: "https://chatgpt.com/?q=%s", domain: "chatgpt.com" },
    "!claude": { bang: "!claude", name: "Claude", url: "https://claude.ai/new?q=%s", domain: "claude.ai" },
    "!ppx": { bang: "!ppx", name: "Perplexity", url: "https://www.perplexity.ai/search?q=%s", domain: "perplexity.ai" },
    "!perplexity": { bang: "!perplexity", name: "Perplexity", url: "https://www.perplexity.ai/search?q=%s", domain: "perplexity.ai", alias: true },
    "!ph": { bang: "!ph", name: "Product Hunt", url: "https://www.producthunt.com/search?q=%s", domain: "producthunt.com" },
    "!arxiv": { bang: "!arxiv", name: "arXiv", url: "https://arxiv.org/search/?query=%s&searchtype=all", domain: "arxiv.org" },
    "!py": { bang: "!py", name: "Python Docs", url: "https://docs.python.org/3/search.html?q=%s", domain: "docs.python.org" },
};
export function isSuggestEngine(e: SearchEngine): e is SuggestEngine {
    return !!e.suggestUrl && !!e.parseSuggestions;
}
export function supportsRemoteSuggestions(e: SearchEngine): e is SuggestEngine {
    if (!isSuggestEngine(e))
        return false;
    return isExtensionContext() || !!e.supportsJsonp || !!e.webSuggestPath;
}
export function resolveSuggestUrl(e: SuggestEngine): string {
    if (isExtensionContext() || !e.webSuggestPath) {
        return e.suggestUrl;
    }
    return e.webSuggestPath;
}
export function suggestionTransport(e: SuggestEngine): "fetch" | "jsonp" {
    if (isExtensionContext())
        return "fetch";
    return e.webSuggestPath ? "fetch" : "jsonp";
}
function parseGoogleSuggest(data: unknown): string[] {
    const arr = data as [
        string,
        string[]
    ];
    return arr?.[1] ?? [];
}
function jsonpFetch(url: string, callbackParam: string, timeoutMs = 5000): Promise<unknown> {
    const callbackName = `_atrium_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("JSONP timeout"));
        }, timeoutMs);
        const cleanup = () => {
            clearTimeout(timeout);
            (window as unknown as Record<string, unknown>)[callbackName] = () => {
                try {
                    delete (window as unknown as Record<string, unknown>)[callbackName];
                }
                catch {
                    (window as unknown as Record<string, unknown>)[callbackName] = undefined;
                }
            };
            if (script.parentNode)
                script.parentNode.removeChild(script);
        };
        (window as unknown as Record<string, unknown>)[callbackName] = (data: unknown) => {
            cleanup();
            try {
                delete (window as unknown as Record<string, unknown>)[callbackName];
            }
            catch {
                (window as unknown as Record<string, unknown>)[callbackName] = undefined;
            }
            resolve(data);
        };
        script.src = `${url}${callbackParam}${callbackName}`;
        script.onerror = () => {
            cleanup();
            reject(new Error("JSONP script error"));
        };
        document.head.appendChild(script);
    });
}
export async function fetchSuggestion(url: string, callbackParam: string, transport: "fetch" | "jsonp" = "fetch"): Promise<unknown> {
    if (transport === "jsonp") {
        return jsonpFetch(url, callbackParam);
    }
    let res = await fetch(url);
    if (res.status === 429 || res.status === 503) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        res = await fetch(url);
    }
    if (!res.ok) {
        throw new Error(`Fetch suggestion failed (${res.status})`);
    }
    return await res.json();
}
export const ENGINES: SearchEngine[] = [
    {
        id: "google",
        name: "Google",
        url: "https://www.google.com/search?q=%s",
        domain: "google.com",
        suggestUrl: "https://suggestqueries.google.com/complete/search?client=chrome&q=",
        parseSuggestions: parseGoogleSuggest,
        jsonpCallbackParam: "&callback=",
        supportsJsonp: true,
        privacyLabel: "Standard",
        privacyLevel: "standard",
        privacyDetail: "Personalized search & query logging",
    },
    {
        id: "duckduckgo",
        name: "DuckDuckGo",
        url: "https://duckduckgo.com/?q=%s",
        domain: "duckduckgo.com",
        suggestUrl: "https://duckduckgo.com/ac/?type=list&q=",
        parseSuggestions: parseGoogleSuggest,
        supportsJsonp: false,
        webSuggestPath: "/ddg-ac/ac/?type=list&q=",
        privacyLabel: "Zero Tracking",
        privacyLevel: "private",
        privacyDetail: "No search history or IP tracking",
    },
    {
        id: "brave",
        name: "Brave Search",
        url: "https://search.brave.com/search?q=%s",
        domain: "brave.com",
        suggestUrl: "https://search.brave.com/api/suggest?rich=false&q=",
        parseSuggestions: parseGoogleSuggest,
        supportsJsonp: false,
        webSuggestPath: "/brave-suggest/api/suggest?rich=false&q=",
        privacyLabel: "Independent",
        privacyLevel: "private",
        privacyDetail: "Private index & zero profiling",
    },
    {
        id: "ecosia",
        name: "Ecosia",
        url: "https://www.ecosia.org/search?q=%s",
        domain: "ecosia.org",
        privacyLabel: "Eco · Private",
        privacyLevel: "eco",
        privacyDetail: "100% renewable, plants trees",
    },
    {
        id: "startpage",
        name: "Startpage",
        url: "https://www.startpage.com/sp/search?q=%s",
        domain: "startpage.com",
        privacyLabel: "Anonymous",
        privacyLevel: "private",
        privacyDetail: "Google results with total privacy",
    },
];
function loadCustomEngines(): SearchEngine[] {
    if (typeof window === "undefined")
        return [];
    try {
        const saved = settings.get("custom-engines");
        if (!saved)
            return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed))
            return [];
        return parsed.map((e: {
            id?: string;
            name?: string;
            url?: string;
            domain?: string;
        }) => ({
            id: e.id || `custom-${Date.now()}`,
            name: e.name || "Custom",
            url: e.url || "https://www.google.com/search?q=%s",
            domain: e.domain || "example.com",
            privacyLabel: "Custom",
            privacyLevel: "custom" as PrivacyLevel,
            privacyDetail: "Custom user-configured engine",
        }));
    }
    catch {
        return [];
    }
}
export function getEngines(): SearchEngine[] {
    const all = [...ENGINES, ...loadCustomEngines()];
    if (typeof window === "undefined")
        return all;
    try {
        let deletedIds: string[] = [];
        const saved = settings.get("deleted-engines");
        if (saved) {
            deletedIds = JSON.parse(saved);
        }
        else {
            const oldDisabled = settings.get("disabled-engines");
            if (oldDisabled) {
                deletedIds = JSON.parse(oldDisabled);
                settings.set("deleted-engines", JSON.stringify(deletedIds));
                settings.remove("disabled-engines");
            }
        }
        if (!Array.isArray(deletedIds))
            return all;
        const filtered = all.filter((e) => !deletedIds.includes(e.id));
        return filtered.length > 0 ? filtered : [ENGINES[0]];
    }
    catch {
        return all;
    }
}
export function loadCustomBangs(): CustomBang[] {
    if (typeof window === "undefined")
        return [];
    try {
        const saved = settings.get("custom-bangs");
        if (!saved)
            return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed))
            return [];
        return parsed.filter((b: unknown): b is CustomBang => typeof b === "object" &&
            b !== null &&
            typeof (b as CustomBang).id === "string" &&
            typeof (b as CustomBang).bang === "string" &&
            typeof (b as CustomBang).name === "string" &&
            typeof (b as CustomBang).url === "string");
    }
    catch {
        return [];
    }
}
export function loadDeletedBangs(): string[] {
    if (typeof window === "undefined")
        return [];
    try {
        const saved = settings.get("deleted-bangs");
        if (!saved)
            return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed))
            return [];
        return parsed.filter((v): v is string => typeof v === "string");
    }
    catch {
        return [];
    }
}
export interface ResolvedBang {
    bang: string;
    name: string;
    domain: string;
    url: string;
    isCustom?: boolean;
}
export function resolveBang(bangToken: string, customOrLoadedEngines: SearchEngine[] = [], customBangs?: CustomBang[], deletedBangs?: string[]): ResolvedBang | null {
    const lower = bangToken.toLowerCase();
    const bangs = customBangs ?? loadCustomBangs();
    const deleted = (deletedBangs ?? loadDeletedBangs()).map((d) => d.toLowerCase());
    const matchedCustomBang = bangs.find((b) => b.bang.toLowerCase() === lower);
    if (matchedCustomBang) {
        return {
            bang: matchedCustomBang.bang,
            name: matchedCustomBang.name,
            domain: matchedCustomBang.domain,
            url: matchedCustomBang.url,
            isCustom: true,
        };
    }
    if (SEARCH_BANGS[lower] && !deleted.includes(lower)) {
        const def = SEARCH_BANGS[lower];
        return {
            bang: def.bang,
            name: def.name,
            domain: def.domain,
            url: def.url,
        };
    }
    const rawBang = lower.startsWith("!") ? lower.slice(1) : lower;
    const matchedEngine = customOrLoadedEngines.find((e) => e.id.toLowerCase() === rawBang ||
        e.name.toLowerCase().replace(/\s+/g, "") === rawBang);
    if (matchedEngine) {
        return {
            bang: `!${rawBang}`,
            name: matchedEngine.name,
            domain: matchedEngine.domain,
            url: matchedEngine.url,
            isCustom: matchedEngine.privacyLevel === "custom",
        };
    }
    return null;
}
export interface DetectedBangInfo {
    bangToken: string;
    name: string;
    domain: string;
    url: string;
    remainingQuery: string;
    isTrailing: boolean;
    isCustom?: boolean;
}
export function detectBang(rawQuery: string, customOrLoadedEngines: SearchEngine[] = [], customBangs?: CustomBang[], deletedBangs?: string[]): DetectedBangInfo | null {
    const trimmed = rawQuery.trim();
    if (!trimmed)
        return null;
    const parts = trimmed.split(/\s+/);
    if (parts.length === 0)
        return null;
    if (parts[0].startsWith("!") && parts[0].length > 1) {
        const resolved = resolveBang(parts[0], customOrLoadedEngines, customBangs, deletedBangs);
        if (resolved) {
            return {
                bangToken: parts[0].toLowerCase(),
                name: resolved.name,
                domain: resolved.domain,
                url: resolved.url,
                remainingQuery: parts.slice(1).join(" "),
                isTrailing: false,
                isCustom: resolved.isCustom,
            };
        }
    }
    if (parts.length > 1 && parts[parts.length - 1].startsWith("!") && parts[parts.length - 1].length > 1) {
        const lastToken = parts[parts.length - 1];
        const resolved = resolveBang(lastToken, customOrLoadedEngines, customBangs, deletedBangs);
        if (resolved) {
            return {
                bangToken: lastToken.toLowerCase(),
                name: resolved.name,
                domain: resolved.domain,
                url: resolved.url,
                remainingQuery: parts.slice(0, -1).join(" "),
                isTrailing: true,
                isCustom: resolved.isCustom,
            };
        }
    }
    return null;
}
export interface BangSuggestion {
    bang: string;
    name: string;
    domain: string;
    isCustom?: boolean;
}
export function getBangSuggestions(prefix: string, max = 8, customBangs?: CustomBang[], deletedBangs?: string[]): BangSuggestion[] {
    const clean = prefix.trim().toLowerCase();
    if (!clean.startsWith("!"))
        return [];
    const query = clean.slice(1);
    const results: BangSuggestion[] = [];
    const seenBangs = new Set<string>();
    const bangs = customBangs ?? loadCustomBangs();
    const deleted = (deletedBangs ?? loadDeletedBangs()).map((d) => d.toLowerCase());
    for (const b of bangs) {
        const key = b.bang.toLowerCase();
        const keyWithoutBang = key.slice(1);
        const matchesPrefix = query === "" ||
            keyWithoutBang.startsWith(query) ||
            b.name.toLowerCase().startsWith(query);
        if (matchesPrefix && !seenBangs.has(key)) {
            seenBangs.add(key);
            results.push({
                bang: b.bang,
                name: b.name,
                domain: b.domain,
                isCustom: true,
            });
            if (results.length >= max)
                return results;
        }
    }
    for (const [key, def] of Object.entries(SEARCH_BANGS)) {
        if (deleted.includes(key.toLowerCase()))
            continue;
        const keyWithoutBang = key.slice(1);
        const matchesPrefix = query === "" ||
            keyWithoutBang.startsWith(query) ||
            def.name.toLowerCase().startsWith(query);
        if (matchesPrefix && !seenBangs.has(key)) {
            seenBangs.add(key);
            results.push({
                bang: key,
                name: def.name,
                domain: def.domain,
            });
            if (results.length >= max)
                break;
        }
    }
    return results;
}
export function parseSearchQuery(rawQuery: string, defaultEngine: SearchEngine, customOrLoadedEngines: SearchEngine[] = [], customBangs?: CustomBang[], deletedBangs?: string[]): {
    url: string;
    isBang: boolean;
    engineName: string;
} {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
        return { url: "", isBang: false, engineName: defaultEngine.name };
    }
    const detected = detectBang(trimmed, customOrLoadedEngines, customBangs, deletedBangs);
    if (detected) {
        const targetQuery = detected.remainingQuery.trim();
        let finalUrl: string;
        if (!targetQuery) {
            finalUrl = `https://${detected.domain}`;
        }
        else {
            const replaced = detected.url.replace("%s", encodeURIComponent(targetQuery));
            finalUrl = /^https?:\/\//i.test(replaced) ? replaced : "https://" + replaced;
        }
        return {
            url: finalUrl,
            isBang: true,
            engineName: detected.name,
        };
    }
    let finalUrl = defaultEngine.url.replace("%s", encodeURIComponent(trimmed));
    if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = "https://" + finalUrl;
    }
    return {
        url: finalUrl,
        isBang: false,
        engineName: defaultEngine.name,
    };
}
export function faviconUrl(domain: string, size = 64): string {
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`;
}
const suggestionCache = new Map<string, string[]>();
const SUGGESTION_CACHE_MAX = 128;
export async function fetchSuggestionsForEngine(e: SuggestEngine, query: string): Promise<string[]> {
    const cacheKey = `${e.id}:${query}`;
    const cached = suggestionCache.get(cacheKey);
    if (cached)
        return cached;
    const url = `${resolveSuggestUrl(e)}${encodeURIComponent(query)}`;
    const transport = suggestionTransport(e);
    const data = await fetchSuggestion(url, e.jsonpCallbackParam || "&callback=", transport);
    const parsed = e.parseSuggestions(data).slice(0, 8);
    if (suggestionCache.size >= SUGGESTION_CACHE_MAX) {
        const oldest = suggestionCache.keys().next().value;
        if (oldest !== undefined)
            suggestionCache.delete(oldest);
    }
    suggestionCache.set(cacheKey, parsed);
    return parsed;
}
