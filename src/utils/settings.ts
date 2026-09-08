import { safeLocalStorage } from "./safeStorage";
import { SETTINGS_SCHEMA, SYNC_KEYS, type SettingsKey, type SettingsValues } from "./settingsSchema";
export const STORAGE_PREFIX = "atrium-";
export const LEGACY_STORAGE_PREFIX = "slate-";
export { SYNC_KEYS };
type SettingsListener = (key: string) => void;
interface SyncStorageArea {
    get(keys: string | string[] | null): Promise<Record<string, string>>;
    set(items: Record<string, string>): Promise<void>;
    remove(keys: string | string[]): Promise<void>;
    addListener?(callback: (changes: Record<string, {
        newValue?: unknown;
        oldValue?: unknown;
    }>, areaName: string) => void): void;
    removeListener?(callback: (changes: Record<string, {
        newValue?: unknown;
        oldValue?: unknown;
    }>, areaName: string) => void): void;
}
interface ChromeSyncArea {
    get(keys: string | string[] | null, callback: (items: Record<string, string>) => void): void;
    set(items: Record<string, string>, callback?: () => void): void;
    remove(keys: string | string[], callback?: () => void): void;
}
interface SyncGlobals {
    browser?: {
        storage?: {
            sync?: SyncStorageArea;
            onChanged?: {
                addListener(cb: (changes: Record<string, {
                    newValue?: unknown;
                    oldValue?: unknown;
                }>, area: string) => void): void;
                removeListener(cb: (changes: Record<string, {
                    newValue?: unknown;
                    oldValue?: unknown;
                }>, area: string) => void): void;
            };
        };
    };
    chrome?: {
        storage?: {
            sync?: ChromeSyncArea;
            onChanged?: {
                addListener(cb: (changes: Record<string, {
                    newValue?: unknown;
                    oldValue?: unknown;
                }>, area: string) => void): void;
                removeListener(cb: (changes: Record<string, {
                    newValue?: unknown;
                    oldValue?: unknown;
                }>, area: string) => void): void;
            };
        };
    };
}
let cachedSyncArea: SyncStorageArea | null | undefined;
function getSyncArea(): SyncStorageArea | null {
    if (typeof window === "undefined")
        return null;
    if (cachedSyncArea !== undefined)
        return cachedSyncArea;
    let area: SyncStorageArea | null = null;
    try {
        const w = window as unknown as SyncGlobals;
        if (w.browser?.storage?.sync) {
            area = w.browser.storage.sync;
        }
        else if (w.chrome?.storage?.sync) {
            const sync = w.chrome.storage.sync;
            area = {
                get: (keys) => new Promise((resolve) => sync.get(keys, resolve)),
                set: (items) => new Promise((resolve) => sync.set(items, () => resolve())),
                remove: (keys) => new Promise((resolve) => sync.remove(keys, () => resolve())),
            };
        }
    }
    catch {
    }
    cachedSyncArea = area;
    return area;
}
type OnChangedListener = (changes: Record<string, {
    newValue?: unknown;
    oldValue?: unknown;
}>, area: string) => void;
interface OnChangedArea {
    addListener(cb: OnChangedListener): void;
    removeListener(cb: OnChangedListener): void;
}
function getOnChanged(): OnChangedArea | undefined {
    if (typeof window === "undefined")
        return undefined;
    const w = window as unknown as SyncGlobals;
    return w.browser?.storage?.onChanged ?? w.chrome?.storage?.onChanged;
}
const listeners = new Set<SettingsListener>();
let notifyScheduled = false;
const pendingNotifyKeys = new Set<string>();
function flushNotify(): void {
    notifyScheduled = false;
    const keys = Array.from(pendingNotifyKeys);
    pendingNotifyKeys.clear();
    keys.forEach((key) => {
        listeners.forEach((listener) => {
            try {
                listener(key);
            }
            catch (e) {
                console.warn(`Settings listener for "${key}" threw:`, e);
            }
        });
    });
}
function scheduleNotify(key: string): void {
    pendingNotifyKeys.add(key);
    if (notifyScheduled)
        return;
    notifyScheduled = true;
    queueMicrotask(flushNotify);
}
const pendingSyncWrites = new Map<string, string>();
let syncFlushTimer: ReturnType<typeof setTimeout> | null = null;
function flushSyncWrites(): void {
    syncFlushTimer = null;
    if (pendingSyncWrites.size === 0)
        return;
    const area = getSyncArea();
    if (!area) {
        pendingSyncWrites.clear();
        return;
    }
    const items: Record<string, string> = {};
    pendingSyncWrites.forEach((value, key) => {
        items[key] = value;
    });
    pendingSyncWrites.clear();
    void area.set(items).catch(() => {
    });
}
function scheduleSyncWrite(key: string, value: string): void {
    pendingSyncWrites.set(key, value);
    if (syncFlushTimer)
        clearTimeout(syncFlushTimer);
    syncFlushTimer = setTimeout(flushSyncWrites, 400);
}
const ownWritesInFlight = new Set<string>();
let echoClearTimer: ReturnType<typeof setTimeout> | null = null;
function markOwnWrite(fullKey: string): void {
    ownWritesInFlight.add(fullKey);
    if (echoClearTimer)
        clearTimeout(echoClearTimer);
    echoClearTimer = setTimeout(() => ownWritesInFlight.clear(), 1500);
}
function fullKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
}
function logicalKey(full: string): string | null {
    if (full.startsWith(STORAGE_PREFIX))
        return full.slice(STORAGE_PREFIX.length);
    if (full.startsWith(LEGACY_STORAGE_PREFIX))
        return full.slice(LEGACY_STORAGE_PREFIX.length);
    return null;
}
export const settings = {
    get(key: string, fallback = ""): string {
        const val = safeLocalStorage.getItem(fullKey(key));
        if (val !== "")
            return val;
        const legacyVal = safeLocalStorage.getItem(`${LEGACY_STORAGE_PREFIX}${key}`);
        if (legacyVal !== "")
            return legacyVal;
        return fallback;
    },
    getValue<K extends SettingsKey>(key: K): SettingsValues[K] {
        const def = SETTINGS_SCHEMA[key];
        return def.parse(settings.get(def.key)) as SettingsValues[K];
    },
    getNumber(key: string, fallback: number): number {
        let raw = safeLocalStorage.getItem(fullKey(key));
        if (raw === "") {
            raw = safeLocalStorage.getItem(`${LEGACY_STORAGE_PREFIX}${key}`);
        }
        if (raw === "")
            return fallback;
        const parsed = parseInt(raw, 10);
        return Number.isNaN(parsed) ? fallback : parsed;
    },
    isSyncEnabled(): boolean {
        return settings.getValue("settings-sync") === true;
    },
    isSyncAvailable(): boolean {
        return getSyncArea() !== null;
    },
    async syncAllToRemote(): Promise<void> {
        const area = getSyncArea();
        if (!area)
            return;
        const items: Record<string, string> = {};
        for (const key of SYNC_KEYS) {
            const val = settings.get(key);
            if (val !== "") {
                items[fullKey(key)] = val;
            }
        }
        if (Object.keys(items).length > 0) {
            try {
                await area.set(items);
            }
            catch (e) {
                console.warn("Failed to push settings to sync storage:", e);
            }
        }
    },
    set(key: string, value: string): void {
        safeLocalStorage.setItem(fullKey(key), value);
        if (SYNC_KEYS.has(key) && settings.isSyncEnabled()) {
            markOwnWrite(fullKey(key));
            scheduleSyncWrite(fullKey(key), value);
        }
        scheduleNotify(key);
    },
    setValue(key: SettingsKey, value: unknown): void {
        const def = SETTINGS_SCHEMA[key];
        const serialized = def.serialize ? (def.serialize as (v: unknown) => string)(value) : String(value);
        settings.set(def.key, serialized);
    },
    remove(key: string): void {
        safeLocalStorage.removeItem(fullKey(key));
        safeLocalStorage.removeItem(`${LEGACY_STORAGE_PREFIX}${key}`);
        if (SYNC_KEYS.has(key) && settings.isSyncEnabled()) {
            pendingSyncWrites.delete(fullKey(key));
            markOwnWrite(fullKey(key));
            const area = getSyncArea();
            if (area) {
                void area.remove(fullKey(key)).catch(() => {
                });
                void area.remove(`${LEGACY_STORAGE_PREFIX}${key}`).catch(() => {
                });
            }
        }
        scheduleNotify(key);
    },
    subscribe(listener: SettingsListener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    async hydrate(): Promise<void> {
        if (!settings.isSyncEnabled())
            return;
        const area = getSyncArea();
        if (!area)
            return;
        try {
            const all = await area.get(null);
            for (const [key, value] of Object.entries(all ?? {})) {
                const logical = logicalKey(key);
                if (!logical || !SYNC_KEYS.has(logical))
                    continue;
                const nextValue = String(value ?? "");
                if (safeLocalStorage.getItem(fullKey(logical)) !== nextValue) {
                    safeLocalStorage.setItem(fullKey(logical), nextValue);
                    scheduleNotify(logical);
                }
            }
        }
        catch (e) {
            console.warn("Failed to hydrate settings from sync storage:", e);
        }
    },
    startExternalSyncObserver(): void {
        const onChanged = getOnChanged();
        if (!onChanged)
            return;
        const area = getSyncArea();
        if (!area)
            return;
        const handler = (changes: Record<string, {
            newValue?: unknown;
            oldValue?: unknown;
        }>) => {
            if (!settings.isSyncEnabled())
                return;
            for (const [key, change] of Object.entries(changes)) {
                if (ownWritesInFlight.has(key)) {
                    ownWritesInFlight.delete(key);
                    continue;
                }
                const logical = logicalKey(key);
                if (!logical || !SYNC_KEYS.has(logical))
                    continue;
                if (change.newValue === undefined) {
                    safeLocalStorage.removeItem(fullKey(logical));
                    safeLocalStorage.removeItem(`${LEGACY_STORAGE_PREFIX}${logical}`);
                }
                else {
                    const nextValue = String(change.newValue);
                    if (safeLocalStorage.getItem(fullKey(logical)) !== nextValue) {
                        safeLocalStorage.setItem(fullKey(logical), nextValue);
                    }
                }
                scheduleNotify(logical);
            }
        };
        onChanged.addListener(handler);
    },
};
