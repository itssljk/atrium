import { settings } from "./settings";
export interface BingWallpaperData {
    url: string;
    title: string;
    copyright: string;
    copyrightLink: string;
    date: string;
    updatedAt: number;
}
export function getTodayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
}
export function getCachedBingWallpaper(): BingWallpaperData | null {
    if (typeof window === "undefined")
        return null;
    try {
        const raw = settings.get("bg-bing-cache");
        if (!raw)
            return null;
        const data: BingWallpaperData = JSON.parse(raw);
        if (!data || !data.url)
            return null;
        const today = getTodayDateString();
        if (data.date === today) {
            return data;
        }
        if (data.updatedAt && Date.now() - data.updatedAt < 18 * 3600 * 1000) {
            return data;
        }
        return null;
    }
    catch (err) {
        console.warn("Failed to read Bing wallpaper cache:", err);
        return null;
    }
}
interface RawBingImage {
    startdate?: string;
    url?: string;
    copyright?: string;
    copyrightlink?: string;
    title?: string;
}
interface RawBiturlResponse {
    start_date?: string;
    url?: string;
    copyright?: string;
    copyright_link?: string;
}
function parseBingData(raw: RawBingImage | RawBiturlResponse): BingWallpaperData | null {
    const rawUrl = raw.url;
    if (!rawUrl)
        return null;
    const url = rawUrl.startsWith("http") ? rawUrl : `https://www.bing.com${rawUrl}`;
    const date = ("startdate" in raw && raw.startdate) ||
        ("start_date" in raw && raw.start_date) ||
        getTodayDateString();
    let title = ("title" in raw && raw.title?.trim()) || "";
    const copyright = raw.copyright?.trim() || "Bing Daily Wallpaper";
    const copyrightLink = ("copyrightlink" in raw && raw.copyrightlink) ||
        ("copyright_link" in raw && raw.copyright_link) ||
        `https://www.bing.com/search?q=${encodeURIComponent(title || copyright)}`;
    if (!title && copyright) {
        const parenIndex = copyright.indexOf(" (");
        title = parenIndex > 0 ? copyright.slice(0, parenIndex) : copyright;
    }
    return {
        url,
        title,
        copyright,
        copyrightLink,
        date,
        updatedAt: Date.now(),
    };
}
export async function fetchBingWallpaper(forceRefresh = false): Promise<BingWallpaperData> {
    if (!forceRefresh) {
        const cached = getCachedBingWallpaper();
        if (cached)
            return cached;
    }
    const endpoints = [
        "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US",
        typeof window !== "undefined" && window.location.hostname === "localhost"
            ? "/bing-api/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US"
            : null,
        "https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=en-US",
    ].filter(Boolean) as string[];
    let lastError: unknown = null;
    for (const endpoint of endpoints) {
        try {
            const res = await fetch(endpoint, {
                headers: {
                    Accept: "application/json",
                },
            });
            if (!res.ok)
                continue;
            const data = await res.json();
            let parsed: BingWallpaperData | null = null;
            if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
                parsed = parseBingData(data.images[0]);
            }
            else if (data?.url) {
                parsed = parseBingData(data);
            }
            if (parsed) {
                settings.set("bg-bing-cache", JSON.stringify(parsed));
                return parsed;
            }
        }
        catch (err) {
            lastError = err;
        }
    }
    try {
        const staleRaw = settings.get("bg-bing-cache");
        if (staleRaw) {
            const staleData: BingWallpaperData = JSON.parse(staleRaw);
            if (staleData?.url)
                return staleData;
        }
    }
    catch { }
    throw lastError || new Error("Failed to load Bing Daily Wallpaper");
}
