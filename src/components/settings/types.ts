import type { useAppearanceManager } from "@/utils/useAppearanceManager";
import type { useBackgroundManager } from "@/utils/useBackgroundManager";
import type { useSearchManager } from "@/utils/useSearchManager";
import type { useQuicklinksManager } from "@/utils/useQuicklinksManager";
import type { useGeneralManager } from "@/utils/useGeneralManager";
export type AppearanceManager = ReturnType<typeof useAppearanceManager>;
export type BackgroundManager = ReturnType<typeof useBackgroundManager>;
export type SearchManager = ReturnType<typeof useSearchManager>;
export type QuicklinksManager = ReturnType<typeof useQuicklinksManager>;
export type GeneralManager = ReturnType<typeof useGeneralManager>;
export interface ToggleProps {
    checked: boolean;
    onChange: (next: boolean) => void;
    size?: "md" | "sm";
    label?: string;
}
export const PANE_TITLES: Record<string, {
    title: string;
    subtitle: string;
}> = {
    main: { title: "Preferences", subtitle: "Customize Atrium Tabs" },
    appearance: { title: "Appearance", subtitle: "Theme, Accent & Styling" },
    background: { title: "Wallpaper", subtitle: "Background Image & Effects" },
    search: { title: "Search Engines", subtitle: "Active Provider & Bangs" },
    quicklinks: { title: "Shortcuts Bar", subtitle: "Shortcuts & Quicklinks" },
    layout: { title: "Interface & Layout", subtitle: "Styling & Page Structure" },
    general: { title: "General & Weather", subtitle: "Display Name & Location" },
    support: { title: "Support & About", subtitle: "Discord & Information" },
};
