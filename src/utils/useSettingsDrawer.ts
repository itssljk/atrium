import { useEffect, useState, useCallback, useRef } from "react";
export type SettingsPane = "main" | "general" | "appearance" | "background" | "search" | "quicklinks" | "layout" | "support";
interface OpenSettingsEventDetail {
    pane?: SettingsPane;
    opener?: HTMLElement;
}
const SETTINGS_EVENT = "atrium-open-settings";
const SETTINGS_CLOSE_EVENT = "atrium-close-settings";
const LEGACY_SETTINGS_EVENT = "slate-open-settings";
const LEGACY_SETTINGS_CLOSE_EVENT = "slate-close-settings";
export function openSettingsDrawer(pane: SettingsPane = "main", opener?: HTMLElement) {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new CustomEvent<OpenSettingsEventDetail>(SETTINGS_EVENT, { detail: { pane, opener } }));
}
export function closeSettingsDrawer() {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new CustomEvent(SETTINGS_CLOSE_EVENT));
}
export function useSettingsDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [activePane, setActivePane] = useState<SettingsPane>("main");
    const openerRef = useRef<HTMLElement | null>(null);
    const open = useCallback((pane: SettingsPane = "main", opener?: HTMLElement) => {
        openerRef.current ??= opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
        setHasOpened(true);
        setActivePane(pane);
        setIsOpen(true);
    }, []);
    const close = useCallback(() => {
        setIsOpen(false);
    }, []);
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get("settings") === "open" || params.has("tab") || params.has("pane")) {
                const target = (params.get("tab") || params.get("pane") || "main") as SettingsPane;
                const validPanes: SettingsPane[] = ["main", "general", "appearance", "background", "search", "quicklinks", "layout", "support"];
                open(validPanes.includes(target) ? target : "main");
                const newUrl = window.location.pathname + window.location.hash;
                window.history.replaceState({}, "", newUrl);
            }
        }
        catch { }
        const handleOpenEvent = (e: Event) => {
            const customEvent = e as CustomEvent<OpenSettingsEventDetail>;
            const pane = customEvent.detail?.pane || "main";
            open(pane, customEvent.detail?.opener);
        };
        const handleCloseEvent = () => {
            close();
        };
        window.addEventListener(SETTINGS_EVENT, handleOpenEvent);
        window.addEventListener(SETTINGS_CLOSE_EVENT, handleCloseEvent);
        window.addEventListener(LEGACY_SETTINGS_EVENT, handleOpenEvent);
        window.addEventListener(LEGACY_SETTINGS_CLOSE_EVENT, handleCloseEvent);
        return () => {
            window.removeEventListener(SETTINGS_EVENT, handleOpenEvent);
            window.removeEventListener(SETTINGS_CLOSE_EVENT, handleCloseEvent);
            window.removeEventListener(LEGACY_SETTINGS_EVENT, handleOpenEvent);
            window.removeEventListener(LEGACY_SETTINGS_CLOSE_EVENT, handleCloseEvent);
        };
    }, [open, close]);
    return {
        isOpen,
        hasOpened,
        activePane,
        setActivePane,
        open,
        close,
        openerRef,
    };
}
