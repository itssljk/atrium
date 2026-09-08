import { useEffect, useState, useCallback } from "react";
import { settings } from "./settings";
import { normalizeAccent, hexToHsl } from "./accent";
import { getActiveBackgroundAccent, DEFAULT_AUTO_ACCENT } from "./colorExtractor";
export function applyThemeAttributes() {
    if (typeof document === "undefined")
        return;
    document.documentElement.setAttribute("data-theme", "dark");
}
export function applyAccentAttributes(accent: string, customHex?: string, autoHex?: string) {
    if (typeof document === "undefined")
        return;
    document.documentElement.setAttribute("data-accent", accent);
    if (accent !== "custom") {
        document.documentElement.style.removeProperty("--custom-accent");
    }
    else {
        const hex = customHex || settings.get("custom-accent", "#7ca38e");
        document.documentElement.style.setProperty("--custom-accent", hex);
    }
    if (accent !== "auto") {
        document.documentElement.style.removeProperty("--auto-accent");
    }
    else {
        const hex = autoHex || settings.get("auto-accent-color", DEFAULT_AUTO_ACCENT.dark);
        document.documentElement.style.setProperty("--auto-accent", hex);
    }
}
export function applyGlowAttribute(enabled: boolean) {
    if (typeof document === "undefined")
        return;
    document.documentElement.setAttribute("data-glow", enabled ? "true" : "false");
}
export function applyPerfAttribute(enabled: boolean) {
    if (typeof document === "undefined")
        return;
    document.documentElement.setAttribute("data-perf", enabled ? "true" : "false");
}
const BG_SOURCE_KEYS = new Set(["bg-type", "bg-curated-url", "bg-url-link", "bg-bing-cache"]);
export function useAppearanceManager() {
    const [accentColor, setAccentColorState] = useState(() => {
        if (typeof window === "undefined")
            return "sage";
        return normalizeAccent(settings.get("accent", "sage"));
    });
    const [customColor, setCustomColorState] = useState(() => {
        if (typeof window === "undefined")
            return "#7ca38e";
        return settings.get("custom-accent", "#7ca38e");
    });
    const [customHsl, setCustomHslState] = useState(() => {
        if (typeof window === "undefined")
            return { h: 147, s: 18, l: 56 };
        const savedCustom = settings.get("custom-accent", "#7ca38e");
        return hexToHsl(savedCustom);
    });
    const [autoColor, setAutoColorState] = useState(() => {
        if (typeof window === "undefined")
            return DEFAULT_AUTO_ACCENT.dark;
        return settings.get("auto-accent-color", DEFAULT_AUTO_ACCENT.dark);
    });
    const [glowEnabled, setGlowEnabledState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-glow") !== "false";
    });
    const [performanceMode, setPerformanceModeState] = useState(() => {
        if (typeof window === "undefined")
            return false;
        return settings.get("settings-perf") === "true";
    });
    const refreshAutoAccent = useCallback(async () => {
        try {
            const extracted = await getActiveBackgroundAccent();
            setAutoColorState(extracted.dark);
            settings.set("auto-accent-color", extracted.dark);
            const currentAccent = settings.get("accent", "sage");
            if (currentAccent === "auto") {
                applyAccentAttributes("auto", undefined, extracted.dark);
            }
        }
        catch (err) {
            console.warn("Failed to refresh auto accent:", err);
        }
    }, []);
    const syncFromSettings = useCallback(() => {
        const nextAccent = normalizeAccent(settings.get("accent", "sage"));
        const nextCustom = settings.get("custom-accent", "#7ca38e");
        const nextAutoDark = settings.get("auto-accent-color", DEFAULT_AUTO_ACCENT.dark);
        const nextGlow = settings.get("settings-glow") !== "false";
        const nextPerf = settings.get("settings-perf") === "true";
        setAccentColorState(nextAccent);
        setCustomColorState(nextCustom);
        setCustomHslState(hexToHsl(nextCustom));
        setAutoColorState(nextAutoDark);
        setGlowEnabledState(nextGlow);
        setPerformanceModeState(nextPerf);
        applyThemeAttributes();
        applyAccentAttributes(nextAccent, nextCustom, nextAutoDark);
        applyGlowAttribute(nextGlow);
        applyPerfAttribute(nextPerf);
    }, []);
    useEffect(() => {
        syncFromSettings();
        if (settings.get("accent") === "auto") {
            void refreshAutoAccent();
        }
        const unsubscribe = settings.subscribe((key) => {
            if (key === "accent" ||
                key === "custom-accent" ||
                key === "auto-accent-color" ||
                key === "settings-glow" ||
                key === "settings-perf") {
                syncFromSettings();
            }
            if (BG_SOURCE_KEYS.has(key)) {
                if (settings.get("accent") === "auto") {
                    void refreshAutoAccent();
                }
            }
        });
        return unsubscribe;
    }, [syncFromSettings, refreshAutoAccent]);
    const setAccent = useCallback((newAccent: string) => {
        setAccentColorState(newAccent);
        settings.set("accent", newAccent);
        if (newAccent === "auto") {
            void refreshAutoAccent();
        }
        else {
            applyAccentAttributes(newAccent);
        }
    }, [refreshAutoAccent]);
    const saveCustomColor = useCallback((hex: string, hsl: {
        h: number;
        s: number;
        l: number;
    }) => {
        setCustomColorState(hex);
        setCustomHslState(hsl);
        setAccentColorState("custom");
        settings.set("custom-accent", hex);
        settings.set("accent", "custom");
        applyAccentAttributes("custom", hex);
    }, []);
    const setGlow = useCallback((val: boolean) => {
        setGlowEnabledState(val);
        settings.set("settings-glow", val ? "true" : "false");
        applyGlowAttribute(val);
    }, []);
    const setPerf = useCallback((val: boolean) => {
        setPerformanceModeState(val);
        settings.set("settings-perf", val ? "true" : "false");
        applyPerfAttribute(val);
    }, []);
    return {
        accentColor,
        setAccent,
        customColor,
        customHsl,
        saveCustomColor,
        autoColor,
        refreshAutoAccent,
        glowEnabled,
        setGlow,
        performanceMode,
        setPerf,
    };
}
