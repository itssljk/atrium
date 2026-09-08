import { hslToHex } from "./accent";
import { settings } from "./settings";
import { getBackgroundBlob } from "./backgroundDb";
import { getCachedBingWallpaper } from "./bingWallpaper";
import { CURATED_BACKGROUNDS } from "./backgrounds";
export interface ExtractedAccent {
    dark: string;
}
export const DEFAULT_AUTO_ACCENT: ExtractedAccent = {
    dark: "#7ca38e",
};
const CURATED_ACCENTS: Record<string, ExtractedAccent> = {
    tokyo: { dark: "#f97316" },
    newyork: { dark: "#fb923c" },
    singapore: { dark: "#a78bfa" },
    paris: { dark: "#f472b6" },
    london: { dark: "#38bdf8" },
    goldengate: { dark: "#ea580c" },
    rome: { dark: "#eab308" },
    istanbul: { dark: "#f59e0b" },
    mountains: { dark: "#7ca38e" },
    forest: { dark: "#78a774" },
    alpine: { dark: "#818cf8" },
    mistypines: { dark: "#5da785" },
    beach: { dark: "#e59866" },
    castle: { dark: "#a88b7d" },
    lonetree: { dark: "#8fad88" },
    stillwater: { dark: "#60a5fa" },
    space: { dark: "#a78bfa" },
    desert: { dark: "#e0a25d" },
    stars: { dark: "#7096d1" },
    abstract: { dark: "#e27979" },
    branches: { dark: "#8fad88" },
    cyberpunk: { dark: "#c084fc" },
    milkyway: { dark: "#818cf8" },
    neonstreet: { dark: "#38bdf8" },
    benjaminvoros: { dark: "#818cf8" },
    fuji: { dark: "#f472b6" },
    oceanwaves: { dark: "#2dd4bf" },
};
function rgbToHsl(r: number, g: number, b: number): {
    h: number;
    s: number;
    l: number;
} {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}
const accentCacheByUrl = new Map<string, Promise<ExtractedAccent>>();
const accentCacheByBlob = new WeakMap<Blob, Promise<ExtractedAccent>>();
const ACCENT_CACHE_MAX = 24;
export function extractAccentFromImage(imageSource: string | Blob): Promise<ExtractedAccent> {
    if (typeof imageSource === "string") {
        const cached = accentCacheByUrl.get(imageSource);
        if (cached)
            return cached;
        const promise = extractAccentFromImageUncached(imageSource);
        if (accentCacheByUrl.size >= ACCENT_CACHE_MAX)
            accentCacheByUrl.clear();
        accentCacheByUrl.set(imageSource, promise);
        promise.catch(() => accentCacheByUrl.delete(imageSource));
        return promise;
    }
    const cached = accentCacheByBlob.get(imageSource);
    if (cached)
        return cached;
    const promise = extractAccentFromImageUncached(imageSource);
    accentCacheByBlob.set(imageSource, promise);
    return promise;
}
async function extractAccentFromImageUncached(imageSource: string | Blob): Promise<ExtractedAccent> {
    if (typeof window === "undefined")
        return DEFAULT_AUTO_ACCENT;
    if (typeof imageSource === "string") {
        for (const [id, accent] of Object.entries(CURATED_ACCENTS)) {
            if (imageSource.includes(id)) {
                return accent;
            }
        }
        const match = CURATED_BACKGROUNDS.find((bg) => bg.url === imageSource || imageSource.includes(bg.id) || bg.url.split("?")[0] === imageSource.split("?")[0]);
        if (match && CURATED_ACCENTS[match.id]) {
            return CURATED_ACCENTS[match.id];
        }
    }
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        let objectUrlToRevoke: string | null = null;
        let timer: ReturnType<typeof setTimeout> | null = null;
        if (imageSource instanceof Blob) {
            objectUrlToRevoke = URL.createObjectURL(imageSource);
            img.src = objectUrlToRevoke;
        }
        else {
            img.src = imageSource;
        }
        const cleanup = () => {
            if (timer)
                clearTimeout(timer);
            if (objectUrlToRevoke) {
                URL.revokeObjectURL(objectUrlToRevoke);
            }
        };
        timer = setTimeout(() => {
            cleanup();
            resolve(DEFAULT_AUTO_ACCENT);
        }, 3000);
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const size = 48;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                if (!ctx) {
                    cleanup();
                    resolve(DEFAULT_AUTO_ACCENT);
                    return;
                }
                ctx.drawImage(img, 0, 0, size, size);
                const imageData = ctx.getImageData(0, 0, size, size);
                const data = imageData.data;
                interface Bucket {
                    count: number;
                    hSum: number;
                    sSum: number;
                    lSum: number;
                }
                const buckets: Bucket[] = Array.from({ length: 24 }, () => ({
                    count: 0,
                    hSum: 0,
                    sSum: 0,
                    lSum: 0,
                }));
                let totalChromaticPixels = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];
                    if (a < 128)
                        continue;
                    const { h, s, l } = rgbToHsl(r, g, b);
                    if (s < 18 || l < 18 || l > 88)
                        continue;
                    const bucketIdx = Math.min(23, Math.floor(h / 15));
                    const bucket = buckets[bucketIdx];
                    bucket.count += 1;
                    bucket.hSum += h;
                    bucket.sSum += s;
                    bucket.lSum += l;
                    totalChromaticPixels += 1;
                }
                cleanup();
                if (totalChromaticPixels < 40) {
                    const neutralAccent: ExtractedAccent = {
                        dark: "#94A3B8",
                    };
                    resolve(neutralAccent);
                    return;
                }
                let bestBucket: Bucket | null = null;
                let highestScore = -1;
                for (const bucket of buckets) {
                    if (bucket.count === 0)
                        continue;
                    const avgS = bucket.sSum / bucket.count;
                    const avgL = bucket.lSum / bucket.count;
                    const satWeight = Math.max(0.2, 1 - Math.abs(avgS - 60) / 60);
                    const lightWeight = Math.max(0.1, 1 - Math.abs(avgL - 55) / 45);
                    const score = bucket.count * satWeight * lightWeight;
                    if (score > highestScore) {
                        highestScore = score;
                        bestBucket = bucket;
                    }
                }
                if (!bestBucket) {
                    resolve(DEFAULT_AUTO_ACCENT);
                    return;
                }
                const avgH = Math.round(bestBucket.hSum / bestBucket.count);
                const avgS = Math.round(bestBucket.sSum / bestBucket.count);
                const avgL = Math.round(bestBucket.lSum / bestBucket.count);
                const finalDarkL = Math.max(52, Math.min(avgL, 66));
                const finalDarkS = Math.max(30, Math.min(avgS, 65));
                const darkHex = hslToHex(avgH, finalDarkS, finalDarkL);
                resolve({ dark: darkHex });
            }
            catch (err) {
                console.warn("Auto accent extraction fallback:", err);
                cleanup();
                resolve(DEFAULT_AUTO_ACCENT);
            }
        };
        img.onerror = () => {
            cleanup();
            resolve(DEFAULT_AUTO_ACCENT);
        };
    });
}
async function toAnalysisSafeSource(imageSource: string | Blob): Promise<string | Blob> {
    if (typeof imageSource !== "string")
        return imageSource;
    if (!/^https?:\/\//i.test(imageSource))
        return imageSource;
    try {
        const res = await fetch(imageSource, { mode: "cors" });
        if (res.ok)
            return await res.blob();
    }
    catch {
    }
    return imageSource;
}
export async function getActiveBackgroundAccent(): Promise<ExtractedAccent> {
    if (typeof window === "undefined")
        return DEFAULT_AUTO_ACCENT;
    const bgType = settings.get("bg-type", "default");
    if (bgType === "default") {
        return DEFAULT_AUTO_ACCENT;
    }
    if (bgType === "curated") {
        const url = settings.get("bg-curated-url", "");
        if (!url)
            return DEFAULT_AUTO_ACCENT;
        return extractAccentFromImage(url);
    }
    if (bgType === "upload") {
        try {
            const blob = await getBackgroundBlob();
            if (!blob)
                return DEFAULT_AUTO_ACCENT;
            return extractAccentFromImage(blob);
        }
        catch {
            return DEFAULT_AUTO_ACCENT;
        }
    }
    if (bgType === "bing") {
        const cached = getCachedBingWallpaper();
        if (cached?.url) {
            return extractAccentFromImage(cached.url);
        }
        return DEFAULT_AUTO_ACCENT;
    }
    if (bgType === "url") {
        const url = settings.get("bg-url-link", "");
        if (!url)
            return DEFAULT_AUTO_ACCENT;
        return extractAccentFromImage(url);
    }
    return DEFAULT_AUTO_ACCENT;
}
export interface ImageBrightnessAnalysis {
    overallLuminance: number;
    upperLuminance: number;
    isBright: boolean;
}
export const DEFAULT_BRIGHTNESS: ImageBrightnessAnalysis = {
    overallLuminance: 0.2,
    upperLuminance: 0.2,
    isBright: false,
};
const brightnessCacheByUrl = new Map<string, Promise<ImageBrightnessAnalysis>>();
const brightnessCacheByBlob = new WeakMap<Blob, Promise<ImageBrightnessAnalysis>>();
const BRIGHTNESS_CACHE_MAX = 12;
export function analyzeImageBrightness(imageSource: string | Blob): Promise<ImageBrightnessAnalysis> {
    if (typeof imageSource === "string") {
        const cached = brightnessCacheByUrl.get(imageSource);
        if (cached)
            return cached;
        const promise = analyzeImageBrightnessUncached(imageSource);
        if (brightnessCacheByUrl.size >= BRIGHTNESS_CACHE_MAX)
            brightnessCacheByUrl.clear();
        brightnessCacheByUrl.set(imageSource, promise);
        promise.catch(() => brightnessCacheByUrl.delete(imageSource));
        return promise;
    }
    const cached = brightnessCacheByBlob.get(imageSource);
    if (cached)
        return cached;
    const promise = analyzeImageBrightnessUncached(imageSource);
    brightnessCacheByBlob.set(imageSource, promise);
    return promise;
}
async function analyzeImageBrightnessUncached(imageSource: string | Blob): Promise<ImageBrightnessAnalysis> {
    if (typeof window === "undefined")
        return DEFAULT_BRIGHTNESS;
    const safeSource = await toAnalysisSafeSource(imageSource);
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        let objectUrlToRevoke: string | null = null;
        let timer: ReturnType<typeof setTimeout> | null = null;
        if (safeSource instanceof Blob) {
            objectUrlToRevoke = URL.createObjectURL(safeSource);
            img.src = objectUrlToRevoke;
        }
        else {
            img.src = safeSource;
        }
        const cleanup = () => {
            if (timer)
                clearTimeout(timer);
            if (objectUrlToRevoke) {
                URL.revokeObjectURL(objectUrlToRevoke);
            }
        };
        timer = setTimeout(() => {
            cleanup();
            resolve(DEFAULT_BRIGHTNESS);
        }, 3000);
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const size = 48;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                if (!ctx) {
                    cleanup();
                    resolve(DEFAULT_BRIGHTNESS);
                    return;
                }
                ctx.drawImage(img, 0, 0, size, size);
                const imageData = ctx.getImageData(0, 0, size, size);
                const data = imageData.data;
                let totalLuminance = 0;
                let totalCount = 0;
                let upperLuminanceSum = 0;
                let upperCount = 0;
                const halfHeight = Math.floor(size / 2);
                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        const idx = (y * size + x) * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        const a = data[idx + 3];
                        if (a < 128)
                            continue;
                        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
                        totalLuminance += lum;
                        totalCount++;
                        if (y < halfHeight) {
                            upperLuminanceSum += lum;
                            upperCount++;
                        }
                    }
                }
                cleanup();
                const overall = totalCount > 0 ? totalLuminance / totalCount : 0.2;
                const upper = upperCount > 0 ? upperLuminanceSum / upperCount : overall;
                const isBright = upper >= 0.42 || overall >= 0.40;
                resolve({
                    overallLuminance: overall,
                    upperLuminance: upper,
                    isBright,
                });
            }
            catch (err) {
                console.warn("Image brightness analysis fallback:", err);
                cleanup();
                resolve(DEFAULT_BRIGHTNESS);
            }
        };
        img.onerror = () => {
            cleanup();
            resolve(DEFAULT_BRIGHTNESS);
        };
    });
}
export async function getActiveBackgroundBrightness(): Promise<ImageBrightnessAnalysis> {
    if (typeof window === "undefined")
        return DEFAULT_BRIGHTNESS;
    const bgType = settings.get("bg-type", "default");
    if (bgType === "default")
        return DEFAULT_BRIGHTNESS;
    if (bgType === "curated") {
        const url = settings.get("bg-curated-url", "");
        if (!url)
            return DEFAULT_BRIGHTNESS;
        return analyzeImageBrightness(url);
    }
    if (bgType === "upload") {
        try {
            const blob = await getBackgroundBlob();
            if (!blob)
                return DEFAULT_BRIGHTNESS;
            return analyzeImageBrightness(blob);
        }
        catch {
            return DEFAULT_BRIGHTNESS;
        }
    }
    if (bgType === "bing") {
        const cached = getCachedBingWallpaper();
        if (cached?.url) {
            return analyzeImageBrightness(cached.url);
        }
        return DEFAULT_BRIGHTNESS;
    }
    if (bgType === "url") {
        const url = settings.get("bg-url-link", "");
        if (!url)
            return DEFAULT_BRIGHTNESS;
        return analyzeImageBrightness(url);
    }
    return DEFAULT_BRIGHTNESS;
}
