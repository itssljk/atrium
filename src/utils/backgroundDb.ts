const DB_NAME = "atrium-tabs-db";
const LEGACY_DB_NAME = "slate-tabs-db";
const STORE_NAME = "backgrounds";
const DB_VERSION = 1;
function openDb(name: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.indexedDB) {
            reject(new Error("IndexedDB is not supported on this environment"));
            return;
        }
        const request = indexedDB.open(name, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}
function initDb(): Promise<IDBDatabase> {
    return openDb(DB_NAME);
}
export async function optimizeWallpaperBlob(file: Blob): Promise<Blob> {
    if (typeof window === "undefined" || !file.type.startsWith("image/")) {
        return file;
    }
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
        return file;
    }
    return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const MAX_WIDTH = 2560;
            const MAX_HEIGHT = 1440;
            let { naturalWidth: width, naturalHeight: height } = img;
            if (!width || !height) {
                resolve(file);
                return;
            }
            if (width <= MAX_WIDTH && height <= MAX_HEIGHT && file.size < 1.5 * 1024 * 1024) {
                resolve(file);
                return;
            }
            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(file);
                return;
            }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob && blob.size < file.size) {
                    resolve(blob);
                }
                else {
                    resolve(file);
                }
            }, "image/webp", 0.85);
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };
    });
}
let cachedUploadBlob: Blob | null | undefined;
export async function saveBackgroundBlob(blob: Blob): Promise<Blob> {
    const optimized = await optimizeWallpaperBlob(blob);
    cachedUploadBlob = optimized;
    const db = await initDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(optimized, "custom-upload");
        request.onsuccess = () => { db.close(); resolve(optimized); };
        request.onerror = () => { db.close(); reject(request.error); };
    });
}
export async function getBackgroundBlob(): Promise<Blob | null> {
    if (cachedUploadBlob !== undefined)
        return cachedUploadBlob;
    try {
        const db = await initDb();
        const blob = await new Promise<Blob | null>((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get("custom-upload");
            request.onsuccess = () => { db.close(); resolve(request.result || null); };
            request.onerror = () => { db.close(); reject(request.error); };
        });
        if (blob) {
            cachedUploadBlob = blob;
            return blob;
        }
        try {
            const legacyDb = await openDb(LEGACY_DB_NAME);
            const legacyBlob = await new Promise<Blob | null>((resolve, reject) => {
                const transaction = legacyDb.transaction(STORE_NAME, "readonly");
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get("custom-upload");
                request.onsuccess = () => { legacyDb.close(); resolve(request.result || null); };
                request.onerror = () => { legacyDb.close(); reject(request.error); };
            });
            if (legacyBlob) {
                cachedUploadBlob = legacyBlob;
                await saveBackgroundBlob(legacyBlob);
                return legacyBlob;
            }
        }
        catch {
        }
        return null;
    }
    catch (error) {
        console.error("Failed to load background from IndexedDB:", error);
        return null;
    }
}
export async function clearBackgroundBlob(): Promise<void> {
    cachedUploadBlob = null;
    const db = await initDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete("custom-upload");
        request.onsuccess = () => { db.close(); resolve(); };
        request.onerror = () => { db.close(); reject(request.error); };
    });
}
export interface BackgroundSettings {
    type: "default" | "curated" | "upload" | "url" | "bing";
    opacity: number;
    blur: number;
    dim: number;
    curatedUrl: string;
    urlLink: string;
}
export const DEFAULT_BG_SETTINGS: BackgroundSettings = {
    type: "default",
    opacity: 50,
    blur: 0,
    dim: 40,
    curatedUrl: "",
    urlLink: "",
};
