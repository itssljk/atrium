"use client";
import { useEffect, useState, useRef } from "react";
import { getBackgroundBlob, DEFAULT_BG_SETTINGS } from "@/utils/backgroundDb";
import { settings } from "@/utils/settings";
import { fetchBingWallpaper, getCachedBingWallpaper } from "@/utils/bingWallpaper";
import { analyzeImageBrightness } from "@/utils/colorExtractor";
interface Credits {
    name: string;
    url: string;
}
export default function BackgroundOverlay() {
    const [mounted, setMounted] = useState(false);
    const [bgType, setBgType] = useState<string>("default");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [opacity, setOpacity] = useState<number>(50);
    const [blur, setBlur] = useState<number>(0);
    const [dim, setDim] = useState<number>(40);
    const [smartReadability, setSmartReadability] = useState<boolean>(true);
    const [isBright, setIsBright] = useState<boolean>(false);
    const [upperLuminance, setUpperLuminance] = useState<number>(0);
    const [dimTouched, setDimTouched] = useState<boolean>(false);
    const [credits, setCredits] = useState<Credits | null>(null);
    const objectUrlRef = useRef<string>("");
    const isMountedRef = useRef<boolean>(true);
    const requestCounterRef = useRef<number>(0);
    const loadSettings = async () => {
        if (typeof window === "undefined")
            return;
        const currentRequestId = ++requestCounterRef.current;
        const type = settings.get("bg-type") || DEFAULT_BG_SETTINGS.type;
        const isReadabilityOn = settings.get("settings-bg-readability") !== "false";
        const savedOpacity = settings.getNumber("bg-opacity", DEFAULT_BG_SETTINGS.opacity);
        const savedBlur = settings.getNumber("bg-blur", DEFAULT_BG_SETTINGS.blur);
        const savedDim = settings.getNumber("bg-dim", DEFAULT_BG_SETTINGS.dim);
        const savedDimTouched = settings.get("bg-dim-touched") === "true";
        if (isMountedRef.current) {
            setBgType(type);
            setOpacity(savedOpacity);
            setBlur(savedBlur);
            setDim(savedDim);
            setDimTouched(savedDimTouched);
            setSmartReadability(isReadabilityOn);
        }
        if (type !== "upload" && objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = "";
        }
        let url = "";
        let creditsData: Credits | null = null;
        let sourceToAnalyze: string | Blob | null = null;
        if (type === "curated") {
            url = settings.get("bg-curated-url") || "";
            sourceToAnalyze = url;
            const savedCredits = settings.get("bg-curated-credits");
            if (savedCredits) {
                try {
                    creditsData = JSON.parse(savedCredits);
                }
                catch {
                    creditsData = null;
                }
            }
        }
        else if (type === "url") {
            url = settings.get("bg-url-link") || "";
            sourceToAnalyze = url;
        }
        else if (type === "bing") {
            const cached = getCachedBingWallpaper();
            if (cached?.url) {
                url = cached.url;
                sourceToAnalyze = cached.url;
                creditsData = {
                    name: cached.title || cached.copyright,
                    url: cached.copyrightLink,
                };
            }
            fetchBingWallpaper(false).then((data) => {
                if (!isMountedRef.current || requestCounterRef.current !== currentRequestId)
                    return;
                if (data?.url) {
                    setImageUrl(data.url);
                    setCredits({
                        name: data.title || data.copyright,
                        url: data.copyrightLink,
                    });
                    document.documentElement.dataset.bgCustom = "true";
                    if (isReadabilityOn) {
                        document.documentElement.dataset.bgReadability = "true";
                        analyzeImageBrightness(data.url).then((res) => {
                            if (!isMountedRef.current || requestCounterRef.current !== currentRequestId)
                                return;
                            setIsBright(res.isBright);
                            setUpperLuminance(res.upperLuminance);
                            if (res.isBright) {
                                document.documentElement.dataset.bgBright = "true";
                            }
                            else {
                                delete document.documentElement.dataset.bgBright;
                            }
                        });
                    }
                    else {
                        delete document.documentElement.dataset.bgReadability;
                        delete document.documentElement.dataset.bgBright;
                        setIsBright(false);
                        setUpperLuminance(0);
                    }
                }
            }).catch((err) => {
                console.warn("BackgroundOverlay: Bing fetch failed", err);
            });
        }
        else if (type === "upload") {
            const blob = await getBackgroundBlob();
            if (currentRequestId !== requestCounterRef.current || !isMountedRef.current) {
                return;
            }
            if (blob) {
                sourceToAnalyze = blob;
                const oldUrl = objectUrlRef.current;
                const objUrl = URL.createObjectURL(blob);
                objectUrlRef.current = objUrl;
                url = objUrl;
                if (oldUrl) {
                    URL.revokeObjectURL(oldUrl);
                }
            }
        }
        if (currentRequestId !== requestCounterRef.current || !isMountedRef.current) {
            return;
        }
        setImageUrl(url);
        setCredits(creditsData);
        if (type !== "default" && url) {
            document.documentElement.dataset.bgCustom = "true";
            if (isReadabilityOn && sourceToAnalyze) {
                document.documentElement.dataset.bgReadability = "true";
                analyzeImageBrightness(sourceToAnalyze).then((res) => {
                    if (!isMountedRef.current || requestCounterRef.current !== currentRequestId)
                        return;
                    setIsBright(res.isBright);
                    setUpperLuminance(res.upperLuminance);
                    if (res.isBright) {
                        document.documentElement.dataset.bgBright = "true";
                    }
                    else {
                        delete document.documentElement.dataset.bgBright;
                    }
                });
            }
            else {
                delete document.documentElement.dataset.bgReadability;
                delete document.documentElement.dataset.bgBright;
                setIsBright(false);
                setUpperLuminance(0);
            }
        }
        else {
            setIsBright(false);
            setUpperLuminance(0);
            delete document.documentElement.dataset.bgCustom;
            delete document.documentElement.dataset.bgBright;
            delete document.documentElement.dataset.bgReadability;
        }
    };
    useEffect(() => {
        isMountedRef.current = true;
        loadSettings();
        setMounted(true);
        const handleUpdate = () => {
            loadSettings();
        };
        const unsubscribe = settings.subscribe((key) => {
            if (key === "theme" || key.startsWith("bg-") || key === "settings-bg-readability") {
                handleUpdate();
            }
        });
        return () => {
            isMountedRef.current = false;
            delete document.documentElement.dataset.bgBright;
            delete document.documentElement.dataset.bgReadability;
            delete document.documentElement.dataset.bgCustom;
            unsubscribe();
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);
    if (!mounted || bgType === "default" || !imageUrl)
        return null;
    const ASSIST_START = 0.35;
    const ASSIST_FULL = 0.75;
    const ASSIST_CEILING = 70;
    let effectiveDim = dim;
    if (smartReadability && !dimTouched && upperLuminance > ASSIST_START) {
        const assistStrength = Math.min(1, Math.max(0, (upperLuminance - ASSIST_START) / (ASSIST_FULL - ASSIST_START)));
        const autoAssist = Math.round(ASSIST_CEILING * assistStrength);
        effectiveDim = Math.max(dim, autoAssist);
    }
    const VEIL_START = 0.45;
    const VEIL_FULL = 0.85;
    const VEIL_CEILING = 35;
    const BRIGHTNESS_FLOOR = 0.7;
    let veil = 0;
    let imageBrightness = 1;
    if (smartReadability && upperLuminance > VEIL_START) {
        const t = Math.min(1, Math.max(0, (upperLuminance - VEIL_START) / (VEIL_FULL - VEIL_START)));
        veil = Math.round(VEIL_CEILING * t);
        imageBrightness = 1 - (1 - BRIGHTNESS_FLOOR) * t;
    }
    const totalDim = Math.min(92, effectiveDim + veil);
    const imageFilter = `${imageBrightness < 1 ? `brightness(${imageBrightness.toFixed(2)}) ` : ""}${blur > 0 ? `blur(${blur}px)` : "none"}`;
    return (<>

      <div className="fixed inset-0 pointer-events-none -z-21 bg-[#030307]"/>

      <div className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center" style={{
            backgroundImage: `url("${imageUrl}")`,
            opacity: opacity / 100,
            filter: imageFilter,
            transform: blur > 0 ? "scale(1.03) translateZ(0)" : "translateZ(0)",
            transition: "opacity 0.5s ease-out, filter 0.5s ease-out, transform 0.5s ease-out",
        }}/>

      <div className="fixed inset-0 pointer-events-none -z-19 bg-[#030307]" style={{
            opacity: totalDim / 100,
            transform: "translateZ(0)",
            transition: "opacity 0.5s ease-out",
        }}/>

      <div className="fixed inset-0 pointer-events-none -z-18 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(3,3,7,0.12)_80%,rgba(3,3,7,0.28)_100%)]" style={{
            opacity: opacity > 0 ? (totalDim === 0 && !smartReadability ? 0.2 : 0.75) : 0,
            transform: "translateZ(0)",
            transition: "opacity 0.5s ease-out",
        }}/>

      <div className="fixed inset-0 pointer-events-none -z-17 bg-gradient-to-b from-[#030307]/35 via-[#030307]/12 to-transparent" style={{
            opacity: smartReadability ? (isBright ? 1 : 0.4) : 0,
            transform: "translateZ(0)",
            transition: "opacity 0.5s ease-out",
        }}/>

      {credits && (<div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 mb-[var(--safe-area-bottom)] ml-[var(--safe-area-left)] z-10 pointer-events-auto animate-fade-in-up">
          <a href={credits.url.includes("?")
                ? `${credits.url}&utm_source=atrium_tabs&utm_medium=referral`
                : `${credits.url}?utm_source=atrium_tabs&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2.5 py-1.5 sm:py-1 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm text-[11px] font-normal leading-tight text-white/75 hover:text-white transition-all duration-200 select-none shadow-sm focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-[var(--accent)]">
            <span className="truncate max-w-[160px] sm:max-w-[340px]">
              {bgType === "bing" ? credits.name : `Photo by ${credits.name}`}
            </span>
          </a>
        </div>)}
    </>);
}
