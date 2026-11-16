"use client";
import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo } from "react";
import { settings } from "@/utils/settings";
import { normalizeAccent } from "@/utils/accent";
import { applyAccentAttributes } from "@/utils/useAppearanceManager";
import { REDUCED_MOTION_QUERY } from "@/themeBoot";
interface ThemeContextType {
    theme: "dark";
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function ThemeProvider({ children }: {
    children: React.ReactNode;
}) {
    useLayoutEffect(() => {
        const preference = window.matchMedia?.(REDUCED_MOTION_QUERY);
        const syncMotion = () => {
            const reduced = settings.getValue("settings-perf") || preference?.matches;
            document.documentElement.dataset.perf = reduced ? "true" : "false";
        };
        syncMotion();
        preference?.addEventListener("change", syncMotion);
        const unsubscribe = settings.subscribe((key) => {
            if (key === "settings-perf")
                syncMotion();
        });
        return () => {
            preference?.removeEventListener("change", syncMotion);
            unsubscribe();
        };
    }, []);
    useEffect(() => {
        const storedAccent = settings.get("accent");
        if (storedAccent && storedAccent !== normalizeAccent(storedAccent)) {
            settings.set("accent", normalizeAccent(storedAccent));
        }
        if (settings.get("theme") === "light") {
            settings.set("theme", "dark");
        }
        document.documentElement.setAttribute("data-theme", "dark");
        const savedAccent = settings.get("accent", "sage");
        applyAccentAttributes(savedAccent);
        const unsubscribe = settings.subscribe((key) => {
            if (key === "accent" || key === "auto-accent-color") {
                applyAccentAttributes(settings.get("accent", "sage"));
            }
        });
        settings.startExternalSyncObserver();
        void settings.hydrate().then(() => {
            if (settings.get("theme") === "light") {
                settings.set("theme", "dark");
            }
            applyAccentAttributes(settings.get("accent", "sage"));
        });
        return () => {
            unsubscribe();
        };
    }, []);
    const contextValue = useMemo(() => ({ theme: "dark" as const }), []);
    return (<ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>);
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
