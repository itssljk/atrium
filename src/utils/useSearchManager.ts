import { useState, useCallback, useEffect } from "react";
import { ENGINES, type SearchEngine } from "@/config/searchEngines";
import { settings } from "./settings";
import { CUSTOM_ENGINE_MAX, CUSTOM_BANGS_MAX, type CustomEngine, type CustomBang } from "@/settings/types";
export type SearchBarShape = "pill" | "rounded" | "sharp";
export type SearchBarStyle = "glass" | "solid";
export type SearchBarColor = "default" | "accent" | "sage" | "violet" | "amber" | "rose" | "cyan" | "custom";
function generateUniqueId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function toSearchEngine(custom: CustomEngine): SearchEngine {
    return {
        ...custom,
        privacyLabel: custom.privacyLabel || "Custom",
        privacyLevel: custom.privacyLevel || "custom",
        privacyDetail: custom.privacyDetail || "Custom search provider",
    };
}
export function useSearchManager() {
    const [searchEngineId, setSearchEngineIdState] = useState(() => {
        if (typeof window === "undefined")
            return "google";
        return settings.get("search-engine-id", "google");
    });
    const [openInNewTab, setOpenInNewTabState] = useState(() => {
        if (typeof window === "undefined")
            return false;
        return settings.get("settings-search-new-tab") === "true";
    });
    const [autoFocus, setAutoFocusState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-search-autofocus") !== "false";
    });
    const [searchBarShape, setSearchBarShapeState] = useState<SearchBarShape>(() => {
        if (typeof window === "undefined")
            return "pill";
        const saved = settings.get("search-bar-shape");
        if (saved === "rounded" || saved === "sharp")
            return saved;
        return "pill";
    });
    const [searchBarStyle, setSearchBarStyleState] = useState<SearchBarStyle>(() => {
        if (typeof window === "undefined")
            return "glass";
        const saved = settings.get("search-bar-style");
        if (saved === "solid")
            return "solid";
        return "glass";
    });
    const [searchBarColor, setSearchBarColorState] = useState<SearchBarColor>(() => {
        if (typeof window === "undefined")
            return "default";
        const saved = settings.get("search-bar-color");
        const valid: SearchBarColor[] = ["default", "accent", "sage", "violet", "amber", "rose", "cyan", "custom"];
        if (saved && valid.includes(saved as SearchBarColor))
            return saved as SearchBarColor;
        return "default";
    });
    const [searchBarCustomColor, setSearchBarCustomColorState] = useState<string>(() => {
        if (typeof window === "undefined")
            return "#7ca38e";
        return settings.get("search-bar-custom-color", "#7ca38e");
    });
    const [customEngines, setCustomEngines] = useState<CustomEngine[]>(() => {
        if (typeof window === "undefined")
            return [];
        try {
            const saved = settings.get("custom-engines");
            if (saved)
                return JSON.parse(saved);
        }
        catch { }
        return [];
    });
    const [customBangs, setCustomBangs] = useState<CustomBang[]>(() => {
        if (typeof window === "undefined")
            return [];
        try {
            const saved = settings.get("custom-bangs");
            if (saved)
                return JSON.parse(saved);
        }
        catch { }
        return [];
    });
    const [deletedEngineIds, setDeletedEngineIds] = useState<string[]>(() => {
        if (typeof window === "undefined")
            return [];
        try {
            const saved = settings.get("deleted-engines");
            if (saved)
                return JSON.parse(saved);
            const oldDisabled = settings.get("disabled-engines");
            if (oldDisabled) {
                const parsed = JSON.parse(oldDisabled);
                settings.set("deleted-engines", JSON.stringify(parsed));
                settings.remove("disabled-engines");
                return parsed;
            }
        }
        catch { }
        return [];
    });
    const [deletedBangs, setDeletedBangs] = useState<string[]>(() => {
        if (typeof window === "undefined")
            return [];
        try {
            const saved = settings.get("deleted-bangs");
            if (saved)
                return JSON.parse(saved);
        }
        catch { }
        return [];
    });
    useEffect(() => {
        const handleUpdate = () => {
            setSearchEngineIdState(settings.get("search-engine-id", "google"));
            setOpenInNewTabState(settings.get("settings-search-new-tab") === "true");
            setAutoFocusState(settings.get("settings-search-autofocus") !== "false");
            const savedShape = settings.get("search-bar-shape");
            setSearchBarShapeState(savedShape === "rounded" || savedShape === "sharp" ? savedShape : "pill");
            const savedStyle = settings.get("search-bar-style");
            setSearchBarStyleState(savedStyle === "solid" ? "solid" : "glass");
            const savedColor = settings.get("search-bar-color");
            const valid: SearchBarColor[] = ["default", "accent", "sage", "violet", "amber", "rose", "cyan", "custom"];
            setSearchBarColorState(savedColor && valid.includes(savedColor as SearchBarColor) ? (savedColor as SearchBarColor) : "default");
            setSearchBarCustomColorState(settings.get("search-bar-custom-color", "#7ca38e"));
            try {
                const savedCustom = settings.get("custom-engines");
                if (savedCustom)
                    setCustomEngines(JSON.parse(savedCustom));
                const savedBangs = settings.get("custom-bangs");
                if (savedBangs)
                    setCustomBangs(JSON.parse(savedBangs));
                const savedDeleted = settings.get("deleted-engines");
                if (savedDeleted)
                    setDeletedEngineIds(JSON.parse(savedDeleted));
                const savedDeletedBangs = settings.get("deleted-bangs");
                if (savedDeletedBangs)
                    setDeletedBangs(JSON.parse(savedDeletedBangs));
                else
                    setDeletedBangs([]);
            }
            catch { }
        };
        const unsubscribe = settings.subscribe((key) => {
            if (key === "search-engine-id" ||
                key === "settings-search-new-tab" ||
                key === "settings-search-autofocus" ||
                key === "search-bar-shape" ||
                key === "search-bar-style" ||
                key === "search-bar-color" ||
                key === "search-bar-custom-color" ||
                key === "custom-engines" ||
                key === "custom-bangs" ||
                key === "deleted-engines" ||
                key === "deleted-bangs") {
                handleUpdate();
            }
        });
        return unsubscribe;
    }, []);
    const setSearchBarShape = useCallback((shape: SearchBarShape) => {
        setSearchBarShapeState(shape);
        settings.set("search-bar-shape", shape);
    }, []);
    const setSearchBarStyle = useCallback((style: SearchBarStyle) => {
        setSearchBarStyleState(style);
        settings.set("search-bar-style", style);
    }, []);
    const setSearchBarColor = useCallback((color: SearchBarColor) => {
        setSearchBarColorState(color);
        settings.set("search-bar-color", color);
    }, []);
    const setSearchBarCustomColor = useCallback((hex: string) => {
        setSearchBarCustomColorState(hex);
        settings.set("search-bar-custom-color", hex);
    }, []);
    const setSearchEngineId = useCallback((id: string) => {
        setSearchEngineIdState(id);
        settings.set("search-engine-id", id);
    }, []);
    const setOpenInNewTab = useCallback((val: boolean) => {
        setOpenInNewTabState(val);
        settings.set("settings-search-new-tab", val ? "true" : "false");
    }, []);
    const setAutoFocus = useCallback((val: boolean) => {
        setAutoFocusState(val);
        settings.set("settings-search-autofocus", val ? "true" : "false");
    }, []);
    const saveCustomEnginesList = useCallback((updated: CustomEngine[]) => {
        setCustomEngines(updated);
        settings.set("custom-engines", JSON.stringify(updated));
    }, []);
    const deleteEngine = useCallback((id: string) => {
        if (searchEngineId === id) {
            const remaining = [...ENGINES, ...customEngines.map(toSearchEngine)].filter((e) => e.id !== id && !deletedEngineIds.includes(e.id));
            if (remaining.length > 0) {
                setSearchEngineId(remaining[0].id);
            }
            else {
                setSearchEngineId("google");
            }
        }
        if (!ENGINES.some((e) => e.id === id)) {
            const updatedCustom = customEngines.filter((e) => e.id !== id);
            saveCustomEnginesList(updatedCustom);
        }
        else {
            const updatedDeleted = [...deletedEngineIds, id];
            setDeletedEngineIds(updatedDeleted);
            settings.set("deleted-engines", JSON.stringify(updatedDeleted));
        }
    }, [searchEngineId, customEngines, deletedEngineIds, setSearchEngineId, saveCustomEnginesList]);
    const restoreDefaultEngines = useCallback(() => {
        setDeletedEngineIds([]);
        settings.remove("deleted-engines");
    }, []);
    const saveCustomEngine = useCallback((name: string, url: string, editingId?: string | null): boolean => {
        if (!name.trim() || !url.trim())
            return false;
        let formattedUrl = url.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = "https://" + formattedUrl;
        }
        let domain = "";
        try {
            domain = new URL(formattedUrl).hostname;
        }
        catch {
            domain = "example.com";
        }
        let updated: CustomEngine[];
        if (editingId) {
            updated = customEngines.map((e) => e.id === editingId
                ? { ...e, name: name.trim(), url: formattedUrl, domain }
                : e);
        }
        else {
            if (customEngines.length >= CUSTOM_ENGINE_MAX)
                return false;
            const newEngine: CustomEngine = {
                id: generateUniqueId("custom"),
                name: name.trim(),
                url: formattedUrl,
                domain,
            };
            updated = [...customEngines, newEngine];
        }
        saveCustomEnginesList(updated);
        return true;
    }, [customEngines, saveCustomEnginesList]);
    const moveCustomEngine = useCallback((index: number, direction: "up" | "down") => {
        const updated = [...customEngines];
        const targetIdx = direction === "up" ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= updated.length)
            return;
        const temp = updated[index];
        updated[index] = updated[targetIdx];
        updated[targetIdx] = temp;
        saveCustomEnginesList(updated);
    }, [customEngines, saveCustomEnginesList]);
    const saveCustomBangsList = useCallback((updated: CustomBang[]) => {
        setCustomBangs(updated);
        settings.set("custom-bangs", JSON.stringify(updated));
    }, []);
    const saveCustomBang = useCallback((bang: string, name: string, url: string, editingId?: string | null): {
        success: boolean;
        error?: string;
    } => {
        const cleanBang = bang.trim().toLowerCase();
        const normalizedBang = cleanBang.startsWith("!") ? cleanBang : `!${cleanBang}`;
        if (normalizedBang.length <= 1) {
            return { success: false, error: "Shortcut trigger cannot be empty." };
        }
        if (!name.trim()) {
            return { success: false, error: "Name cannot be empty." };
        }
        if (!url.trim()) {
            return { success: false, error: "Search URL cannot be empty." };
        }
        let formattedUrl = url.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = "https://" + formattedUrl;
        }
        let domain = "";
        try {
            domain = new URL(formattedUrl).hostname;
        }
        catch {
            domain = "example.com";
        }
        const isDuplicate = customBangs.some((b) => b.bang.toLowerCase() === normalizedBang && b.id !== editingId);
        if (isDuplicate) {
            return { success: false, error: `A custom bang with trigger ${normalizedBang} already exists.` };
        }
        let updated: CustomBang[];
        if (editingId) {
            updated = customBangs.map((b) => b.id === editingId
                ? { ...b, bang: normalizedBang, name: name.trim(), url: formattedUrl, domain }
                : b);
        }
        else {
            if (customBangs.length >= CUSTOM_BANGS_MAX) {
                return { success: false, error: `Maximum of ${CUSTOM_BANGS_MAX} custom bangs reached.` };
            }
            const newBang: CustomBang = {
                id: generateUniqueId("bang"),
                bang: normalizedBang,
                name: name.trim(),
                url: formattedUrl,
                domain,
            };
            updated = [...customBangs, newBang];
        }
        saveCustomBangsList(updated);
        return { success: true };
    }, [customBangs, saveCustomBangsList]);
    const deleteCustomBang = useCallback((id: string) => {
        const updated = customBangs.filter((b) => b.id !== id);
        saveCustomBangsList(updated);
    }, [customBangs, saveCustomBangsList]);
    const deleteDefaultBang = useCallback((bangToken: string, aliases: string[] = []) => {
        const lower = bangToken.toLowerCase();
        const aliasLowers = aliases.map((a) => a.toLowerCase());
        const toAdd = [lower, ...aliasLowers];
        const updated = Array.from(new Set([...deletedBangs, ...toAdd]));
        setDeletedBangs(updated);
        settings.set("deleted-bangs", JSON.stringify(updated));
    }, [deletedBangs]);
    const restoreDefaultBangs = useCallback(() => {
        setDeletedBangs([]);
        settings.remove("deleted-bangs");
    }, []);
    const availableEngines: SearchEngine[] = [...ENGINES, ...customEngines.map(toSearchEngine)].filter((e) => !deletedEngineIds.includes(e.id));
    return {
        searchEngineId,
        setSearchEngineId,
        openInNewTab,
        setOpenInNewTab,
        autoFocus,
        setAutoFocus,
        searchBarShape,
        setSearchBarShape,
        searchBarStyle,
        setSearchBarStyle,
        searchBarColor,
        setSearchBarColor,
        searchBarCustomColor,
        setSearchBarCustomColor,
        customEngines,
        customBangs,
        deletedEngineIds,
        deletedBangs,
        availableEngines,
        deleteEngine,
        restoreDefaultEngines,
        saveCustomEngine,
        moveCustomEngine,
        saveCustomBang,
        deleteCustomBang,
        deleteDefaultBang,
        restoreDefaultBangs,
    };
}
