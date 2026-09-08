import { settings } from "./settings";
import { SETTINGS_SCHEMA } from "./settingsSchema";
import { siteConfig } from "@/config/site";
export interface SettingsBackup {
    app: string;
    version: string;
    timestamp: string;
    settings: Record<string, string>;
}
const BACKUP_KEYS: string[] = Object.values(SETTINGS_SCHEMA)
    .filter((def) => def.sync)
    .map((def) => def.key);
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
}
export function importSettingsFromJson(jsonString: string): ImportResult {
    try {
        const parsed = JSON.parse(jsonString);
        if (!parsed || typeof parsed !== "object") {
            return { success: false, importedCount: 0, error: "Invalid backup file format." };
        }
        const payload = parsed.settings || parsed;
        if (typeof payload !== "object" || payload === null) {
            return { success: false, importedCount: 0, error: "No settings found in file." };
        }
        const knownKeys = new Set(BACKUP_KEYS);
        let count = 0;
        Object.entries(payload).forEach(([rawKey, val]) => {
            const logicalKey = rawKey.startsWith("atrium-")
                ? rawKey.slice(7)
                : rawKey.startsWith("slate-")
                    ? rawKey.slice(6)
                    : rawKey;
            if (knownKeys.has(logicalKey) && typeof val === "string") {
                settings.set(logicalKey, val);
                count++;
            }
        });
        if (count === 0) {
            return { success: false, importedCount: 0, error: "No recognized Atrium Tabs settings found in backup." };
        }
        return { success: true, importedCount: count };
    }
    catch (e) {
        return {
            success: false,
            importedCount: 0,
            error: e instanceof Error ? e.message : "Failed to parse backup JSON.",
        };
    }
}
export function resetAllSettings(): void {
    BACKUP_KEYS.forEach((key) => {
        settings.remove(key);
    });
}
