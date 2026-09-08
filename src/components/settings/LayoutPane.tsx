"use client";
import { useState } from "react";
import { Sparkles, Pipette } from "lucide-react";
import { ACCENT_PRESETS, hexToHsl } from "@/utils/accent";
import CustomPickerPanel from "@/components/shared/CustomPickerPanel";
import type { SearchBarShape, SearchBarStyle, SearchBarColor } from "@/utils/useSearchManager";
import type { AppearanceManager, SearchManager } from "./types";
interface LayoutPaneProps {
    search: SearchManager;
    appearance: AppearanceManager;
}
export default function LayoutPane({ search, appearance }: LayoutPaneProps) {
    const [showSearchCustomPicker, setShowSearchCustomPicker] = useState(false);
    return (<div className="flex flex-col gap-5">

      <div data-anchor="search-style" className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-[var(--foreground)]/80">Search Bar Style</span>
          <span className="text-[10px] text-[var(--foreground)]/45">
            Choose between frosted glass or an opaque solid surface
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
                id: "glass",
                label: "Glassy",
                sub: "Translucent",
                preview: (isSel: boolean) => (<div className={`w-10 h-4 rounded-full border flex items-center justify-center transition-all ${isSel
                        ? "border-[var(--accent)] bg-[var(--accent)]/15 shadow-[0_0_12px_var(--accent-glow)]"
                        : "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm"}`}>
                  <div className={`w-3.5 h-0.5 rounded-full ${isSel ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/35"}`}/>
                </div>),
            },
            {
                id: "solid",
                label: "Solid",
                sub: "Opaque",
                preview: (isSel: boolean) => (<div className={`w-10 h-4 rounded-full border flex items-center justify-center transition-all ${isSel
                        ? "border-[var(--accent)] bg-[var(--accent)]/25 shadow-sm"
                        : "border-[var(--foreground)]/20 bg-[var(--foreground)]/12 shadow-sm"}`}>
                  <div className={`w-3.5 h-0.5 rounded-full ${isSel ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/40"}`}/>
                </div>),
            },
        ].map((item) => {
            const isSel = search.searchBarStyle === item.id;
            return (<button key={item.id} type="button" onClick={() => search.setSearchBarStyle(item.id as SearchBarStyle)} className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer ${isSel
                    ? "bg-[var(--accent)]/12 border-[var(--accent)] text-[var(--foreground)] shadow-sm"
                    : "bg-[var(--foreground)]/3 border-[var(--glass-border)]/40 text-[var(--foreground)]/65 hover:bg-[var(--foreground)]/6 hover:text-[var(--foreground)]"}`}>
                {item.preview(isSel)}
                <div className="flex flex-col items-center">
                  <span className={`text-xs font-semibold ${isSel ? "text-[var(--accent)]" : ""}`}>
                    {item.label}
                  </span>
                  <span className="text-[9px] text-[var(--foreground)]/40 leading-none mt-0.5">
                    {item.sub}
                  </span>
                </div>
              </button>);
        })}
        </div>
      </div>

      <div className="h-[1px] bg-[var(--divider)]"/>

      <div data-anchor="search-shape" className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-[var(--foreground)]/80">Search Bar Shape</span>
          <span className="text-[10px] text-[var(--foreground)]/45">
            Choose between classic pill or modern squared corners
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
                id: "pill",
                label: "Pill",
                sub: "Capsule",
                previewClass: "rounded-full",
            },
            {
                id: "rounded",
                label: "Rounded",
                sub: "Brave / Bing",
                previewClass: "rounded-[6px]",
            },
            {
                id: "sharp",
                label: "Sharp",
                sub: "Crisp",
                previewClass: "rounded-[2px]",
            },
        ].map((item) => {
            const isSel = search.searchBarShape === item.id;
            return (<button key={item.id} type="button" onClick={() => search.setSearchBarShape(item.id as SearchBarShape)} className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer ${isSel
                    ? "bg-[var(--accent)]/12 border-[var(--accent)] text-[var(--foreground)] shadow-sm"
                    : "bg-[var(--foreground)]/3 border-[var(--glass-border)]/40 text-[var(--foreground)]/65 hover:bg-[var(--foreground)]/6 hover:text-[var(--foreground)]"}`}>
                <div className={`w-10 h-4 border flex items-center justify-center transition-all ${item.previewClass} ${isSel
                    ? "border-[var(--accent)] bg-[var(--accent)]/20"
                    : "border-[var(--foreground)]/30 bg-[var(--foreground)]/4"}`}>
                  <div className={`w-3.5 h-0.5 rounded-full ${isSel ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/25"}`}/>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-xs font-semibold ${isSel ? "text-[var(--accent)]" : ""}`}>
                    {item.label}
                  </span>
                  <span className="text-[9px] text-[var(--foreground)]/40 leading-none mt-0.5">
                    {item.sub}
                  </span>
                </div>
              </button>);
        })}
        </div>
      </div>

      <div className="h-[1px] bg-[var(--divider)]"/>

      <div data-anchor="search-color" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--foreground)]/80">Search Bar Color</span>
            <span className="text-[10px] text-[var(--foreground)]/45">
              Tint the search surface with your chosen hue
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-wider">
            {search.searchBarColor === "default"
            ? "Default"
            : search.searchBarColor === "accent"
                ? "Accent"
                : search.searchBarColor === "custom"
                    ? "Custom"
                    : search.searchBarColor}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap pt-0.5">

          <button type="button" onClick={() => search.setSearchBarColor("default")} title="Default (Theme Neutral)" className={`w-7.5 h-7.5 rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] relative flex items-center justify-center border hover:scale-120 active:scale-85 ${search.searchBarColor === "default"
            ? "border-[var(--foreground)] scale-110 shadow-md ring-2 ring-[var(--accent)]/30 bg-[var(--foreground)]/15"
            : "border-[var(--glass-border)] bg-[var(--foreground)]/6 hover:bg-[var(--foreground)]/10"}`}>
            {search.searchBarColor === "default" ? (<div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-liquid-pop"/>) : (<div className="w-2 h-2 rounded-full bg-[var(--foreground)]/30"/>)}
          </button>

          <button type="button" onClick={() => search.setSearchBarColor("accent")} title="Theme Accent (matches current accent)" className={`w-7.5 h-7.5 rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] relative flex items-center justify-center border hover:scale-120 active:scale-85 ${search.searchBarColor === "accent"
            ? "border-[var(--foreground)] scale-110 shadow-md ring-2 ring-[var(--accent)]/30"
            : "border-[var(--foreground)]/10"}`} style={{
            backgroundColor: appearance.accentColor === "auto" ? appearance.autoColor : "var(--accent)",
        }}>
            {search.searchBarColor === "accent" ? (<div className="w-2 h-2 rounded-full bg-[var(--background)] animate-liquid-pop"/>) : (<Sparkles className="w-3.5 h-3.5 text-[var(--background)] opacity-90"/>)}
          </button>

          {ACCENT_PRESETS.map((preset) => {
            const isSel = search.searchBarColor === preset.id;
            return (<button key={preset.id} type="button" onClick={() => search.setSearchBarColor(preset.id as SearchBarColor)} title={preset.name} className={`w-7.5 h-7.5 rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] relative flex items-center justify-center border hover:scale-120 active:scale-85 ${isSel
                    ? "border-[var(--foreground)] scale-110 shadow-md ring-2 ring-[var(--accent)]/30"
                    : "border-[var(--foreground)]/10"}`} style={{
                    backgroundColor: preset.color,
                }}>
                {isSel && <div className="w-2 h-2 rounded-full bg-[var(--background)] animate-liquid-pop"/>}
              </button>);
        })}

          <button type="button" onClick={() => {
            if (search.searchBarColor === "custom") {
                setShowSearchCustomPicker((prev) => !prev);
            }
            else {
                search.setSearchBarColor("custom");
                setShowSearchCustomPicker(true);
            }
        }} title={search.searchBarColor === "custom"
            ? "Custom Color (click to toggle picker)"
            : "Custom Color"} className={`w-7.5 h-7.5 rounded-full cursor-pointer relative flex items-center justify-center border transition-all duration-200 hover:scale-110 active:scale-90 ${search.searchBarColor === "custom"
            ? "border-[var(--foreground)] scale-110 shadow-md ring-2 ring-[var(--accent)]/30"
            : "border-[var(--foreground)]/10"}`} style={{
            backgroundColor: search.searchBarCustomColor,
        }}>
            {search.searchBarColor === "custom" ? (<div className={`w-2 h-2 rounded-full ${hexToHsl(search.searchBarCustomColor).l < 45
                ? "bg-white"
                : "bg-[var(--background)]"}`}/>) : (<Pipette className={`w-3.5 h-3.5 opacity-90 ${hexToHsl(search.searchBarCustomColor).l < 45
                ? "text-white"
                : "text-[var(--background)]"}`}/>)}
          </button>
        </div>

        {search.searchBarColor === "custom" && showSearchCustomPicker && (<div className="mt-2 pt-2 border-t border-[var(--divider)]">
            <CustomPickerPanel initialHsl={hexToHsl(search.searchBarCustomColor)} initialColor={search.searchBarCustomColor} onColorChange={(hex) => search.setSearchBarCustomColor(hex)}/>
          </div>)}
      </div>
    </div>);
}
