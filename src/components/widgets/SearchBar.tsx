"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { openSettingsDrawer } from "@/utils/useSettingsDrawer";
import { settings } from "@/utils/settings";
import { ENGINES, getEngines, fetchSuggestionsForEngine, supportsRemoteSuggestions, faviconUrl, parseSearchQuery, detectBang, getBangSuggestions, loadCustomBangs, loadDeletedBangs, DEFAULT_WEB_ENGINE_ID, type SearchEngine, } from "@/config/searchEngines";
import type { CustomBang } from "@/settings/types";
import { ACCENT_PRESETS } from "@/utils/accent";
import type { SearchBarShape, SearchBarStyle, SearchBarColor } from "@/utils/useSearchManager";
export type SuggestionItem = {
    type: "query";
    text: string;
} | {
    type: "bang";
    bang: string;
    name: string;
    domain: string;
    isCustom?: boolean;
};
export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [selectedEngineId, setSelectedEngineId] = useState(DEFAULT_WEB_ENGINE_ID);
    const [faviconError, setFaviconError] = useState(false);
    const [shape, setShape] = useState<SearchBarShape>(() => {
        if (typeof window === "undefined")
            return "pill";
        const saved = settings.get("search-bar-shape");
        return saved === "rounded" || saved === "sharp" ? saved : "pill";
    });
    const [searchStyle, setSearchStyle] = useState<SearchBarStyle>(() => {
        if (typeof window === "undefined")
            return "glass";
        const saved = settings.get("search-bar-style");
        return saved === "solid" ? "solid" : "glass";
    });
    const [searchColor, setSearchColor] = useState<SearchBarColor>(() => {
        if (typeof window === "undefined")
            return "default";
        const saved = settings.get("search-bar-color");
        const valid: SearchBarColor[] = ["default", "accent", "sage", "violet", "amber", "rose", "cyan", "custom"];
        if (saved && valid.includes(saved as SearchBarColor))
            return saved as SearchBarColor;
        return "default";
    });
    const [customColor, setCustomColor] = useState<string>(() => {
        if (typeof window === "undefined")
            return "#7ca38e";
        return settings.get("search-bar-custom-color", "#7ca38e");
    });
    const [engines, setEngines] = useState<SearchEngine[]>(() => {
        if (typeof window === "undefined")
            return ENGINES;
        return getEngines();
    });
    const [customBangs, setCustomBangs] = useState<CustomBang[]>(() => {
        if (typeof window === "undefined")
            return [];
        return loadCustomBangs();
    });
    const [deletedBangs, setDeletedBangs] = useState<string[]>(() => {
        if (typeof window === "undefined")
            return [];
        return loadDeletedBangs();
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const suggestTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<SuggestionItem[]>([]);
    const showSuggestionsRef = useRef(false);
    const activeIndexRef = useRef(-1);
    const enginesRef = useRef<SearchEngine[]>(engines);
    useEffect(() => {
        suggestionsRef.current = suggestions;
        showSuggestionsRef.current = showSuggestions;
        activeIndexRef.current = activeIndex;
        enginesRef.current = engines;
    }, [suggestions, showSuggestions, activeIndex, engines]);
    const activeEngine = engines.find((item) => item.id === selectedEngineId) || engines[0];
    const detectedBang = useMemo(() => {
        return detectBang(query, engines, customBangs, deletedBangs);
    }, [query, engines, customBangs, deletedBangs]);
    const [shortcutLabel, setShortcutLabel] = useState("/");
    useEffect(() => {
        if (!isMounted)
            return;
        let active = true;
        const trimmed = query.trim();
        if (trimmed.startsWith("!") && !trimmed.includes(" ")) {
            const bangMatches = getBangSuggestions(trimmed, 6, customBangs, deletedBangs);
            if (bangMatches.length > 0) {
                setSuggestions(bangMatches.map((b) => ({ type: "bang" as const, ...b })));
                setShowSuggestions(true);
                setActiveIndex(-1);
            }
            else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
            return;
        }
        if (trimmed.startsWith("!")) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        if (!trimmed || trimmed.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            setActiveIndex(-1);
            return;
        }
        if (!activeEngine || !supportsRemoteSuggestions(activeEngine)) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        if (suggestTimer.current)
            clearTimeout(suggestTimer.current);
        suggestTimer.current = setTimeout(async () => {
            try {
                const parsed = await fetchSuggestionsForEngine(activeEngine, trimmed);
                if (!active)
                    return;
                setSuggestions(parsed.map((text) => ({ type: "query" as const, text })));
                setActiveIndex(-1);
                setShowSuggestions(true);
            }
            catch {
                if (!active)
                    return;
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 250);
        return () => {
            active = false;
            if (suggestTimer.current)
                clearTimeout(suggestTimer.current);
        };
    }, [query, activeEngine, isMounted]);
    const selectSuggestion = (item: SuggestionItem) => {
        if (item.type === "bang") {
            setQuery(`${item.bang} `);
            setShowSuggestions(false);
            setActiveIndex(-1);
            inputRef.current?.focus();
            return;
        }
        setQuery(item.text);
        setShowSuggestions(false);
        setActiveIndex(-1);
        const { url: finalUrl } = parseSearchQuery(item.text.trim(), activeEngine, engines, customBangs, deletedBangs);
        const openInNewTab = settings.get("settings-search-new-tab") === "true";
        if (openInNewTab) {
            window.open(finalUrl, "_blank", "noopener,noreferrer");
            setQuery("");
        }
        else {
            window.location.href = finalUrl;
        }
    };
    useEffect(() => {
        setFaviconError(false);
    }, [activeEngine.id]);
    const handleOpenSearchSettings = useCallback(() => {
        if (showSuggestions) {
            setShowSuggestions(false);
            setActiveIndex(-1);
        }
        openSettingsDrawer("search");
    }, [showSuggestions]);
    useEffect(() => {
        setIsMounted(true);
        const savedEngineId = settings.get("search-engine-id");
        const enginesList = getEngines();
        setEngines(enginesList);
        if (savedEngineId && enginesList.some((e) => e.id === savedEngineId)) {
            setSelectedEngineId(savedEngineId);
        }
        else if (enginesList.length > 0) {
            setSelectedEngineId(enginesList[0].id);
        }
        const isMac = typeof window !== "undefined" &&
            (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes("Mac"));
        setShortcutLabel(isMac ? "⌘K" : "Ctrl+K");
        const shouldAutoFocus = settings.get("settings-search-autofocus") !== "false";
        if (shouldAutoFocus) {
            inputRef.current?.focus({ preventScroll: true });
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showSuggestionsRef.current && suggestionsRef.current.length > 0) {
                if (e.key === "Escape") {
                    setShowSuggestions(false);
                    setActiveIndex(-1);
                    return;
                }
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((prev) => (prev < suggestionsRef.current.length - 1 ? prev + 1 : 0));
                    return;
                }
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestionsRef.current.length - 1));
                    return;
                }
                if (e.key === "Enter" && activeIndexRef.current >= 0) {
                    e.preventDefault();
                    selectSuggestion(suggestionsRef.current[activeIndexRef.current]);
                    return;
                }
            }
            const isSlash = e.key === "/" &&
                document.activeElement?.tagName !== "INPUT" &&
                document.activeElement?.tagName !== "TEXTAREA";
            const isCmdK = (e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === "k";
            if (isSlash || isCmdK) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isInsideContainer = containerRef.current && containerRef.current.contains(target);
            if (!isInsideContainer) {
                if (showSuggestionsRef.current) {
                    setShowSuggestions(false);
                    setActiveIndex(-1);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);
        const handleEngineUpdate = () => {
            const engineId = settings.get("search-engine-id");
            const list = getEngines();
            setEngines(list);
            if (engineId && list.some((e) => e.id === engineId)) {
                setSelectedEngineId(engineId);
            }
            else if (list.length > 0) {
                setSelectedEngineId(list[0].id);
            }
        };
        const unsubscribeEngine = settings.subscribe((key) => {
            if (key === "search-engine-id" || key === "deleted-engines" || key === "custom-engines") {
                handleEngineUpdate();
            }
            if (key === "custom-bangs") {
                setCustomBangs(loadCustomBangs());
            }
            if (key === "deleted-bangs") {
                setDeletedBangs(loadDeletedBangs());
            }
            if (key === "search-bar-shape") {
                const saved = settings.get("search-bar-shape");
                setShape(saved === "rounded" || saved === "sharp" ? saved : "pill");
            }
            if (key === "search-bar-style") {
                const saved = settings.get("search-bar-style");
                setSearchStyle(saved === "solid" ? "solid" : "glass");
            }
            if (key === "search-bar-color") {
                const saved = settings.get("search-bar-color");
                const valid: SearchBarColor[] = ["default", "accent", "sage", "violet", "amber", "rose", "cyan", "custom"];
                setSearchColor(saved && valid.includes(saved as SearchBarColor) ? (saved as SearchBarColor) : "default");
            }
            if (key === "search-bar-custom-color") {
                setCustomColor(settings.get("search-bar-custom-color", "#7ca38e"));
            }
        });
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
            unsubscribeEngine();
        };
    }, []);
    const inputRadiusClass = shape === "rounded"
        ? "rounded-2xl"
        : shape === "sharp"
            ? "rounded-xl"
            : "rounded-full";
    const engineBtnRadiusClass = shape === "rounded"
        ? "rounded-xl"
        : shape === "sharp"
            ? "rounded-lg"
            : "rounded-full";
    const clearBtnRadiusClass = shape === "rounded"
        ? "rounded-xl"
        : shape === "sharp"
            ? "rounded-lg"
            : "rounded-full";
    const dropdownRadiusClass = shape === "sharp"
        ? "rounded-xl"
        : "rounded-2xl";
    const tintColor = (() => {
        if (searchColor === "default")
            return null;
        if (searchColor === "accent")
            return "var(--accent)";
        const preset = ACCENT_PRESETS.find((p) => p.id === searchColor);
        if (preset)
            return preset.color;
        if (searchColor === "custom")
            return customColor;
        return null;
    })();
    const inputCustomStyle: React.CSSProperties | undefined = tintColor
        ? {
            backgroundColor: `color-mix(in srgb, ${tintColor} ${searchStyle === "solid" ? "25%" : "20%"}, ${searchStyle === "solid" ? "var(--solid-bg)" : "var(--glass-bg)"})`,
            borderColor: `color-mix(in srgb, ${tintColor} ${searchStyle === "solid" ? "35%" : "30%"}, ${searchStyle === "solid" ? "var(--solid-border)" : "var(--glass-border)"})`,
        }
        : undefined;
    const dropdownCustomStyle: React.CSSProperties | undefined = tintColor
        ? {
            backgroundColor: `color-mix(in srgb, ${tintColor} ${searchStyle === "solid" ? "22%" : "16%"}, ${searchStyle === "solid" ? "var(--solid-bg-dropdown)" : "var(--glass-bg-dropdown)"})`,
            borderColor: `color-mix(in srgb, ${tintColor} ${searchStyle === "solid" ? "30%" : "25%"}, ${searchStyle === "solid" ? "var(--solid-border)" : "var(--glass-border)"})`,
        }
        : undefined;
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim())
            return;
        const { url: finalUrl } = parseSearchQuery(query.trim(), activeEngine, engines, customBangs, deletedBangs);
        const openInNewTab = settings.get("settings-search-new-tab") === "true";
        setShowSuggestions(false);
        setActiveIndex(-1);
        if (openInNewTab) {
            window.open(finalUrl, "_blank", "noopener,noreferrer");
            setQuery("");
        }
        else {
            window.location.href = finalUrl;
        }
    };
    const handleClear = () => {
        setQuery("");
        inputRef.current?.focus();
    };
    return (<div data-search-style={searchStyle} data-search-color={searchColor} className="w-full max-w-lg mx-auto flex flex-col gap-4 relative" style={{ zIndex: showSuggestions && suggestions.length > 0 ? 50 : undefined }}>
      <div ref={containerRef} className="w-full flex flex-col gap-4 relative animate-fade-in-up">
        <form onSubmit={handleSubmit} className="w-full transition-all duration-300 relative group">
          <div className="relative flex items-center">
            <button ref={triggerRef} type="button" onClick={handleOpenSearchSettings} title={detectedBang
            ? `Routing to ${detectedBang.name} via ${detectedBang.bangToken}`
            : `Search provider: ${activeEngine.name} (Click to open search settings)`} aria-label={detectedBang
            ? `Routing to ${detectedBang.name} via ${detectedBang.bangToken}`
            : `Search provider: ${activeEngine.name}. Click to open search settings`} className={`absolute left-2.5 sm:left-3 m-1 p-2 sm:p-1.5 ${engineBtnRadiusClass} active:scale-90 hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] cursor-pointer flex items-center justify-center z-20 hover:bg-[var(--foreground)]/8 text-[var(--foreground)]/70 hover:text-[var(--foreground)] group/engine`}>
              <span className="flex items-center justify-center">
                {isMounted && detectedBang ? (<img key={`bang-${detectedBang.domain}`} src={faviconUrl(detectedBang.domain, 32)} alt={detectedBang.name} decoding="async" className="w-5 h-5 object-contain filter dark:brightness-95 select-none transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/engine:scale-115"/>) : isMounted && activeEngine.domain && !faviconError ? (<img key={activeEngine.id} src={faviconUrl(activeEngine.domain)} alt="" decoding="async" className="w-5 h-5 object-contain filter dark:brightness-90 select-none transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/engine:scale-115" onError={() => setFaviconError(true)}/>) : (<Search className="w-4 h-4 text-[var(--foreground)]/55 group-focus-within:text-[var(--accent)] transition-colors duration-300"/>)}
              </span>
            </button>

            <input ref={inputRef} type="text" inputMode="search" enterKeyHint="search" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => {
            if (suggestions.length > 0)
                setShowSuggestions(true);
        }} onBlur={() => {
            setTimeout(() => {
                setShowSuggestions(false);
                setActiveIndex(-1);
            }, 150);
        }} placeholder={!isMounted
            ? "Search..."
            : detectedBang
                ? `Search ${detectedBang.name}...`
                : `Search ${activeEngine.name}...`} style={inputCustomStyle} className={`w-full h-[54px] sm:h-[52px] pl-12 sm:pl-13 pr-12 ${inputRadiusClass} ${searchStyle === "solid" ? "solid-input" : "glass-input"} text-base placeholder-[var(--foreground)]/50 tracking-wide focus:outline-none transition-all duration-300`} autoComplete="off" spellCheck="false"/>

            {!query && (<kbd className="hidden sm:inline-block absolute right-4 px-1.5 py-0.5 rounded border border-[var(--foreground)]/25 text-[10px] text-[var(--foreground)]/40 search-shortcut-kbd pointer-events-none group-focus-within:opacity-0 group-focus-within:scale-75 group-focus-within:translate-x-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] uppercase font-sans">
                {shortcutLabel}
              </kbd>)}

            <button type="button" onClick={handleClear} aria-label="Clear search" className={`absolute right-2.5 sm:right-4 m-1 p-2 sm:p-1 ${clearBtnRadiusClass} text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] active:scale-90 ${query ? "opacity-100 scale-100 rotate-0 pointer-events-auto" : "opacity-0 scale-50 -rotate-90 pointer-events-none"}`}>
              <X className="w-4 h-4 sm:w-3.5 sm:h-3.5"/>
            </button>
          </div>
        </form>

        {showSuggestions && suggestions.length > 0 && (<div className="absolute left-0 right-0 z-40 animate-liquid-drop max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-auto max-sm:bottom-[max(1rem,var(--safe-area-bottom))]" style={{ top: "calc(100% + 6px)" }}>
            <div style={dropdownCustomStyle} className={`${dropdownRadiusClass} ${searchStyle === "solid" ? "solid-dropdown" : "glass-dropdown"} overflow-hidden py-1 px-1 max-sm:shadow-2xl`}>
              {suggestions.map((item, i) => {
                const isActive = i === activeIndex;
                if (item.type === "bang") {
                    return (<button key={`bang-${item.bang}`} type="button" onMouseDown={(e) => {
                            e.preventDefault();
                            selectSuggestion(item);
                        }} onMouseEnter={() => setActiveIndex(i)} className={`w-full flex items-center gap-2.5 px-3 max-sm:py-3 py-2 rounded-xl text-left text-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.985] cursor-pointer ${isActive
                            ? "bg-[var(--accent)]/12 text-[var(--accent)] translate-x-1"
                            : "text-[var(--foreground)]/75 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] hover:translate-x-0.5"}`}>
                      <img src={faviconUrl(item.domain, 32)} alt="" className="w-4 h-4 object-contain shrink-0 transition-transform duration-200" onError={(e) => {
                            (e.target as HTMLElement).style.opacity = "0.3";
                        }}/>
                      <span className="font-mono text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded">
                        {item.bang}
                      </span>
                      <span className="truncate font-medium text-sm text-[var(--foreground)]/90">
                        {item.name}
                      </span>
                      {item.isCustom && (<span className="text-[9px] font-mono text-[var(--accent)] bg-[var(--accent)]/15 px-1 py-0.5 rounded font-medium shrink-0">
                          Custom
                        </span>)}
                      <span className="ml-auto text-[11px] font-mono text-[var(--foreground)]/40 truncate hidden sm:inline">
                        {item.domain}
                      </span>
                    </button>);
                }
                return (<button key={`query-${item.text}-${i}`} type="button" onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(item);
                    }} onMouseEnter={() => setActiveIndex(i)} className={`w-full flex items-center gap-3 px-3 max-sm:py-3.5 py-2.5 rounded-xl text-left text-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.985] cursor-pointer ${isActive
                        ? "bg-[var(--accent)]/12 text-[var(--accent)] translate-x-1"
                        : "text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]/90 hover:translate-x-0.5"}`}>
                    <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0 text-[var(--foreground)]/30 transition-colors duration-200"/>
                    <span className="truncate font-medium">{item.text}</span>
                  </button>);
            })}
            </div>
          </div>)}
      </div>
    </div>);
}
