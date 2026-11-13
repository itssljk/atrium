"use client";
import { Palette, Eye, Cpu, Sparkles, Pipette, Image as ImageIcon, Globe, LayoutGrid, LayoutTemplate, CloudSun, MessageSquare, ChevronRight, } from "lucide-react";
import Link from "@/components/core/Link";
import { ACCENT_PRESETS, hexToHsl } from "@/utils/accent";
import { siteConfig } from "@/config/site";
import CustomPickerPanel from "@/components/shared/CustomPickerPanel";
import type { SettingsPane } from "@/utils/useSettingsDrawer";
import type { AppearanceManager, BackgroundManager, SearchManager, QuicklinksManager, GeneralManager } from "./types";
interface MainOverviewProps {
    appearance: AppearanceManager;
    background: BackgroundManager;
    search: SearchManager;
    quicklinksManager: QuicklinksManager;
    general: GeneralManager;
    onNavigate: (pane: SettingsPane) => void;
    showCustomPicker: boolean;
    setShowCustomPicker: (next: boolean) => void;
}
export default function MainOverview({ appearance, background, search, quicklinksManager, general, onNavigate, showCustomPicker, setShowCustomPicker, }: MainOverviewProps) {
    return (<div className="flex flex-col gap-5">

      <div data-block="accent" className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--accent)]"/> Accent Palette
          </span>
          <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-wider">
            {appearance.accentColor === "auto" ? "Auto" : appearance.accentColor}
          </span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap pt-1">

          <button onClick={() => appearance.setAccent("auto")} title="Auto (adapts to background)" className={`w-7.5 h-7.5 rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] relative flex items-center justify-center border hover:scale-120 active:scale-85
              ${appearance.accentColor === "auto"
            ? "border-[var(--foreground)] scale-110 shadow-md ring-2 ring-[var(--accent)]/30"
            : "border-[var(--foreground)]/10"}`} style={{
            backgroundColor: appearance.autoColor,
        }}>
            {appearance.accentColor === "auto" ? (<div className="w-2 h-2 rounded-full bg-[var(--background)] animate-liquid-pop"/>) : (<Sparkles className="w-3.5 h-3.5 text-[var(--background)] opacity-90"/>)}
          </button>

          {ACCENT_PRESETS.map((preset) => (<button key={preset.id} onClick={() => appearance.setAccent(preset.id)} title={preset.name} className={`w-7.5 h-7.5 rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] relative flex items-center justify-center border hover:scale-120 active:scale-85
                ${appearance.accentColor === preset.id
                ? "border-[var(--foreground)] scale-110 shadow-md ring-2 ring-[var(--accent)]/30"
                : "border-[var(--foreground)]/10"}`} style={{ backgroundColor: preset.color }}>
              {appearance.accentColor === preset.id && (<div className="w-2 h-2 rounded-full bg-[var(--background)] animate-liquid-pop"/>)}
            </button>))}

          <button onClick={() => {
            if (appearance.accentColor === "custom") {
                setShowCustomPicker(!showCustomPicker);
            }
            else {
                appearance.setAccent("custom");
                setShowCustomPicker(true);
            }
        }} title={appearance.accentColor === "custom"
            ? "Custom Color (click to toggle picker)"
            : "Custom Color"} className={`w-7.5 h-7.5 rounded-full cursor-pointer relative flex items-center justify-center border transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] hover:scale-120 active:scale-85
              ${appearance.accentColor === "custom"
            ? "border-[var(--foreground)] scale-110 shadow-md ring-2 ring-[var(--accent)]/30"
            : "border-[var(--foreground)]/10"}`} style={{
            backgroundColor: appearance.customColor,
        }}>
            {appearance.accentColor === "custom" ? (<div className={`w-2 h-2 rounded-full animate-liquid-pop ${hexToHsl(appearance.customColor).l < 45
                ? "bg-white"
                : "bg-[var(--background)]"}`}/>) : (<Pipette className={`w-3.5 h-3.5 opacity-90 ${hexToHsl(appearance.customColor).l < 45
                ? "text-white"
                : "text-[var(--background)]"}`}/>)}
          </button>
        </div>

        {appearance.accentColor === "custom" && showCustomPicker && (<div className="mt-2 pt-2 border-t border-[var(--divider)]">
            <CustomPickerPanel initialHsl={appearance.customHsl} initialColor={appearance.customColor} onColorChange={appearance.saveCustomColor}/>
          </div>)}
      </div>

      <div className="flex flex-col gap-1 rounded-2xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40 p-1.5 overflow-hidden">

        <div onClick={() => onNavigate("background")} className="group/navrow flex items-center justify-between p-3 rounded-xl hover:bg-[var(--foreground)]/6 active:scale-[0.98] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 flex items-center justify-center text-[var(--accent)] shrink-0 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:scale-110">
              <ImageIcon className="w-4 h-4"/>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[var(--foreground)] group-hover/navrow:text-[var(--accent)] transition-colors duration-200">Wallpaper & Background</span>
              <span className="text-[10px] text-[var(--foreground)]/45 truncate">
                {background.bgType === "default" && "Atrium Cosmic Gradient"}
                {background.bgType === "bing" && "Bing Daily Wallpaper"}
                {background.bgType === "curated" && "Curated & Web Gallery"}
                {background.bgType === "upload" && "Custom Uploaded Wallpaper"}
                {background.bgType === "url" && "Pasted Image Address"}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--foreground)]/35 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:translate-x-1 group-hover/navrow:text-[var(--accent)]"/>
        </div>

        <div className="h-[1px] bg-[var(--divider)] mx-3"/>

        <div onClick={() => onNavigate("search")} className="group/navrow flex items-center justify-between p-3 rounded-xl hover:bg-[var(--foreground)]/6 active:scale-[0.98] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 flex items-center justify-center text-[var(--accent)] shrink-0 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:scale-110">
              <Globe className="w-4 h-4"/>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[var(--foreground)] group-hover/navrow:text-[var(--accent)] transition-colors duration-200">Search Engine & Bangs</span>
              <span className="text-[10px] text-[var(--foreground)]/45 truncate">
                Active: {search.searchEngineId} &middot; {search.customEngines.length} custom
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--foreground)]/35 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:translate-x-1 group-hover/navrow:text-[var(--accent)]"/>
        </div>

        <div className="h-[1px] bg-[var(--divider)] mx-3"/>

        <div onClick={() => onNavigate("quicklinks")} className="group/navrow flex items-center justify-between p-3 rounded-xl hover:bg-[var(--foreground)]/6 active:scale-[0.98] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 flex items-center justify-center text-[var(--accent)] shrink-0 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:scale-110">
              <LayoutGrid className="w-4 h-4"/>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[var(--foreground)] group-hover/navrow:text-[var(--accent)] transition-colors duration-200">Shortcuts Bar</span>
              <span className="text-[10px] text-[var(--foreground)]/45 truncate">
                {quicklinksManager.showQuicklinks
            ? `${quicklinksManager.quicklinks.length} active · ${quicklinksManager.quicklinksStyle === "dock"
                ? "Glass Shelf"
                : quicklinksManager.quicklinksStyle === "grid"
                    ? "Quiet Grid"
                    : "Fluid Pills"}`
            : "Disabled"}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--foreground)]/35 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:translate-x-1 group-hover/navrow:text-[var(--accent)]"/>
        </div>

        <div className="h-[1px] bg-[var(--divider)] mx-3"/>

        <div onClick={() => onNavigate("layout")} className="group/navrow flex items-center justify-between p-3 rounded-xl hover:bg-[var(--foreground)]/6 active:scale-[0.98] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 flex items-center justify-center text-[var(--accent)] shrink-0 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:scale-110">
              <LayoutTemplate className="w-4 h-4"/>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[var(--foreground)] group-hover/navrow:text-[var(--accent)] transition-colors duration-200">Interface & Layout</span>
              <span className="text-[10px] text-[var(--foreground)]/45 truncate">
                Search bar ({search.searchBarStyle === "solid" ? "Solid" : "Glassy"}{search.searchBarColor !== "default" ? ` · ${search.searchBarColor}` : ""}, {search.searchBarShape}) & layout
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--foreground)]/35 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:translate-x-1 group-hover/navrow:text-[var(--accent)]"/>
        </div>

        <div className="h-[1px] bg-[var(--divider)] mx-3"/>

        <div onClick={() => onNavigate("general")} className="group/navrow flex items-center justify-between p-3 rounded-xl hover:bg-[var(--foreground)]/6 active:scale-[0.98] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 flex items-center justify-center text-[var(--accent)] shrink-0 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:scale-110">
              <CloudSun className="w-4 h-4"/>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[var(--foreground)] group-hover/navrow:text-[var(--accent)] transition-colors duration-200">General & Personalization</span>
              <span className="text-[10px] text-[var(--foreground)]/45 truncate">
                {general.showGreeting
            ? general.greetingMode === "greeting"
                ? "Greeting headline, weather & mail"
                : general.greetingMode === "quote"
                    ? "Daily quote, weather & mail"
                    : "Greeting card, weather & mail"
            : "Weather & mail (greeting off)"}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--foreground)]/35 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:translate-x-1 group-hover/navrow:text-[var(--accent)]"/>
        </div>

        <div className="h-[1px] bg-[var(--divider)] mx-3"/>

        <div onClick={() => onNavigate("support")} className="group/navrow flex items-center justify-between p-3 rounded-xl hover:bg-[var(--foreground)]/6 active:scale-[0.98] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 flex items-center justify-center text-[var(--accent)] shrink-0 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:scale-110">
              <MessageSquare className="w-4 h-4"/>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[var(--foreground)] group-hover/navrow:text-[var(--accent)] transition-colors duration-200">Support & About</span>
              <span className="text-[10px] text-[var(--foreground)]/45 truncate">
                v{siteConfig.version} &middot; Discord, feedback, terms
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--foreground)]/35 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/navrow:translate-x-1 group-hover/navrow:text-[var(--accent)]"/>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-2xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40 p-3.5">

        <div data-block="glow" className="flex items-center justify-between py-1.5 border-b border-[var(--divider)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[var(--accent)]"/> Ambient Glow
            </span>
            <span className="text-[10px] text-[var(--foreground)]/45">
              Soft breathing halo behind search coordinates
            </span>
          </div>
          <button role="switch" aria-checked={appearance.glowEnabled} aria-label="Ambient Glow" onClick={() => appearance.setGlow(!appearance.glowEnabled)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${appearance.glowEnabled ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${appearance.glowEnabled ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        <div data-block="lowmotion" className="flex items-center justify-between py-1.5 pt-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[var(--accent)]"/> Low Motion Mode
            </span>
            <span className="text-[10px] text-[var(--foreground)]/45">
              Kills intensive animations, blur transitions & loops
            </span>
          </div>
          <button role="switch" aria-checked={appearance.performanceMode} aria-label="Low Motion Mode" onClick={() => appearance.setPerf(!appearance.performanceMode)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${appearance.performanceMode ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${appearance.performanceMode ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5 pt-6 border-t border-[var(--divider)] mt-6 select-none">
        <span className="text-[10px] tracking-widest text-[var(--foreground)]/45 uppercase font-medium">
          &copy; {new Date().getFullYear()} {siteConfig.name} v{siteConfig.version}
        </span>
        <div className="flex items-center gap-3 text-[10px] tracking-wider text-[var(--foreground)]/40 font-normal">
          <Link href="/tos" className="hover:text-[var(--accent)] transition-colors cursor-pointer">Terms</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors cursor-pointer">Privacy</Link>
          <span>&middot;</span>
          <Link href="/trademarks" className="hover:text-[var(--accent)] transition-colors cursor-pointer">Trademarks</Link>
        </div>
      </div>
    </div>);
}
