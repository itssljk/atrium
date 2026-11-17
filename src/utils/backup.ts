import { settings, STORAGE_PREFIX, LEGACY_STORAGE_PREFIX } from "./settings";
import { SETTINGS_SCHEMA } from "./settingsSchema";
import { clearBackgroundBlob, getBackgroundBlob } from "./backgroundDb";
import { siteConfig } from "@/config/site";
import type { Quicklink } from "./quicklinks";
export interface SettingsBackup {
    app: string;
    version: string;
    timestamp: string;
    settings: Record<string, string>;
}
// Sync consent is device-local. Derived colors and daily wallpaper cache are regenerated.
const BACKUP_KEYS = new Set(Object.keys(SETTINGS_SCHEMA).filter((key) =>
    key !== "settings-sync" && key !== "auto-accent-color" && key !== "bg-bing-cache"));
function isQuicklink(value: unknown): value is Quicklink {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return false;
    const link = value as Record<string, unknown>;
    return typeof link.id === "string" &&
        typeof link.title === "string" &&
        typeof link.url === "string" &&
        (link.iconType === undefined || link.iconType === "auto" || link.iconType === "emoji" || link.iconType === "text") &&
        (link.customIcon === undefined || typeof link.customIcon === "string");
}
function hasValidQuicklinks(raw: string): boolean {
    try {
        const value: unknown = JSON.parse(raw);
        return Array.isArray(value) && value.every(isQuicklink);
    }
    catch {
        return false;
    }
}
export function getExportData(): SettingsBackup {
    const settingsMap: Record<string, string> = {};
    BACKUP_KEYS.forEach((key) => {
        const val = settings.get(key);
        if (val !== "") {
            settingsMap[key] = val;
        }
    });
    return {
        app: "atrium-tabs",
        version: siteConfig.version,
        timestamp: new Date().toISOString(),
        settings: settingsMap,
    };
}
export function exportSettingsToFile(): boolean {
    if (typeof window === "undefined")
        return false;
    try {
        const data = getExportData();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split("T")[0];
        const filename = `atrium-tabs-backup-${dateStr}.json`;
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    }
    catch (err) {
        console.error("Failed to export settings:", err);
        return false;
    }
}
export interface ImportResult {
    success: boolean;
    importedCount: number;
    error?: string;
    warning?: string;
}
export async function importSettingsFromJson(jsonString: string): Promise<ImportResult> {
    try {
        const parsed = JSON.parse(jsonString);
        if (!parsed || typeof parsed !== "object") {
            return { success: false, importedCount: 0, error: "Invalid backup file format." };
        }
        const payload = parsed.settings || parsed;
        if (typeof payload !== "object" || payload === null) {
            return { success: false, importedCount: 0, error: "No settings found in file." };
        }
        const imported = new Map<string, string>();
        for (const [rawKey, val] of Object.entries(payload)) {
            const logicalKey = rawKey.startsWith(STORAGE_PREFIX)
                ? rawKey.slice(STORAGE_PREFIX.length)
                : rawKey.startsWith(LEGACY_STORAGE_PREFIX)
                    ? rawKey.slice(LEGACY_STORAGE_PREFIX.length)
                    : rawKey;
            if (!BACKUP_KEYS.has(logicalKey))
                continue;
            if (typeof val !== "string") {
                if (logicalKey === "quicklinks")
                    return { success: false, importedCount: 0, error: "Invalid Quicklinks in backup: expected a JSON string containing an array of shortcuts." };
                continue;
            }
            if (logicalKey === "quicklinks" && !hasValidQuicklinks(val))
                return { success: false, importedCount: 0, error: "Invalid Quicklinks in backup: expected a JSON array of shortcuts with string id, title, and url fields." };
            imported.set(logicalKey, val);
        }
        if (imported.size === 0) {
            return { success: false, importedCount: 0, error: "No recognized Atrium Tabs settings found in backup." };
        }
        let warning: string | undefined;
        if (imported.get("bg-type") === "upload" && !await getBackgroundBlob()) {
            imported.set("bg-type", SETTINGS_SCHEMA["bg-type"].default);
            warning = "This backup refers to an uploaded wallpaper. No local upload was available, so Atrium selected the default background.";
        }
        let count = 0;
        for (const [key, value] of imported) {
            if (!settings.set(key, value))
                return { success: false, importedCount: count, error: "Could not save the remaining settings. Check browser storage and try again." };
            count++;
        }
        return { success: true, importedCount: count, warning };
    }
    catch (e) {
        return {
            success: false,
            importedCount: 0,
            error: e instanceof Error ? e.message : "Failed to parse backup JSON.",
        };
    }
}
export async function resetAllSettings(): Promise<void> {
    await settings.resetUserSettings();
    try {
        await clearBackgroundBlob();
    }
    catch {
        throw new Error("Settings were reset and sync is off, but Atrium could not remove the uploaded wallpaper. Try resetting again.");
    }
}
