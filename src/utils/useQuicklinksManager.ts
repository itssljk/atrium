import { useState, useCallback, useEffect } from "react";
import { DEFAULT_QUICKLINKS, type Quicklink } from "./quicklinks";
import { settings } from "./settings";
import type { QuicklinksStyle, QuicklinksShape } from "./settingsSchema";
export function useQuicklinksManager() {
    const [showQuicklinks, setShowQuicklinksState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-quicklinks") !== "false";
    });
    const [quicklinksStyle, setQuicklinksStyleState] = useState<QuicklinksStyle>(() => {
        if (typeof window === "undefined")
            return "pills";
        const saved = settings.get("settings-quicklinks-style");
        return saved === "dock" || saved === "grid" ? saved : "pills";
    });
    const [quicklinksShape, setQuicklinksShapeState] = useState<QuicklinksShape>(() => {
        if (typeof window === "undefined")
            return "pill";
        const saved = settings.get("settings-quicklinks-shape");
        return saved === "rounded" || saved === "sharp" ? saved : "pill";
    });
    const [showKeycaps, setShowKeycapsState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-quicklinks-keycaps") !== "false";
    });
    const [showLabels, setShowLabelsState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-quicklinks-labels") !== "false";
    });
    const [showAddButton, setShowAddButtonState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-quicklinks-add-button") !== "false";
    });
    const [quicklinks, setQuicklinksState] = useState<Quicklink[]>(() => {
        if (typeof window === "undefined")
            return [];
        const savedLinks = settings.get("quicklinks");
        if (savedLinks) {
            try {
                return JSON.parse(savedLinks);
            }
            catch {
                return DEFAULT_QUICKLINKS;
            }
        }
        return DEFAULT_QUICKLINKS;
    });
    useEffect(() => {
        const handleUpdate = () => {
            setShowQuicklinksState(settings.get("settings-quicklinks") !== "false");
            const savedStyle = settings.get("settings-quicklinks-style");
            setQuicklinksStyleState(savedStyle === "dock" || savedStyle === "grid" ? savedStyle : "pills");
            const savedShape = settings.get("settings-quicklinks-shape");
            setQuicklinksShapeState(savedShape === "rounded" || savedShape === "sharp" ? savedShape : "pill");
            setShowKeycapsState(settings.get("settings-quicklinks-keycaps") !== "false");
            setShowLabelsState(settings.get("settings-quicklinks-labels") !== "false");
            setShowAddButtonState(settings.get("settings-quicklinks-add-button") !== "false");
            const savedLinks = settings.get("quicklinks");
            if (savedLinks) {
                try {
                    setQuicklinksState(JSON.parse(savedLinks));
                }
                catch {
                    setQuicklinksState(DEFAULT_QUICKLINKS);
                }
            }
        };
        const unsubscribe = settings.subscribe((key) => {
            if (key === "quicklinks" || key.startsWith("settings-quicklinks")) {
                handleUpdate();
            }
        });
        return unsubscribe;
    }, []);
    const setShowQuicklinks = useCallback((val: boolean) => {
        setShowQuicklinksState(val);
        settings.set("settings-quicklinks", val ? "true" : "false");
    }, []);
    const setQuicklinksStyle = useCallback((val: QuicklinksStyle) => {
        setQuicklinksStyleState(val);
        settings.set("settings-quicklinks-style", val);
    }, []);
    const setQuicklinksShape = useCallback((val: QuicklinksShape) => {
        setQuicklinksShapeState(val);
        settings.set("settings-quicklinks-shape", val);
    }, []);
    const setShowKeycaps = useCallback((val: boolean) => {
        setShowKeycapsState(val);
        settings.set("settings-quicklinks-keycaps", val ? "true" : "false");
    }, []);
    const setShowLabels = useCallback((val: boolean) => {
        setShowLabelsState(val);
        settings.set("settings-quicklinks-labels", val ? "true" : "false");
    }, []);
    const setShowAddButton = useCallback((val: boolean) => {
        setShowAddButtonState(val);
        settings.set("settings-quicklinks-add-button", val ? "true" : "false");
    }, []);
    const saveLinks = useCallback((updated: Quicklink[]) => {
        setQuicklinksState(updated);
        settings.set("quicklinks", JSON.stringify(updated));
    }, []);
    const addOrEditLink = useCallback((title: string, url: string, iconType: "auto" | "emoji" | "text" = "auto", customIcon?: string, editingId?: string | null): boolean => {
        if (!title.trim() || !url.trim())
            return false;
        let formattedUrl = url.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = "https://" + formattedUrl;
        }
        let updated: Quicklink[];
        if (editingId) {
            updated = quicklinks.map((l) => l.id === editingId
                ? {
                    ...l,
                    title: title.trim(),
                    url: formattedUrl,
                    iconType,
                    customIcon: iconType !== "auto" && customIcon ? customIcon.trim() : undefined,
                }
                : l);
        }
        else {
            if (quicklinks.length >= 12)
                return false;
            const newLink: Quicklink = {
                id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                title: title.trim(),
                url: formattedUrl,
                iconType,
                customIcon: iconType !== "auto" && customIcon ? customIcon.trim() : undefined,
            };
            updated = [...quicklinks, newLink];
        }
        saveLinks(updated);
        return true;
    }, [quicklinks, saveLinks]);
    const deleteLink = useCallback((id: string) => {
        const updated = quicklinks.filter((l) => l.id !== id);
        saveLinks(updated);
    }, [quicklinks, saveLinks]);
    const moveLink = useCallback((index: number, direction: "up" | "down") => {
        const updated = [...quicklinks];
        const targetIdx = direction === "up" ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= updated.length)
            return;
        const temp = updated[index];
        updated[index] = updated[targetIdx];
        updated[targetIdx] = temp;
        saveLinks(updated);
    }, [quicklinks, saveLinks]);
    return {
        showQuicklinks,
        setShowQuicklinks,
        quicklinksStyle,
        setQuicklinksStyle,
        quicklinksShape,
        setQuicklinksShape,
        showKeycaps,
        setShowKeycaps,
        showLabels,
        setShowLabels,
        showAddButton,
        setShowAddButton,
        quicklinks,
        saveLinks,
        addOrEditLink,
        deleteLink,
        moveLink,
    };
}
