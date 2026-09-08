import { useCallback, useSyncExternalStore } from "react";
import { settings } from "./settings";
import { SETTINGS_SCHEMA, type SettingsKey, type SettingsValues } from "./settingsSchema";
const listeners = new Set<() => void>();
let subscribed = false;
function ensureStoreSubscription(): void {
    if (subscribed)
        return;
    subscribed = true;
    settings.subscribe(() => {
        listeners.forEach((l) => l());
    });
}
export function useSetting<K extends SettingsKey>(key: K) {
    ensureStoreSubscription();
    const subscribe = useCallback((onChange: () => void) => {
        listeners.add(onChange);
        return () => listeners.delete(onChange);
    }, []);
    const getSnapshot = useCallback(() => settings.getValue(key), [key]);
    const value = useSyncExternalStore(subscribe, getSnapshot);
    const setValue = useCallback((next: SettingsValues[K]) => settings.setValue(key, next), [key]);
    return [value, setValue] as const;
}
