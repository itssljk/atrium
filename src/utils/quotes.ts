import { safeLocalStorage } from "./safeStorage";
import { getRandomCuratedQuote } from "@/config/curatedQuotes";

export interface LiveQuoteResult {
  quote: string;
  author: string;
  formatted: string;
}

const CACHE_KEY = "atrium-quotes-cache-v2";
const LEGACY_CACHE_KEYS = ["atrium-quotes-cache", "slate-quotes-cache"];
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const REQUEST_TIMEOUT_MS = 3000;

/**
 * Provider strategy:
 * - In the browser extension context, ZenQuotes provides live quotes via
 *   host_permissions.
 * - On the hosted website (or whenever offline / API unavailable), quotes are
 *   served from our curated collection of vetted, uplifting quotes. DummyJSON
 *   has been completely removed as its uncurated dataset contains inappropriate
 *   and test mock quotes.
 * - All quotes pass through a content safety filter before being displayed or cached.
 */
const ZENQUOTES_API_URL = "https://zenquotes.io/api/random";

interface CachedQuote {
  quote: string;
  author: string;
  timestamp: number;
}

interface ZenQuotesEntry {
  q: string;
  a: string;
}

/** Words / patterns that should never appear in greeting quotes. */
const BLOCKED_PATTERNS = /\b(lesbian|gay|homosexual|queer|sex|sexual|suicide|kill|killing|murder|die|dying|death|hell|devil|cock|bitch|ass|shit|bastard|hate|gun|weapon|drug|cancer|funeral)\b/i;

function isSafeQuote(quote: string): boolean {
  if (!quote || quote.length < 5 || quote.length > 280) return false;
  return !BLOCKED_PATTERNS.test(quote);
}

/** True when running inside the browser extension rather than the website. */
function isExtensionContext(): boolean {
  if (typeof window === "undefined") return false;
  const { protocol } = window.location;
  return protocol === "chrome-extension:" || protocol === "moz-extension:";
}

function buildResult(quote: string, author: string): LiveQuoteResult {
  return {
    quote,
    author,
    formatted:
      author && author !== "Unknown"
        ? `"${quote}" — ${author}`
        : `"${quote}"`,
  };
}

function parseZenQuotesQuote(data: unknown): LiveQuoteResult | null {
  const entries = data as ZenQuotesEntry[] | null;
  const entry = Array.isArray(entries) ? entries[0] : null;
  const quote = typeof entry?.q === "string" ? entry.q.trim() : "";
  if (!quote || !isSafeQuote(quote)) return null;
  const author = typeof entry?.a === "string" ? entry.a.trim() : "";
  return buildResult(quote, author);
}

/** Fetch one fresh quote from the provider matched to the current context. */
async function fetchFreshQuote(): Promise<LiveQuoteResult | null> {
  const extension = isExtensionContext();

  if (extension) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(ZENQUOTES_API_URL, { signal: controller.signal });
      if (res.ok) {
        const parsed = parseZenQuotesQuote(await res.json());
        if (parsed) return parsed;
      }
    } catch {
      // Fall through to curated quote on network failure / timeout
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Curated offline collection (used for web or when external API is unavailable)
  const curated = getRandomCuratedQuote();
  return buildResult(curated.quote, curated.author);
}

export async function getLiveQuote(): Promise<LiveQuoteResult | null> {
  // Purge legacy caches to eliminate any previously stored inappropriate quotes
  for (const legacyKey of LEGACY_CACHE_KEYS) {
    try {
      safeLocalStorage.removeItem(legacyKey);
    } catch {
      // Ignore storage errors
    }
  }

  // 1. Try reading from local cache
  try {
    const raw = safeLocalStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: CachedQuote = JSON.parse(raw);
      if (
        Date.now() - cached.timestamp < CACHE_TTL_MS &&
        cached.quote &&
        isSafeQuote(cached.quote)
      ) {
        return buildResult(cached.quote, cached.author ?? "");
      }
    }
  } catch {
    // Ignore cache parse errors
  }

  // 2. Fetch fresh quote and cache it
  const result = await fetchFreshQuote();
  if (result && isSafeQuote(result.quote)) {
    safeLocalStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        quote: result.quote,
        author: result.author,
        timestamp: Date.now(),
      })
    );
  }

  return result;
}
