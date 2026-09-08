"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { settings } from "@/utils/settings";
import { getGreetingPool } from "@/config/greetings";
import { getLiveQuote, type LiveQuoteResult } from "@/utils/quotes";
import type { GreetingGradientStart, GreetingMode } from "@/utils/settingsSchema";
export default function Greeting() {
    const [enabled, setEnabled] = useState<boolean>(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-greeting") !== "false";
    });
    const [greetingMode, setGreetingMode] = useState<GreetingMode>(() => {
        if (typeof window === "undefined")
            return "both";
        return (settings.get("settings-greeting-mode") || "both") as GreetingMode;
    });
    const [gradientStart, setGradientStart] = useState<GreetingGradientStart>(() => {
        if (typeof window === "undefined")
            return "left";
        return (settings.get("greeting-gradient-start") || "left") as GreetingGradientStart;
    });
    const [gradientStop, setGradientStop] = useState<number>(() => {
        if (typeof window === "undefined")
            return 30;
        return settings.getValue("greeting-gradient-stop");
    });
    const gradientAngles: Record<GreetingGradientStart, string> = {
        left: "90deg",
        right: "270deg",
        top: "180deg",
        bottom: "0deg",
    };
    const [salutation, setSalutation] = useState<string>("");
    const [subtext, setSubtext] = useState<string>("");
    const [fallbackPool, setFallbackPool] = useState<string[]>([]);
    const [username, setUsername] = useState<string>("");
    const [isLiveQuote, setIsLiveQuote] = useState<boolean>(false);
    const [liveQuote, setLiveQuote] = useState<LiveQuoteResult | null>(null);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const currentIndexRef = useRef<number>(0);
    const updateGreeting = useCallback((overrideMode?: GreetingMode) => {
        if (settings.get("settings-greeting") === "false")
            return;
        const mode = overrideMode ?? ((settings.get("settings-greeting-mode") || "both") as GreetingMode);
        const now = new Date();
        const user = settings.get("username");
        setUsername(user);
        const { salutation: newSalutation, pool: fallback } = getGreetingPool(now);
        setSalutation(newSalutation);
        setFallbackPool(fallback);
        if (fallback.length > 0) {
            const randomIdx = Math.floor(Math.random() * fallback.length);
            currentIndexRef.current = randomIdx;
            setSubtext(fallback[randomIdx]);
            setLiveQuote(null);
            setIsLiveQuote(false);
        }
        else {
            setSubtext("");
            setLiveQuote(null);
        }
        if (mode !== "greeting") {
            getLiveQuote().then((quoteRes) => {
                if (quoteRes?.formatted) {
                    setLiveQuote(quoteRes);
                    setSubtext(quoteRes.formatted);
                    setIsLiveQuote(true);
                }
            });
        }
    }, []);
    useEffect(() => {
        if (settings.get("settings-greeting") !== "false") {
            updateGreeting();
        }
        const unsubscribe = settings.subscribe((key) => {
            if (key === "username") {
                updateGreeting();
            }
            if (key === "settings-greeting") {
                const isEnabled = settings.get("settings-greeting") !== "false";
                setEnabled(isEnabled);
                if (isEnabled) {
                    updateGreeting();
                }
            }
            if (key === "settings-greeting-mode") {
                const newMode = (settings.get("settings-greeting-mode") || "both") as GreetingMode;
                setGreetingMode(newMode);
                updateGreeting(newMode);
            }
            if (key === "greeting-gradient-start") {
                setGradientStart((settings.get("greeting-gradient-start") || "left") as GreetingGradientStart);
            }
            if (key === "greeting-gradient-stop") {
                setGradientStop(settings.getValue("greeting-gradient-stop"));
            }
        });
        return () => {
            unsubscribe();
        };
    }, [updateGreeting]);
    const handleNextSubtext = () => {
        if (isLiveQuote || fallbackPool.length <= 1)
            return;
        setIsTransitioning(true);
        setTimeout(() => {
            let nextIdx = (currentIndexRef.current + 1) % fallbackPool.length;
            if (fallbackPool[nextIdx] === subtext && fallbackPool.length > 1) {
                nextIdx = (nextIdx + 1) % fallbackPool.length;
            }
            currentIndexRef.current = nextIdx;
            setSubtext(fallbackPool[nextIdx]);
            setLiveQuote(null);
            setIsTransitioning(false);
        }, 180);
    };
    if (!enabled)
        return null;
    if (greetingMode !== "quote" && !salutation) {
        return <div className={greetingMode === "both" ? "h-[68px] sm:h-[84px] lg:h-[96px]" : "h-[44px] sm:h-[56px] lg:h-[68px]"}/>;
    }
    if (greetingMode === "quote" && !subtext) {
        return <div className="h-[24px] sm:h-[28px]"/>;
    }
    const canCycle = !isLiveQuote && fallbackPool.length > 1;
    return (<div className="flex flex-col items-center text-center select-none animate-fade-in-up">
      {greetingMode !== "quote" && (<div className="flex items-baseline justify-center gap-0.5 sm:gap-1">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight greeting-gradient" style={{
                "--greeting-gradient-angle": gradientAngles[gradientStart],
                "--greeting-gradient-stop": `${gradientStop}%`,
            } as React.CSSProperties}>
            {salutation}
            {username ? `, ${username}` : ""}
          </h1>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--accent)] inline-block align-middle translate-y-[-2px] sm:translate-y-[-4px] transition-transform duration-300 hover:scale-125 cursor-default"/>
        </div>)}
      {greetingMode !== "greeting" && subtext && (<button type="button" onClick={handleNextSubtext} disabled={!canCycle} title={canCycle ? "Click to cycle message" : undefined} className={`font-light text-readable transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none select-none max-w-xl sm:max-w-2xl text-sm sm:text-base leading-relaxed tracking-normal text-[var(--foreground)]/70 ${greetingMode === "both" ? "mt-3" : ""} ${canCycle
                ? "cursor-pointer hover:text-[var(--foreground)]/90 hover:scale-[1.015] active:scale-[0.98]"
                : "cursor-default"} ${isTransitioning ? "opacity-0 scale-95 -translate-y-1" : "opacity-100 scale-100 translate-y-0"}`}>
          {isLiveQuote && liveQuote?.quote ? (<span>
              "{liveQuote.quote}"
              {liveQuote.author && liveQuote.author !== "Unknown" && (<span className="whitespace-nowrap"> &mdash; {liveQuote.author}</span>)}
            </span>) : (subtext)}
        </button>)}
    </div>);
}
