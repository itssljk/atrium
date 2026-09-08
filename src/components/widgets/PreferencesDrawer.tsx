"use client";
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft } from "lucide-react";
import SettingsSearch from "@/components/widgets/SettingsSearch";
import MainOverview from "@/components/settings/MainOverview";
import BackgroundPane from "@/components/settings/BackgroundPane";
import SearchPane from "@/components/settings/SearchPane";
import QuicklinksPane from "@/components/settings/QuicklinksPane";
import LayoutPane from "@/components/settings/LayoutPane";
import GeneralPane from "@/components/settings/GeneralPane";
import SupportPane from "@/components/settings/SupportPane";
import type { SettingsPane } from "@/utils/useSettingsDrawer";
import type { SettingEntry } from "@/utils/settingsSearch";
import { useAppearanceManager } from "@/utils/useAppearanceManager";
import { useBackgroundManager } from "@/utils/useBackgroundManager";
import { useSearchManager } from "@/utils/useSearchManager";
import { useQuicklinksManager } from "@/utils/useQuicklinksManager";
import { useGeneralManager } from "@/utils/useGeneralManager";
import { PANE_TITLES } from "@/components/settings/types";
interface PreferencesDrawerProps {
    isOpen: boolean;
    activePane: SettingsPane;
    setActivePane: (pane: SettingsPane) => void;
    close: () => void;
}
export default function PreferencesDrawer({ isOpen, activePane, setActivePane, close, }: PreferencesDrawerProps) {
    const mainPaneRef = useRef<HTMLDivElement>(null);
    const subPaneRef = useRef<HTMLDivElement>(null);
    const [displayedSubpane, setDisplayedSubpane] = useState<SettingsPane>("background");
    useEffect(() => {
        if (activePane !== "main") {
            setDisplayedSubpane(activePane);
        }
    }, [activePane]);
    const [settingsQuery, setSettingsQuery] = useState("");
    const isSearching = settingsQuery.trim().length > 0;
    const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const appearance = useAppearanceManager();
    const background = useBackgroundManager();
    const search = useSearchManager();
    const quicklinksManager = useQuicklinksManager();
    const general = useGeneralManager();
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    useEffect(() => {
        if (!isOpen)
            return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (settingsQuery.trim()) {
                    setSettingsQuery("");
                    return;
                }
                if (activePane !== "main") {
                    setActivePane("main");
                    return;
                }
                close();
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, activePane, settingsQuery, close, setActivePane]);
    useEffect(() => {
        if (activePane === "main" && mainPaneRef.current) {
            mainPaneRef.current.scrollTop = 0;
        }
        else if (subPaneRef.current) {
            subPaneRef.current.scrollTop = 0;
        }
    }, [activePane]);
    useEffect(() => {
        if (isSearching) {
            mainPaneRef.current?.scrollTo({ top: 0 });
        }
    }, [isSearching]);
    const reducedMotion = appearance.performanceMode;
    const flashElement = (el: Element) => {
        el.classList.remove("setting-flash");
        void el.getBoundingClientRect();
        el.classList.add("setting-flash");
        if (flashTimerRef.current)
            clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => el.classList.remove("setting-flash"), 1500);
    };
    const scrollToElement = (el: Element) => {
        el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    };
    const selectSetting = (entry: SettingEntry) => {
        setSettingsQuery("");
        if (entry.pane !== "main") {
            setActivePane(entry.pane);
            const { anchor, fallbackAnchor } = entry;
            if (anchor) {
                setTimeout(() => {
                    const scope = subPaneRef.current;
                    const el = scope?.querySelector(`[data-anchor="${anchor}"]`) ??
                        (fallbackAnchor ? scope?.querySelector(`[data-anchor="${fallbackAnchor}"]`) : undefined);
                    if (el) {
                        flashElement(el);
                        scrollToElement(el);
                    }
                }, 600);
            }
        }
        else if (entry.anchor) {
            setTimeout(() => {
                const el = mainPaneRef.current?.querySelector(`[data-block="${entry.anchor}"]`);
                if (el) {
                    flashElement(el);
                    scrollToElement(el);
                }
            }, 0);
        }
        else if (mainPaneRef.current) {
            mainPaneRef.current.scrollTop = 0;
        }
    };
    const isSubpaneActive = activePane !== "main";
    const activeSubpaneType = activePane !== "main" ? activePane : displayedSubpane;
    const currentMeta = PANE_TITLES[activeSubpaneType] || PANE_TITLES.main;
    return (<div className="w-full h-full flex flex-col justify-between relative overflow-hidden">

      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-[var(--divider)] flex items-center justify-between shrink-0 select-none z-20 backdrop-blur-md bg-[var(--glass-bg)]/40 pt-[max(1rem,var(--safe-area-top))] sm:pt-5">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => setActivePane("main")} className={`flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:opacity-80 active:scale-90 hover:-translate-x-0.5 transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${isSubpaneActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none absolute"}`}>
            <ChevronLeft className="w-4 h-4"/> Preferences
          </button>

          <div className={`flex flex-col transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSubpaneActive ? "translate-x-2" : "translate-x-0"}`}>
            <h2 className="text-base font-semibold tracking-tight text-[var(--foreground)] leading-tight">
              {isSubpaneActive ? currentMeta.title : "Preferences"}
            </h2>
            <p className="text-[10px] tracking-wider text-[var(--foreground)]/45 uppercase font-medium mt-0.5">
              {isSubpaneActive ? currentMeta.subtitle : "Customize Atrium Tabs"}
            </p>
          </div>
        </div>

        <button onClick={close} className="p-2 rounded-full hover:bg-[var(--foreground)]/8 text-[var(--foreground)]/60 hover:text-[var(--foreground)] active:scale-90 hover:scale-110 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shrink-0" title="Close">
          <X className="w-4 h-4"/>
        </button>
      </div>

      <div className="flex-1 w-full overflow-hidden relative">
        <div className="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform" style={{ transform: isSubpaneActive ? "translateX(-50%)" : "translateX(0)" }}>

          <div ref={mainPaneRef} className="w-1/2 h-full overflow-y-auto px-4 sm:px-6 py-5 pb-[max(1.25rem,var(--safe-area-bottom))] custom-scrollbar flex flex-col justify-between">
            <div className="flex flex-col gap-5">

              <SettingsSearch query={settingsQuery} onQueryChange={setSettingsQuery} onSelect={selectSetting} appearance={appearance} background={background} search={search} quicklinks={quicklinksManager} general={general}/>
              {!isSearching && (<MainOverview appearance={appearance} background={background} search={search} quicklinksManager={quicklinksManager} general={general} onNavigate={setActivePane} showCustomPicker={showCustomPicker} setShowCustomPicker={setShowCustomPicker}/>)}
            </div>
          </div>

          <div ref={subPaneRef} className="w-1/2 h-full overflow-y-auto px-4 sm:px-6 py-5 pb-[max(1.25rem,var(--safe-area-bottom))] custom-scrollbar">

            {activeSubpaneType === "background" && (<BackgroundPane background={background} appearance={appearance}/>)}

            {activeSubpaneType === "search" && <SearchPane search={search}/>}

            {activeSubpaneType === "quicklinks" && <QuicklinksPane quicklinksManager={quicklinksManager}/>}

            {(activeSubpaneType === "layout" || activeSubpaneType === "appearance") && (<LayoutPane search={search} appearance={appearance}/>)}

            {activeSubpaneType === "general" && <GeneralPane general={general}/>}

            {activeSubpaneType === "support" && <SupportPane />}
          </div>
        </div>

      </div>
    </div>);
}
