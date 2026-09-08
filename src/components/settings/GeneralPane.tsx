"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, CloudSun, User, MapPin, Thermometer, X, Search, Loader2, Mail, RefreshCw, } from "lucide-react";
import { searchCities, type GeoCityResult } from "@/utils/weather";
import type { GeneralManager } from "./types";
interface GeneralPaneProps {
    general: GeneralManager;
}
export default function GeneralPane({ general }: GeneralPaneProps) {
    const [citySearchQuery, setCitySearchQuery] = useState("");
    const [cityResults, setCityResults] = useState<GeoCityResult[]>([]);
    const [cityLoading, setCityLoading] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const handleCitySearchChange = (val: string) => {
        setCitySearchQuery(val);
        if (!val.trim() || val.length < 2) {
            setCityResults([]);
            setShowCityDropdown(false);
        }
    };
    useEffect(() => {
        if (!citySearchQuery.trim() || citySearchQuery.length < 2)
            return;
        if (searchTimeoutRef.current)
            clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(async () => {
            setCityLoading(true);
            const results = await searchCities(citySearchQuery);
            setCityResults(results);
            setShowCityDropdown(results.length > 0);
            setCityLoading(false);
        }, 350);
        return () => {
            if (searchTimeoutRef.current)
                clearTimeout(searchTimeoutRef.current);
        };
    }, [citySearchQuery]);
    const handleSelectCity = (city: GeoCityResult) => {
        general.updateManualLocation({
            name: city.name,
            lat: city.lat,
            lon: city.lon,
        });
        setCitySearchQuery("");
        setShowCityDropdown(false);
    };
    return (<div className="flex flex-col gap-5">

      <div data-anchor="gen-greeting" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]"/> Greeting Card
            </span>
            <span className="text-[10px] text-[var(--foreground)]/45">Show greeting headline, daily quote, or both</span>
          </div>
          <button type="button" onClick={() => general.setShowGreeting(!general.showGreeting)} aria-label="Toggle greeting card" className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${general.showGreeting ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${general.showGreeting ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        {general.showGreeting && (<div className="flex flex-col gap-3 mt-1 bg-[var(--foreground)]/2 p-3.5 rounded-2xl border border-[var(--glass-border)]/30 animate-liquid-drop">
            <div data-anchor="gen-greeting-mode" className="flex max-sm:flex-col max-sm:items-start max-sm:gap-1.5 items-center justify-between">
              <span className="text-[11px] font-medium text-[var(--foreground)]/80">Card Content</span>
              <div className="flex gap-1 bg-[var(--foreground)]/5 p-0.5 rounded-xl border border-[var(--glass-border)]/30">
                {([
                { id: "both", label: "Both" },
                { id: "greeting", label: "Greeting" },
                { id: "quote", label: "Quote" },
            ] as const).map((opt) => {
                const isSel = general.greetingMode === opt.id;
                return (<button key={opt.id} type="button" onClick={() => general.setGreetingMode(opt.id)} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer active:scale-95 ${isSel
                        ? "bg-[var(--accent)] text-[var(--background)] font-bold shadow-sm"
                        : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/80"}`}>
                      {opt.label}
                    </button>);
            })}
              </div>
            </div>

            {general.greetingMode !== "quote" && (<div data-anchor="gen-gradient-start" className="flex max-sm:flex-col max-sm:items-start max-sm:gap-1.5 items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--foreground)]/80">Gradient Direction</span>
                <div className="flex gap-1 bg-[var(--foreground)]/5 p-0.5 rounded-xl border border-[var(--glass-border)]/30">
                  {([
                    { id: "left", label: "Left" },
                    { id: "right", label: "Right" },
                    { id: "top", label: "Top" },
                    { id: "bottom", label: "Bottom" },
                ] as const).map((opt) => {
                    const isSel = general.greetingGradientStart === opt.id;
                    return (<button key={opt.id} type="button" onClick={() => general.setGreetingGradientStart(opt.id)} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer active:scale-95 ${isSel
                            ? "bg-[var(--accent)] text-[var(--background)] font-bold shadow-sm"
                            : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/80"}`}>
                        {opt.label}
                      </button>);
                })}
                </div>
              </div>)}

            {general.greetingMode !== "quote" && (<div data-anchor="gen-gradient-stop" className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground)]/85">
                  <span>Accent Spread</span>
                  <span>{100 - general.greetingGradientStop}%</span>
                </div>
                <input type="range" min="0" max="85" value={85 - general.greetingGradientStop} onChange={(e) => general.setGreetingGradientStop(85 - parseInt(e.target.value))} className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"/>
                <span className="text-[10px] text-[var(--foreground)]/40">How far the accent color reaches into the headline.</span>
              </div>)}

            {general.greetingMode !== "quote" && (<div data-anchor="gen-name" className="flex flex-col gap-1.5 pt-2.5 border-t border-[var(--divider)]">
                <label className="text-xs font-semibold text-[var(--foreground)]/80 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[var(--accent)]"/> Your Display Name
                </label>
                <input type="text" value={general.username} onChange={(e) => general.setUsername(e.target.value)} placeholder="e.g. Alex..." maxLength={20} className="w-full h-[38px] px-3.5 rounded-xl bg-[var(--foreground)]/4 border border-[var(--glass-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-all duration-200 focus:bg-[var(--foreground)]/6"/>
                <span className="text-[10px] text-[var(--foreground)]/40">Appends your name to the greeting headline.</span>
              </div>)}
          </div>)}
      </div>

      <div data-anchor="gen-weather" className="flex flex-col gap-3 border-t border-[var(--divider)] pt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-[var(--accent)]"/> Weather Widget
            </span>
            <span className="text-[10px] text-[var(--foreground)]/45">Show weather in the top corner</span>
          </div>
          <button onClick={() => general.setShowWeather(!general.showWeather)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${general.showWeather ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${general.showWeather ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        {general.showWeather && (<div className="flex flex-col gap-3 mt-1 bg-[var(--foreground)]/2 p-3.5 rounded-2xl border border-[var(--glass-border)]/30">
            <div data-anchor="weather-location" className="flex max-sm:flex-col max-sm:items-start max-sm:gap-1.5 items-center justify-between">
              <span className="text-[11px] font-medium text-[var(--foreground)]/80">Location Mode</span>
              <div className="flex gap-1 bg-[var(--foreground)]/5 p-0.5 rounded-xl border border-[var(--glass-border)]/30">
                <button onClick={() => general.setWeatherMode("auto")} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95 ${general.weatherMode === "auto" ? "bg-[var(--accent)] text-[var(--background)] font-bold" : "text-[var(--foreground)]/60"}`}>
                  GPS Auto
                </button>
                <button onClick={() => general.setWeatherMode("manual")} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95 ${general.weatherMode === "manual" ? "bg-[var(--accent)] text-[var(--background)] font-bold" : "text-[var(--foreground)]/60"}`}>
                  City
                </button>
              </div>
            </div>

            {general.weatherMode === "manual" && (<div className="flex flex-col gap-1.5 relative">
                {general.manualLocation ? (<div className="flex items-center justify-between p-2 rounded-xl bg-[var(--foreground)]/4 border border-[var(--glass-border)] text-xs">
                    <span className="truncate font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent)]"/> {general.manualLocation.name}
                    </span>
                    <button onClick={() => general.updateManualLocation(null)} className="p-1 text-[var(--foreground)]/40 hover:text-rose-400 cursor-pointer active:scale-90">
                      <X className="w-3.5 h-3.5"/>
                    </button>
                  </div>) : (<div className="relative">
                    <input type="text" placeholder="Search city (London, Tokyo)..." value={citySearchQuery} onChange={(e) => handleCitySearchChange(e.target.value)} className="w-full h-8.5 pl-8 pr-8 rounded-xl bg-[var(--foreground)]/4 border border-[var(--glass-border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)]"/>
                    <Search className="w-3.5 h-3.5 text-[var(--foreground)]/40 absolute left-2.5 top-2.5 pointer-events-none"/>
                    {cityLoading && <Loader2 className="w-3.5 h-3.5 text-[var(--accent)] animate-spin absolute right-2.5 top-2.5"/>}

                    {showCityDropdown && cityResults.length > 0 && (<div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl bg-[var(--glass-bg-dropdown)] backdrop-blur-2xl border border-[var(--glass-border)] overflow-hidden shadow-xl">
                        {cityResults.map((city, i) => (<button key={`${city.lat}-${city.lon}-${i}`} type="button" onClick={() => handleSelectCity(city)} className="w-full px-3 py-2 text-left text-xs text-[var(--foreground)]/80 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 flex items-center gap-1.5 border-b border-[var(--divider)] last:border-b-0 cursor-pointer">
                            <MapPin className="w-3 h-3 text-[var(--accent)] shrink-0"/>
                            <span className="truncate">{city.name}</span>
                          </button>))}
                      </div>)}
                  </div>)}
              </div>)}

            <div data-anchor="weather-temp" className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[var(--foreground)]/80 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-[var(--accent)]"/> Temperature Unit
              </span>
              <div className="flex gap-1 bg-[var(--foreground)]/5 p-0.5 rounded-xl border border-[var(--glass-border)]/30">
                <button onClick={() => general.setTempUnit("celsius")} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95 ${general.tempUnit === "celsius" ? "bg-[var(--accent)] text-[var(--background)] font-bold" : "text-[var(--foreground)]/60"}`}>
                  °C
                </button>
                <button onClick={() => general.setTempUnit("fahrenheit")} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95 ${general.tempUnit === "fahrenheit" ? "bg-[var(--accent)] text-[var(--background)] font-bold" : "text-[var(--foreground)]/60"}`}>
                  °F
                </button>
              </div>
            </div>

            <div data-anchor="weather-forecast" className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[var(--foreground)]/80">Hourly Forecast on Hover</span>
              <button onClick={() => general.setShowForecast(!general.showForecast)} className={`relative w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${general.showForecast ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-[var(--background)] shadow-sm liquid-switch-thumb ${general.showForecast ? "translate-x-4.5" : "translate-x-0"}`}/>
              </button>
            </div>
          </div>)}
      </div>

      <div data-anchor="gen-mail" className="flex flex-col gap-3 border-t border-[var(--divider)] pt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--accent)]"/> Email Shortcut
            </span>
            <span className="text-[10px] text-[var(--foreground)]/45">Quick access to your inbox in the top corner</span>
          </div>
          <button type="button" onClick={() => general.setShowMailButton(!general.showMailButton)} aria-label="Toggle email shortcut" className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${general.showMailButton ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${general.showMailButton ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        {general.showMailButton && (<div className="flex flex-col gap-3.5 mt-1 bg-[var(--foreground)]/2 p-3.5 rounded-2xl border border-[var(--glass-border)]/30">

            <div data-anchor="mail-provider" className="flex flex-col gap-2">
              <span className="text-[11px] font-medium text-[var(--foreground)]/80">Email Provider</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 bg-[var(--foreground)]/5 p-1 rounded-xl border border-[var(--glass-border)]/30">
                {([
                { id: "gmail", label: "Gmail" },
                { id: "outlook", label: "Outlook" },
                { id: "yahoo", label: "Yahoo" },
                { id: "proton", label: "Proton" },
                { id: "icloud", label: "iCloud" },
                { id: "fastmail", label: "Fastmail" },
                { id: "custom", label: "Custom" },
            ] as const).map((provider) => {
                const isSel = general.mailService === provider.id;
                return (<button key={provider.id} type="button" onClick={() => general.setMailService(provider.id)} className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95 text-center truncate ${isSel
                        ? "bg-[var(--accent)] text-[var(--background)] font-bold shadow-sm"
                        : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/80"}`}>
                      {provider.label}
                    </button>);
            })}
              </div>

              {general.mailService === "custom" && (<div className="flex flex-col gap-1.5 pt-1.5">
                  <input type="text" value={general.customMailUrl} onChange={(e) => general.setCustomMailUrl(e.target.value)} placeholder="e.g. https://mail.company.com or mailto:" className="w-full h-8 px-3 rounded-xl bg-[var(--foreground)]/4 border border-[var(--glass-border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] font-mono text-[11px]"/>
                  <span className="text-[10px] text-[var(--foreground)]/40">Enter your webmail address or a mailto: link</span>
                </div>)}
            </div>

            <div data-anchor="mail-style" className="flex max-sm:flex-col max-sm:items-start max-sm:gap-1.5 items-center justify-between pt-2 border-t border-[var(--divider)]">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-[var(--foreground)]/80">Appearance</span>
                <span className="text-[10px] text-[var(--foreground)]/40">Visual style of the button</span>
              </div>
              <div className="flex gap-1 bg-[var(--foreground)]/5 p-0.5 rounded-xl border border-[var(--glass-border)]/30">
                {([
                { id: "pill", label: "Whisper Pill" },
                { id: "icon", label: "Icon Only" },
                { id: "glass", label: "Glass Badge" },
            ] as const).map((opt) => {
                const isSel = general.mailStyle === opt.id;
                return (<button key={opt.id} type="button" onClick={() => general.setMailStyle(opt.id)} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95 ${isSel
                        ? "bg-[var(--accent)] text-[var(--background)] font-bold shadow-sm"
                        : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/80"}`}>
                      {opt.label}
                    </button>);
            })}
              </div>
            </div>

            {general.mailStyle !== "icon" && (<div data-anchor="mail-label" className="flex max-sm:flex-col max-sm:items-start max-sm:gap-1.5 items-center justify-between pt-2 border-t border-[var(--divider)]">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-[var(--foreground)]/80">Button Label</span>
                  <span className="text-[10px] text-[var(--foreground)]/40">Text displayed next to icon</span>
                </div>
                <div className="flex gap-1 bg-[var(--foreground)]/5 p-0.5 rounded-xl border border-[var(--glass-border)]/30">
                  <button type="button" onClick={() => general.setMailLabelMode("generic")} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95 ${general.mailLabelMode === "generic"
                    ? "bg-[var(--accent)] text-[var(--background)] font-bold shadow-sm"
                    : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/80"}`}>
                    "Mail"
                  </button>
                  <button type="button" onClick={() => general.setMailLabelMode("provider")} className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95 ${general.mailLabelMode === "provider"
                    ? "bg-[var(--accent)] text-[var(--background)] font-bold shadow-sm"
                    : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/80"}`}>
                    Provider Name
                  </button>
                </div>
              </div>)}
          </div>)}
      </div>

      <div data-anchor="gen-sync" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[var(--accent)]"/> Firefox Settings Sync
            </span>
            <span className="text-[10px] text-[var(--foreground)]/45">
              Mirror shortcuts, search engines, and theme across devices via Firefox Sync
            </span>
          </div>
          <button type="button" onClick={() => general.setSyncEnabled(!general.syncEnabled)} aria-label="Toggle Firefox Settings Sync" className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${general.syncEnabled ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${general.syncEnabled ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        <div className="flex flex-col gap-2 bg-[var(--foreground)]/2 p-3.5 rounded-2xl border border-[var(--glass-border)]/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--foreground)]/80">Storage Status</span>
            <span className={`text-[10px] font-medium ${general.isSyncAvailable ? "text-[var(--accent)]" : "text-[var(--foreground)]/40"}`}>
              {general.isSyncAvailable
            ? general.syncEnabled
                ? "Syncing via Firefox Account"
                : "Local only (Sync paused)"
            : "Available in Firefox Extension"}
            </span>
          </div>
          <p className="text-[10px] text-[var(--foreground)]/45 leading-relaxed">
            When enabled, your preferences roam securely across any Firefox browser logged into your Firefox account. Uploaded wallpaper images stay on your local device.
          </p>
        </div>
      </div>
    </div>);
}
