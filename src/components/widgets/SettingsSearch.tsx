import { useEffect, useRef, useState } from "react";
import { Search, X, Moon, Sun, Palette, Eye, Cpu, Image as ImageIcon, Upload, Link as LinkIcon, Compass, SlidersHorizontal, Sparkles, Globe, LayoutGrid, User, CloudSun, Thermometer, MessageSquare, MapPin, Zap, Settings2, RotateCw, ExternalLink, Plus, Type, Info, Clock, Pencil, LayoutTemplate, Quote, Mail, Command, } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { ACCENT_PRESETS } from "@/utils/accent";
import { searchSettings, type SettingEntry } from "@/utils/settingsSearch";
import type { useAppearanceManager } from "@/utils/useAppearanceManager";
import type { useBackgroundManager } from "@/utils/useBackgroundManager";
import type { useSearchManager } from "@/utils/useSearchManager";
import type { useQuicklinksManager } from "@/utils/useQuicklinksManager";
import type { useGeneralManager } from "@/utils/useGeneralManager";
type AppearanceManager = ReturnType<typeof useAppearanceManager>;
type BackgroundManager = ReturnType<typeof useBackgroundManager>;
type SearchManager = ReturnType<typeof useSearchManager>;
type QuicklinksManager = ReturnType<typeof useQuicklinksManager>;
type GeneralManager = ReturnType<typeof useGeneralManager>;
interface SettingsSearchProps {
    query: string;
    onQueryChange: (query: string) => void;
    onSelect: (entry: SettingEntry) => void;
    appearance: AppearanceManager;
    background: BackgroundManager;
    search: SearchManager;
    quicklinks: QuicklinksManager;
    general: GeneralManager;
}
const ICONS: Record<string, LucideIcon> = {
    theme: Sun,
    accent: Palette,
    glow: Eye,
    lowmotion: Cpu,
    source: Sparkles,
    bing: Compass,
    curated: ImageIcon,
    upload: Upload,
    "url-link": LinkIcon,
    opacity: SlidersHorizontal,
    dim: SlidersHorizontal,
    blur: SlidersHorizontal,
    "auto-accent": Sparkles,
    readability: Eye,
    "new-tab": ExternalLink,
    "search-style": LayoutTemplate,
    "search-shape": LayoutTemplate,
    "search-color": Palette,
    provider: Globe,
    bangs: Zap,
    "custom-engines": Settings2,
    "restore-defaults": RotateCw,
    "ql-enable": LayoutGrid,
    "ql-layout": LayoutTemplate,
    "ql-shape": LayoutTemplate,
    "ql-keycaps": Command,
    "ql-labels": Type,
    "ql-add-btn": Plus,
    "ql-manage": Pencil,
    greeting: Sparkles,
    "greeting-mode": Quote,
    name: User,
    "weather-toggle": CloudSun,
    location: MapPin,
    "temp-unit": Thermometer,
    forecast: Clock,
    "mail-toggle": Mail,
    "mail-provider": Mail,
    "mail-look": Mail,
    "settings-sync": RotateCw,
    discord: MessageSquare,
    about: Info,
};
const ON_OFF = (on: boolean) => (on ? "On" : "Off");
const BG_MODE_NAMES: Record<string, string> = {
    default: "Default Glow",
    bing: "Bing Daily",
    curated: "Presets & Gallery",
    upload: "Custom Upload",
    url: "Image Link",
};
function accentLabel(appearance: AppearanceManager): string {
    switch (appearance.accentColor) {
        case "auto":
            return "Auto";
        case "custom":
            return "Custom";
        default:
            return (ACCENT_PRESETS.find((p) => p.id === appearance.accentColor)?.name ??
                appearance.accentColor);
    }
}
function buildEntries(props: SettingsSearchProps): SettingEntry[] {
    const { appearance, background, search, quicklinks, general } = props;
    const weatherCity = general.weatherMode === "auto"
        ? "GPS Auto"
        : general.manualLocation
            ? general.manualLocation.name
            : "Manual";
    const entries: SettingEntry[] = [
        {
            id: "accent",
            group: "Appearance",
            label: "Accent Palette",
            description: "Highlight color for focus rings & glow",
            keywords: ["accent", "color", "colour", "palette", "hue", "swatch", "custom color", "dot"],
            pane: "main",
            anchor: "accent",
            value: accentLabel(appearance),
        },
        {
            id: "glow",
            group: "Motion & Effects",
            label: "Ambient Glow",
            description: "Soft breathing halo behind the search bar",
            keywords: ["glow", "halo", "bloom", "ambient", "breathing", "effect", "animation"],
            pane: "main",
            anchor: "glow",
            value: ON_OFF(appearance.glowEnabled),
        },
        {
            id: "lowmotion",
            group: "Motion & Effects",
            label: "Low Motion Mode",
            description: "Disables animations, blur & ambient loops",
            keywords: [
                "low motion",
                "performance",
                "reduce motion",
                "reduced motion",
                "disable animations",
                "blur",
                "accessibility",
            ],
            pane: "main",
            anchor: "lowmotion",
            value: ON_OFF(appearance.performanceMode),
        },
        {
            id: "source",
            group: "Wallpaper",
            label: "Background Source",
            description: "Default, Bing Daily, presets, upload or link",
            keywords: [
                "background",
                "wallpaper",
                "source",
                "default",
                "gradient",
                "obsidian",
                "image",
                "photo",
            ],
            pane: "background",
            value: BG_MODE_NAMES[background.bgType] ?? background.bgType,
        },
        {
            id: "bing",
            group: "Wallpaper",
            label: "Bing Daily Wallpaper",
            description: "Auto-rotating photo of the day",
            keywords: ["bing", "daily", "wallpaper", "photo", "auto rotate", "refresh", "of the day"],
            pane: "background",
        },
        {
            id: "curated",
            group: "Wallpaper",
            label: "Curated Presets & Web Gallery",
            description: "Browse hand-picked and web photos",
            keywords: ["curated", "preset", "gallery", "picsum", "web", "photos", "surprise me"],
            pane: "background",
        },
        {
            id: "upload",
            group: "Wallpaper",
            label: "Upload Custom Wallpaper",
            description: "Use an image saved on this device",
            keywords: ["upload", "file", "custom", "local", "png", "jpg", "webp", "own image"],
            pane: "background",
        },
        {
            id: "url-link",
            group: "Wallpaper",
            label: "Wallpaper Image Link",
            description: "Paste an image URL from the web",
            keywords: ["url", "link", "paste", "https", "remote", "image address"],
            pane: "background",
        },
        {
            id: "opacity",
            group: "Wallpaper",
            label: "Wallpaper Opacity",
            description: "Overall visibility of the image",
            keywords: ["opacity", "transparent", "alpha", "fade"],
            pane: "background",
            anchor: "bg-adjustments",
            value: `${background.bgOpacity}%`,
        },
        {
            id: "dim",
            group: "Wallpaper",
            label: "Darken Overlay",
            description: "Dim layer that keeps text readable",
            keywords: ["dim", "darken", "overlay", "scrim", "darkness", "shade", "readability"],
            pane: "background",
            anchor: "bg-adjustments",
            value: `${background.bgDim}%`,
        },
        {
            id: "blur",
            group: "Wallpaper",
            label: "Blur Intensity",
            description: "Softens the image behind the UI",
            keywords: ["blur", "soft", "focus", "sharpen", "crisp"],
            pane: "background",
            anchor: "bg-adjustments",
            value: `${background.bgBlur}px`,
        },
        {
            id: "auto-accent",
            group: "Wallpaper",
            label: "Auto Accent Match",
            description: "Sample accent colors from the wallpaper",
            keywords: ["auto accent", "match", "extract", "dynamic", "from wallpaper", "colors"],
            pane: "background",
            anchor: "bg-adjustments",
            value: ON_OFF(appearance.accentColor === "auto"),
        },
        {
            id: "readability",
            group: "Wallpaper",
            label: "Smart Readability",
            description: "Adaptive contrast for bright backgrounds",
            keywords: ["readability", "contrast", "legibility", "scrim", "safeguard", "bright", "text"],
            pane: "background",
            anchor: "bg-adjustments",
            value: ON_OFF(background.smartReadability),
        },
        {
            id: "new-tab",
            group: "Search",
            label: "Open Search in New Tab",
            description: "Launch search results in a fresh tab",
            keywords: ["new tab", "tab", "window", "launch", "results", "background tab"],
            pane: "search",
            value: ON_OFF(search.openInNewTab),
        },
        {
            id: "search-style",
            group: "Interface & Layout",
            label: "Search Bar Style",
            description: "Frosted glass or opaque solid surface",
            keywords: [
                "search bar style",
                "search style",
                "glass",
                "glassy",
                "solid",
                "opaque",
                "translucent",
                "material",
                "blur",
                "surface",
                "interface",
                "layout",
            ],
            pane: "layout",
            anchor: "search-style",
            value: search.searchBarStyle === "solid" ? "Solid" : "Glassy",
        },
        {
            id: "search-shape",
            group: "Interface & Layout",
            label: "Search Bar Shape",
            description: "Pill, Brave-style rounded or sharp corners",
            keywords: [
                "search bar shape",
                "interface",
                "layout",
                "shape",
                "square",
                "brave",
                "bing",
                "corners",
                "corner",
                "radius",
                "pill",
                "rounded",
                "sharp",
            ],
            pane: "layout",
            anchor: "search-shape",
            value: search.searchBarShape === "rounded"
                ? "Rounded (Brave)"
                : search.searchBarShape === "sharp"
                    ? "Sharp"
                    : "Pill",
        },
        {
            id: "search-color",
            group: "Interface & Layout",
            label: "Search Bar Color",
            description: "Default, theme accent, color presets or custom tint",
            keywords: [
                "search bar color",
                "search color",
                "search tint",
                "custom color",
                "search background",
                "sage",
                "violet",
                "amber",
                "rose",
                "cyan",
                "color",
                "hue",
                "tint",
                "palette",
            ],
            pane: "layout",
            anchor: "search-color",
            value: search.searchBarColor === "default"
                ? "Default"
                : search.searchBarColor === "accent"
                    ? "Theme Accent"
                    : search.searchBarColor === "custom"
                        ? "Custom"
                        : search.searchBarColor,
        },
        {
            id: "search-new-tab",
            group: "Search",
            label: "Open in New Tab",
            description: "Launch search queries into a new browser tab",
            keywords: [
                "new tab",
                "open in new tab",
                "tab",
                "search tab",
                "window",
                "launch",
                "external",
            ],
            pane: "search",
            anchor: "search-new-tab",
            value: ON_OFF(search.openInNewTab),
        },
        {
            id: "search-autofocus",
            group: "Search",
            label: "Auto-focus Search Bar",
            description: "Focus search input immediately when opening a new tab",
            keywords: [
                "autofocus",
                "focus",
                "search",
                "input",
                "cursor",
                "typing",
                "keyboard",
                "instant",
                "auto focus",
            ],
            pane: "search",
            anchor: "search-autofocus",
            value: ON_OFF(search.autoFocus),
        },
        {
            id: "provider",
            group: "Search",
            label: "Search Provider",
            description: "Default engine used by the search bar",
            keywords: [
                "provider",
                "engine",
                "default",
                "google",
                "duckduckgo",
                "brave",
                "ecosia",
                "startpage",
                "privacy",
                "tracking",
            ],
            pane: "search",
            anchor: "search-provider",
            value: search.availableEngines.find((e) => e.id === search.searchEngineId)?.name,
        },
        {
            id: "bangs",
            group: "Search",
            label: "Search Bangs Support",
            description: "Shortcuts like !yt, !w or !gh",
            keywords: ["bangs", "bang", "shortcuts", "sites", "route", "redirect", "!"],
            pane: "search",
            anchor: "search-bangs",
        },
        {
            id: "custom-engines",
            group: "Search",
            label: "Custom Engines",
            description: "Add your own search providers",
            keywords: ["custom", "engines", "add engine", "own", "provider", "list"],
            pane: "search",
            anchor: "search-custom",
            value: search.customEngines.length > 0 ? `${search.customEngines.length} saved` : undefined,
        },
        ...(search.deletedEngineIds.length > 0
            ? [
                {
                    id: "restore-defaults",
                    group: "Search",
                    label: "Restore Default Engines",
                    description: "Bring back engines you removed",
                    keywords: ["restore", "reset", "defaults", "deleted", "undo", "engines"],
                    pane: "search" as const,
                    anchor: "search-provider" as const,
                },
            ]
            : []),
        {
            id: "ql-enable",
            group: "Shortcuts",
            label: "Enable Shortcuts Bar",
            description: "Show the quick links dock on the page",
            keywords: ["shortcuts", "bar", "quick links", "dock", "enable", "show", "tiles", "icons"],
            pane: "quicklinks",
            value: ON_OFF(quicklinks.showQuicklinks),
        },
        {
            id: "ql-layout",
            group: "Shortcuts",
            label: "Shortcuts Style",
            description: "Fluid pills, glass shelf, or quiet grid",
            keywords: ["layout", "style", "pills", "dock", "grid", "glass shelf", "fluid pills", "quiet grid", "shortcuts style"],
            pane: "quicklinks",
            anchor: "quicklinks-style",
            value: quicklinks.quicklinksStyle === "dock"
                ? "Glass Shelf"
                : quicklinks.quicklinksStyle === "grid"
                    ? "Quiet Grid"
                    : "Fluid Pills",
        },
        {
            id: "ql-shape",
            group: "Shortcuts",
            label: "Corner Geometry",
            description: "Roundness of shortcut items and containers",
            keywords: ["shape", "corners", "roundness", "pill", "rounded", "sharp", "shortcuts shape"],
            pane: "quicklinks",
            anchor: "quicklinks-shape",
            value: quicklinks.quicklinksShape
                ? quicklinks.quicklinksShape.charAt(0).toUpperCase() + quicklinks.quicklinksShape.slice(1)
                : "Pill",
        },
        {
            id: "ql-keycaps",
            group: "Shortcuts",
            label: "Tactile Keycaps",
            description: "Display hardware-style number hotkeys (1-9)",
            keywords: ["keycaps", "keys", "numbers", "hotkeys", "1-9", "shortcuts keycaps"],
            pane: "quicklinks",
            value: ON_OFF(quicklinks.showKeycaps),
        },
        {
            id: "ql-labels",
            group: "Shortcuts",
            label: "Show Text Labels",
            description: "Names under each shortcut icon",
            keywords: ["labels", "text", "names", "captions", "under", "titles"],
            pane: "quicklinks",
            value: ON_OFF(quicklinks.showLabels),
        },
        {
            id: "ql-add-btn",
            group: "Shortcuts",
            label: 'Show "+" Add Button',
            description: "Quick access to add a new shortcut",
            keywords: ["add button", "plus", "new tile", "add link", "plus button"],
            pane: "quicklinks",
            value: ON_OFF(quicklinks.showAddButton),
        },
        {
            id: "ql-manage",
            group: "Shortcuts",
            label: "Add & Manage Shortcuts",
            description: "Create, reorder or remove your links",
            keywords: ["add", "delete", "reorder", "remove", "edit", "manage", "links", "shortcuts list"],
            pane: "quicklinks",
            value: `${quicklinks.quicklinks.length}/12`,
        },
        {
            id: "greeting",
            group: "General",
            label: "Greeting Card",
            description: "Header greeting headline and daily quote",
            keywords: [
                "greeting",
                "greeting card",
                "card",
                "quote",
                "salutation",
                "headline",
                "welcome",
                "good morning",
                "good evening",
                "good afternoon",
                "disable greeting",
                "hide greeting",
            ],
            pane: "general",
            anchor: "gen-greeting",
            value: ON_OFF(general.showGreeting),
        },
        {
            id: "greeting-mode",
            group: "General",
            label: "Card Content",
            description: "Keep quote only, greeting headline only, or both",
            keywords: [
                "greeting",
                "quote",
                "daily quote",
                "inspirational quote",
                "quote only",
                "greeting only",
                "salutation",
                "headline",
                "card content",
                "mode",
            ],
            pane: "general",
            anchor: "gen-greeting-mode",
            fallbackAnchor: "gen-greeting",
            value: general.showGreeting
                ? general.greetingMode === "both"
                    ? "Both"
                    : general.greetingMode === "greeting"
                        ? "Greeting"
                        : "Quote"
                : undefined,
        },
        {
            id: "name",
            group: "General",
            label: "Your Display Name",
            description: "Personalizes the greeting headline",
            keywords: ["name", "username", "greeting", "display", "personalize", "hello"],
            pane: "general",
            anchor: "gen-name",
            fallbackAnchor: "gen-greeting",
            value: general.username.trim() ? general.username : undefined,
        },
        {
            id: "greeting-gradient-start",
            group: "General",
            label: "Gradient Direction",
            description: "Where the greeting gradient starts flowing from",
            keywords: [
                "gradient",
                "greeting gradient",
                "direction",
                "left",
                "right",
                "top",
                "bottom",
                "headline gradient",
                "accent fade",
            ],
            pane: "general",
            anchor: "gen-gradient-start",
            fallbackAnchor: "gen-greeting",
            value: general.showGreeting && general.greetingMode !== "quote"
                ? general.greetingGradientStart === "left"
                    ? "Left"
                    : general.greetingGradientStart === "right"
                        ? "Right"
                        : general.greetingGradientStart === "top"
                            ? "Top"
                            : "Bottom"
                : undefined,
        },
        {
            id: "greeting-gradient-stop",
            group: "General",
            label: "Accent Spread",
            description: "How much of the greeting headline is accent-colored",
            keywords: [
                "accent",
                "spread",
                "gradient stop",
                "color reach",
                "fade length",
                "headline gradient",
                "accent amount",
                "more accent",
                "less accent",
            ],
            pane: "general",
            anchor: "gen-gradient-stop",
            fallbackAnchor: "gen-greeting",
            value: general.showGreeting && general.greetingMode !== "quote"
                ? `${100 - general.greetingGradientStop}%`
                : undefined,
        },
        {
            id: "weather-toggle",
            group: "General",
            label: "Weather Widget",
            description: "Forecast in the top corner",
            keywords: ["weather", "widget", "show", "corner", "forecast", "temperature"],
            pane: "general",
            anchor: "gen-weather",
            value: ON_OFF(general.showWeather),
        },
        {
            id: "location",
            group: "General",
            label: "Weather Location",
            description: "GPS auto-detect or a specific city",
            keywords: ["location", "gps", "city", "auto", "manual", "place", "geolocation", "search city"],
            pane: "general",
            anchor: "weather-location",
            fallbackAnchor: "gen-weather",
            value: weatherCity,
        },
        {
            id: "temp-unit",
            group: "General",
            label: "Temperature Unit",
            description: "Show forecast in celsius or fahrenheit",
            keywords: ["celsius", "fahrenheit", "temp", "unit", "degrees", "°c", "°f"],
            pane: "general",
            anchor: "weather-temp",
            fallbackAnchor: "gen-weather",
            value: general.tempUnit === "celsius" ? "Celsius" : "Fahrenheit",
        },
        {
            id: "forecast",
            group: "General",
            label: "Hourly Forecast on Hover",
            description: "Preview the next hours over the weather pill",
            keywords: ["forecast", "hourly", "hover", "popover", "preview", "hours"],
            pane: "general",
            anchor: "weather-forecast",
            fallbackAnchor: "gen-weather",
            value: ON_OFF(general.showForecast),
        },
        {
            id: "mail-toggle",
            group: "General",
            label: "Email Shortcut",
            description: "Quick access to your inbox in the top corner",
            keywords: [
                "mail",
                "email",
                "inbox",
                "gmail",
                "outlook",
                "proton",
                "yahoo",
                "fastmail",
                "webmail",
                "messages",
            ],
            pane: "general",
            anchor: "gen-mail",
            value: ON_OFF(general.showMailButton),
        },
        {
            id: "mail-provider",
            group: "General",
            label: "Email Provider",
            description: "Gmail, Outlook, Yahoo, Proton, iCloud, Fastmail, or Custom",
            keywords: [
                "mail provider",
                "email provider",
                "gmail",
                "outlook",
                "yahoo",
                "proton",
                "icloud",
                "fastmail",
                "custom email",
                "inbox service",
            ],
            pane: "general",
            anchor: "mail-provider",
            fallbackAnchor: "gen-mail",
            value: general.mailService === "custom"
                ? "Custom"
                : general.mailService.charAt(0).toUpperCase() + general.mailService.slice(1),
        },
        {
            id: "mail-look",
            group: "General",
            label: "Email Button Appearance",
            description: "Whisper Pill, Icon Only, or Glass Badge",
            keywords: [
                "mail style",
                "email style",
                "mail look",
                "appearance",
                "pill",
                "icon",
                "glass badge",
                "button style",
            ],
            pane: "general",
            anchor: "mail-style",
            fallbackAnchor: "gen-mail",
            value: general.mailStyle === "pill"
                ? "Whisper Pill"
                : general.mailStyle === "icon"
                    ? "Icon Only"
                    : "Glass Badge",
        },
        {
            id: "settings-sync",
            group: "General",
            label: "Firefox Settings Sync",
            description: "Mirror preferences across devices via your Firefox account",
            keywords: [
                "sync",
                "firefox sync",
                "settings sync",
                "cloud",
                "devices",
                "account",
                "backup",
                "mirror",
                "firefox",
                "storage",
            ],
            pane: "general",
            anchor: "gen-sync",
            value: ON_OFF(general.syncEnabled),
        },
        {
            id: "discord",
            group: "Support",
            label: "Discord Community",
            description: "Join the official Discord server",
            keywords: ["discord", "community", "support", "invite", "chat", "join server"],
            pane: "support",
        },
        {
            id: "backup-export",
            group: "Support",
            label: "Backup & Restore",
            description: "Export settings to a JSON file or restore a backup",
            keywords: ["backup", "export", "import", "restore", "transfer", "save settings", "load settings", "json"],
            pane: "support",
            anchor: "backup-reset",
        },
        {
            id: "reset-settings",
            group: "Support",
            label: "Reset All Settings",
            description: "Revert all settings and quicklinks to their defaults",
            keywords: ["reset", "restore defaults", "factory reset", "clear settings", "defaults"],
            pane: "support",
            anchor: "backup-reset",
        },
    ];
    return entries;
}
const SUGGESTION_IDS = [
    "accent",
    "glow",
    "upload",
    "provider",
    "bangs",
    "weather-toggle",
    "location",
    "temp-unit",
    "discord",
];
export default function SettingsSearch(props: SettingsSearchProps) {
    const { query, onQueryChange, onSelect } = props;
    const trimmed = query.trim();
    const entries = buildEntries(props);
    const results = trimmed.length >= 2 ? searchSettings(entries, trimmed) : [];
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    useEffect(() => setActiveIndex(0), [trimmed]);
    useEffect(() => {
        if (activeIndex >= results.length)
            setActiveIndex(Math.max(0, results.length - 1));
    }, [results.length, activeIndex]);
    useEffect(() => {
        const container = listRef.current;
        if (!container || results.length === 0)
            return;
        const row = container.children[activeIndex] as HTMLElement | undefined;
        row?.scrollIntoView({ block: "nearest" });
    }, [activeIndex, results.length]);
    const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
        if (results.length === 0)
            return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % results.length);
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            onSelect(results[activeIndex]);
        }
    };
    const showingSearch = trimmed.length > 0;
    return (<div className="flex flex-col gap-3 animate-suggest-in">

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[var(--foreground)]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"/>
        <input ref={inputRef} type="text" role="combobox" aria-expanded={showingSearch} aria-controls="settings-search-results" aria-label="Search settings" aria-activedescendant={showingSearch && results[activeIndex] ? `setting-result-${results[activeIndex].id}` : undefined} value={query} onChange={(e) => onQueryChange(e.target.value)} onKeyDown={handleKeyDown} placeholder='Search settings, try "glow" or "bangs"' className="w-full h-[38px] pl-9 pr-8 rounded-xl bg-[var(--foreground)]/4 border border-[var(--glass-border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] transition-all duration-300"/>
        {query ? (<button type="button" onClick={() => {
                onQueryChange("");
                inputRef.current?.focus();
            }} aria-label="Clear settings search" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/8 cursor-pointer active:scale-90 transition-all duration-200">
            <X className="w-3.5 h-3.5"/>
          </button>) : null}
      </div>

      {showingSearch && (<div id="settings-search-results" role="listbox" aria-label="Settings results" ref={listRef} className="flex flex-col gap-1">
          {results.length > 0 ? (results.map((entry, index) => {
                const Icon = ICONS[entry.id] ?? Settings2;
                const isActive = index === activeIndex;
                return (<button key={entry.id} id={`setting-result-${entry.id}`} role="option" aria-selected={isActive} type="button" onClick={() => onSelect(entry)} onMouseEnter={() => setActiveIndex(index)} className={`flex items-center gap-3 p-2.5 max-sm:p-3 rounded-xl text-left transition-colors duration-200 cursor-pointer ${isActive ? "bg-[var(--accent)]/12" : "hover:bg-[var(--foreground)]/4"}`}>
                  <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 flex items-center justify-center text-[var(--accent)] shrink-0">
                    <Icon className="w-4 h-4"/>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-[var(--foreground)] truncate">
                      {entry.label}
                    </span>
                    <span className="text-[10px] text-[var(--foreground)]/45 max-sm:whitespace-normal">
                      <span className="uppercase tracking-wider font-medium text-[var(--foreground)]/35">
                        {entry.group}
                      </span>
                      <span className="mx-1 text-[var(--foreground)]/25">&middot;</span>
                      <span className="sm:whitespace-nowrap sm:truncate">
                        {entry.description}
                      </span>
                    </span>
                  </div>
                  {entry.value && (<span className={`text-[10px] font-medium shrink-0 ${entry.value === "On" || entry.value === "Auto"
                            ? "text-[var(--accent)]"
                            : "text-[var(--foreground)]/45"}`}>
                      {entry.value}
                    </span>)}
                </button>);
            })) : trimmed.length < 2 ? (<p className="text-[11px] text-[var(--foreground)]/35 px-1 py-2">
              Keep typing to search across every setting&hellip;
            </p>) : (<div className="flex flex-col gap-2.5 px-1 py-3">
              <p className="text-xs text-[var(--foreground)]/50">
                No settings match &ldquo;<span className="text-[var(--foreground)]/75">{trimmed}</span>
                &rdquo;
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTION_IDS.map((id) => {
                    const entry = entries.find((e) => e.id === id);
                    if (!entry)
                        return null;
                    return (<button key={id} type="button" onClick={() => onSelect(entry)} className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-[var(--glass-border)] bg-[var(--foreground)]/3 text-[var(--foreground)]/70 hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors duration-200 cursor-pointer active:scale-95">
                      {entry.label}
                    </button>);
                })}
              </div>
            </div>)}
        </div>)}
    </div>);
}
