"use client";
import { Sparkles, Compass, Image as ImageIcon, Upload, Link as LinkIcon, ExternalLink, RotateCw, Loader2, Check, Trash2, ChevronLeft, ChevronRight, Eye, } from "lucide-react";
import { CURATED_BACKGROUNDS } from "@/utils/backgrounds";
import type { BgType } from "@/utils/useBackgroundManager";
import type { AppearanceManager, BackgroundManager } from "./types";
interface BackgroundPaneProps {
    background: BackgroundManager;
    appearance: AppearanceManager;
}
export default function BackgroundPane({ background, appearance }: BackgroundPaneProps) {
    return (<div className="flex flex-col gap-5">

      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold text-[var(--foreground)]/80">Background Source</span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "default", name: "Default Glow", icon: <Sparkles className="w-4 h-4 text-[var(--accent)]"/> },
            { id: "bing", name: "Bing Daily", icon: <Compass className="w-4 h-4 text-[var(--accent)]"/> },
            { id: "curated", name: "Presets & Gallery", icon: <ImageIcon className="w-4 h-4 text-[var(--accent)]"/> },
            { id: "upload", name: "Custom Upload", icon: <Upload className="w-4 h-4 text-[var(--accent)]"/> },
            { id: "url", name: "Image Link", icon: <LinkIcon className="w-4 h-4 text-[var(--accent)]"/> },
        ].map((src) => {
            const isSel = background.bgType === src.id;
            return (<button key={src.id} onClick={() => {
                    if (src.id === "bing") {
                        background.selectBing();
                    }
                    else {
                        background.setBgType(src.id as BgType);
                    }
                }} className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer ${isSel
                    ? "bg-[var(--foreground)]/8 border-[var(--accent)] text-[var(--foreground)] shadow-sm"
                    : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"}`}>
                {src.icon}
                <span className="text-xs font-semibold">{src.name}</span>
              </button>);
        })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {background.bgType === "default" && (<div className="p-3.5 rounded-xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40 text-xs leading-relaxed text-[var(--foreground)]/60">
            Default Gradient features an Obsidian Black canvas synchronized with your ambient accent glow, producing a highly elegant, performance-oriented aesthetic.
          </div>)}

        {background.bgType === "bing" && (<div className="flex flex-col gap-3.5 border border-[var(--glass-border)]/40 rounded-xl p-4 bg-[var(--foreground)]/2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--foreground)]">Bing Daily Wallpaper</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                  Auto-Rotates
                </span>
              </div>
              <button type="button" onClick={() => background.loadBingWallpaper(true)} disabled={background.bingLoading} title="Refresh today's Bing wallpaper" className="h-7 px-2.5 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/80 text-[11px] font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95 border border-[var(--glass-border)]/50">
                <RotateCw className={`w-3.5 h-3.5 ${background.bingLoading ? "animate-spin text-[var(--accent)]" : ""}`}/>
                <span>{background.bingLoading ? "Checking..." : "Refresh"}</span>
              </button>
            </div>

            {background.bingLoading && !background.bingData ? (<div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin"/>
                <span className="text-xs text-[var(--foreground)]/50">Fetching daily wallpaper...</span>
              </div>) : background.bingError && !background.bingData ? (<div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex flex-col gap-2">
                <span>{background.bingError}</span>
                <button type="button" onClick={() => background.loadBingWallpaper(true)} className="text-xs font-semibold underline text-left hover:text-rose-300 cursor-pointer">
                  Try again
                </button>
              </div>) : background.bingData ? (<div className="flex flex-col gap-2.5">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[var(--glass-border)]/50 bg-black/20 group">
                  <img src={background.bingData.url} alt={background.bingData.title || "Bing Wallpaper of the Day"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"/>
                </div>
                <div className="flex flex-col gap-1">
                  {background.bingData.title && (<span className="text-xs font-semibold text-[var(--foreground)] leading-tight">
                      {background.bingData.title}
                    </span>)}
                  <span className="text-[11px] text-[var(--foreground)]/60 leading-normal">
                    {background.bingData.copyright}
                  </span>
                </div>
                {background.bingData.copyrightLink && (<div className="pt-1">
                    <a href={background.bingData.copyrightLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:underline">
                      Learn about this photo
                      <ExternalLink className="w-3 h-3"/>
                    </a>
                  </div>)}
              </div>) : null}

          </div>)}

        {background.bgType === "curated" && (<div className="flex flex-col gap-4 border border-[var(--glass-border)]/40 rounded-xl p-4 bg-[var(--foreground)]/2">
            <div className="flex gap-1.5 border-b border-[var(--divider)] pb-2">
              <button type="button" onClick={() => background.setPicsumSubTab("presets")} className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${background.picsumSubTab === "presets"
                ? "bg-[var(--accent)] text-black font-bold"
                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}>
                Curated Presets
              </button>
              <button type="button" onClick={() => background.setPicsumSubTab("gallery")} className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${background.picsumSubTab === "gallery"
                ? "bg-[var(--accent)] text-black font-bold"
                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}>
                Web Gallery
              </button>
            </div>

            {background.picsumSubTab === "presets" && (<div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Preset Library</span>
                <div className="grid grid-cols-4 gap-2">
                  {CURATED_BACKGROUNDS.map((bg) => (<button key={bg.id} onClick={() => background.selectCurated(bg.url, bg.photographer, bg.profileUrl)} className={`aspect-square rounded-xl overflow-hidden border transition-all duration-300 relative group cursor-pointer active:scale-95 ${background.bgType === "curated" && background.bgCuratedUrl === bg.url
                        ? "border-[var(--accent)] scale-95 shadow-md"
                        : "border-transparent hover:scale-105"}`} title={`Photo by ${bg.photographer}`}>
                      <img src={bg.thumbnail} alt={bg.name} className="w-full h-full object-cover select-none"/>
                      {background.bgType === "curated" && background.bgCuratedUrl === bg.url && (<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-[var(--accent)]"/>
                        </div>)}
                    </button>))}
                </div>
              </div>)}

            {background.picsumSubTab === "gallery" && (<div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Browse Web Photos</span>
                  <button type="button" onClick={background.randomPicsum} disabled={background.picsumLoading} className="h-7 px-2.5 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--accent)] border border-[var(--glass-border)]/50 text-[10px] font-semibold flex items-center gap-1 transition-all duration-300 cursor-pointer disabled:opacity-50 active:scale-95">
                    <Sparkles className="w-3 h-3"/> Surprise Me
                  </button>
                </div>

                {background.picsumLoading ? (<div className="flex items-center justify-center py-10">
                    <Loader2 className="w-7 h-7 animate-spin text-[var(--accent)]"/>
                  </div>) : background.picsumError ? (<span className="text-xs text-rose-400">{background.picsumError}</span>) : (<div className="flex flex-col gap-3">
                    <div className="grid grid-cols-4 gap-2">
                      {background.picsumPhotos.map((photo) => {
                        const photoUrl = `https://picsum.photos/id/${photo.id}/1920/1080`;
                        const thumbUrl = `https://picsum.photos/id/${photo.id}/240/240`;
                        const isSelected = background.bgType === "curated" && background.bgCuratedUrl === photoUrl;
                        return (<button key={photo.id} onClick={() => background.selectCurated(photoUrl, photo.author, photo.url)} className={`aspect-square rounded-xl overflow-hidden border transition-all duration-300 relative group cursor-pointer active:scale-95 ${isSelected ? "border-[var(--accent)] scale-95 shadow-md" : "border-transparent hover:scale-105"}`} title={`Photo by ${photo.author}`}>
                            <img src={thumbUrl} alt="" className="w-full h-full object-cover select-none"/>
                            {isSelected && (<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Check className="w-4 h-4 text-[var(--accent)]"/>
                              </div>)}
                          </button>);
                    })}
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--divider)] pt-3 mt-1">
                      <button type="button" disabled={background.picsumPage <= 1} onClick={() => background.setPicsumPage((p) => Math.max(1, p - 1))} className="h-7 px-2.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)]/10 disabled:opacity-40 cursor-pointer flex items-center gap-1 active:scale-95">
                        <ChevronLeft className="w-3.5 h-3.5"/> Prev
                      </button>
                      <span className="text-xs text-[var(--foreground)]/60 font-medium">Page {background.picsumPage}</span>
                      <button type="button" onClick={() => background.setPicsumPage((p) => p + 1)} className="h-7 px-2.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)]/10 cursor-pointer flex items-center gap-1 active:scale-95">
                        Next <ChevronRight className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>)}
              </div>)}
          </div>)}

        {background.bgType === "upload" && (<div className="flex flex-col gap-3">
            {background.uploadError && (<div className="p-3 text-xs text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20">
                {background.uploadError}
              </div>)}
            {background.hasUpload && background.uploadPreview ? (<div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[var(--glass-border)] group">
                <img src={background.uploadPreview} alt="Upload" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <button onClick={background.removeUpload} className="p-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-lg flex items-center gap-1.5 text-xs font-semibold">
                    <Trash2 className="w-3.5 h-3.5"/> Clear Upload
                  </button>
                </div>
              </div>) : (<label className="flex flex-col items-center justify-center w-full aspect-video border border-dashed border-[var(--glass-border)] hover:border-[var(--accent)]/50 rounded-2xl bg-[var(--foreground)]/3 hover:bg-[var(--foreground)]/5 transition-all duration-300 cursor-pointer text-center p-4 active:scale-98">
                <Upload className="w-6 h-6 text-[var(--accent)] mb-2"/>
                <span className="text-xs font-semibold text-[var(--foreground)]/80">Choose Wallpaper File</span>
                <span className="text-[10px] text-[var(--foreground)]/40 mt-0.5">PNG, JPG, or WEBP (saved locally)</span>
                <input type="file" accept="image/*" onChange={background.uploadFile} className="hidden"/>
              </label>)}
          </div>)}

        {background.bgType === "url" && (<div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[var(--foreground)]/80">Wallpaper Link (URL)</span>
            <input type="text" value={background.bgUrlLink} onChange={(e) => background.setUrlLink(e.target.value)} placeholder="Paste image link (e.g. https://...)..." className="w-full h-[38px] px-3.5 rounded-xl bg-[var(--foreground)]/4 border border-[var(--glass-border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] transition-all duration-300"/>
          </div>)}
      </div>

      {background.bgType !== "default" && (<div data-anchor="bg-adjustments" className="flex flex-col gap-4 border-t border-[var(--divider)] pt-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/50">Wallpaper Adjustments</span>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground)]/85">
              <span>Opacity</span>
              <span>{background.bgOpacity}%</span>
            </div>
            <input type="range" min="10" max="100" value={background.bgOpacity} onChange={(e) => background.setOpacity(parseInt(e.target.value))} className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"/>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground)]/85">
              <span>Darken Overlay (Dim)</span>
              <span>{background.bgDim}%</span>
            </div>
            <input type="range" min="0" max="90" value={background.bgDim} onChange={(e) => background.setDim(parseInt(e.target.value))} className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"/>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground)]/85">
              <span>Blur Intensity</span>
              <span>{background.bgBlur}px</span>
            </div>
            <input type="range" min="0" max="20" value={background.bgBlur} onChange={(e) => background.setBlur(parseInt(e.target.value))} className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"/>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-[var(--divider)] pt-3 mt-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]"/> Auto Accent
              </span>
              <span className="text-[10px] text-[var(--foreground)]/45">
                Dynamically match accent palette to wallpaper
              </span>
            </div>
            <button type="button" onClick={() => appearance.setAccent(appearance.accentColor === "auto" ? "sage" : "auto")} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${appearance.accentColor === "auto" ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
              <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${appearance.accentColor === "auto" ? "translate-x-5" : "translate-x-0"}`}/>
            </button>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-[var(--divider)] pt-3 mt-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[var(--accent)]"/> Smart Readability
              </span>
              <span className="text-[10px] text-[var(--foreground)]/45">
                Adaptive contrast &amp; scrim for bright backgrounds
              </span>
            </div>
            <button type="button" onClick={() => background.setSmartReadability(!background.smartReadability)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${background.smartReadability ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
              <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${background.smartReadability ? "translate-x-5" : "translate-x-0"}`}/>
            </button>
          </div>
        </div>)}
    </div>);
}
