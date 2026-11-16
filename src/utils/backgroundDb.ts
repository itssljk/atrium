const DB_NAME = "atrium-tabs-db";
const LEGACY_DB_NAME = "slate-tabs-db";
const STORE_NAME = "backgrounds";
const UPLOAD_KEY = "custom-upload";
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
let wallpaperOperation = Promise.resolve();

async function withWallpaperLock<T>(operation: () => Promise<T>): Promise<T> {
    // Serialize legacy migration, writes, and deletes so a read cannot restore a deleted photo.
    if (typeof navigator !== "undefined" && navigator.locks)
        return await navigator.locks.request("atrium-wallpaper-upload", operation);
    const result = wallpaperOperation.then(operation);
    wallpaperOperation = result.then(() => {}, () => {});
    return result;
}

async function writeWallpaperRecord(dbName: string, write: (store: IDBObjectStore) => void): Promise<void> {
    const db = await openDb(dbName);
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            transaction.oncomplete = () => { db.close(); resolve(); };
            transaction.onabort = () => { db.close(); reject(transaction.error ?? new Error("Wallpaper storage transaction aborted")); };
            write(transaction.objectStore(STORE_NAME));
        }
        catch (error) {
            db.close();
            reject(error);
        }
    });
}

export function saveBackgroundBlob(blob: Blob): Promise<Blob> {
    return withWallpaperLock(async () => {
        const optimized = await optimizeWallpaperBlob(blob);
        await writeWallpaperRecord(DB_NAME, (store) => store.put(optimized, UPLOAD_KEY));
        return optimized;
    });
}
export function getBackgroundBlob(): Promise<Blob | null> {
    return withWallpaperLock(readWallpaperBlob);
}

async function readWallpaperRecord(dbName: string): Promise<Blob | null> {
    const db = await openDb(dbName);
    try {
        return await new Promise<Blob | null>((resolve, reject) => {
            const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(UPLOAD_KEY);
            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error);
        });
    }
    finally {
        db.close();
    }
}

async function readWallpaperBlob(): Promise<Blob | null> {
    try {
        const blob = await readWallpaperRecord(DB_NAME);
        if (blob)
            return blob;
        const legacyBlob = await readWallpaperRecord(LEGACY_DB_NAME);
        if (legacyBlob) {
            try {
                await writeWallpaperRecord(DB_NAME, (store) => store.put(legacyBlob, UPLOAD_KEY));
            }
            catch (error) {
                console.warn("Failed to migrate the locally stored wallpaper:", error);
            }
        }
        return legacyBlob;
    }
    catch (error) {
        console.error("Failed to load background from IndexedDB:", error);
        return null;
    }
}
export function clearBackgroundBlob(): Promise<void> {
    return withWallpaperLock(async () => {
        await writeWallpaperRecord(LEGACY_DB_NAME, (store) => store.delete(UPLOAD_KEY));
        await writeWallpaperRecord(DB_NAME, (store) => store.delete(UPLOAD_KEY));
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
