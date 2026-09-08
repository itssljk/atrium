"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Pipette, Copy, Check } from "lucide-react";
interface Hsl {
    h: number;
    s: number;
    l: number;
}
interface Hsv {
    h: number;
    s: number;
    v: number;
}
function hexToRgb(hex: string): [
    number,
    number,
    number
] {
    let clean = hex.trim().replace(/^#/, "");
    if (clean.length === 3) {
        clean = clean.split("").map((c) => c + c).join("");
    }
    if (clean.length !== 6)
        return [124, 163, 142];
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b];
}
function rgbToHsv(r: number, g: number, b: number): Hsv {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) {
            h = ((g - b) / d) % 6;
            if (h < 0)
                h += 6;
        }
        else if (max === g) {
            h = (b - r) / d + 2;
        }
        else {
            h = (r - g) / d + 4;
        }
        h = Math.round(h * 60);
    }
    const s = max === 0 ? 0 : d / max;
    const v = max;
    return { h: (h + 360) % 360, s, v };
}
function hsvToRgb(h: number, s: number, v: number): [
    number,
    number,
    number
] {
    s = Math.max(0, Math.min(1, s));
    v = Math.max(0, Math.min(1, v));
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }
    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255),
    ];
}
function rgbToHex(r: number, g: number, b: number): string {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
function hsvToHsl(h: number, s: number, v: number): Hsl {
    const l = v * (1 - s / 2);
    const sHsl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
    return {
        h: Math.round(h),
        s: Math.round(Math.max(0, Math.min(1, sHsl)) * 100),
        l: Math.round(Math.max(0, Math.min(1, l)) * 100),
    };
}
export default function CustomPickerPanel({ initialHsl: _initialHsl, initialColor, onColorChange, }: {
    initialHsl: Hsl;
    initialColor: string;
    onColorChange: (hex: string, hsl: Hsl) => void;
}) {
    const [hex, setHex] = useState(initialColor);
    const [hexInput, setHexInput] = useState(() => initialColor.replace(/^#/, ""));
    const [hsv, setHsv] = useState<Hsv>(() => {
        const [r, g, b] = hexToRgb(initialColor);
        return rgbToHsv(r, g, b);
    });
    const [copied, setCopied] = useState(false);
    const satValAreaRef = useRef<HTMLDivElement>(null);
    const hueBarRef = useRef<HTMLDivElement>(null);
    const isDraggingSatVal = useRef(false);
    const isDraggingHue = useRef(false);
    const hsvRef = useRef<Hsv>(hsv);
    useEffect(() => {
        hsvRef.current = hsv;
    }, [hsv]);
    useEffect(() => {
        setHex(initialColor);
        setHexInput(initialColor.replace(/^#/, ""));
        const [r, g, b] = hexToRgb(initialColor);
        const initialHsvState = rgbToHsv(r, g, b);
        setHsv(initialHsvState);
        hsvRef.current = initialHsvState;
    }, [initialColor]);
    const applyPreview = useCallback((hex: string) => {
        document.documentElement.style.setProperty("--custom-accent", hex);
        document.documentElement.setAttribute("data-accent", "custom");
    }, []);
    const updateFromHsv = useCallback((nextHsv: Hsv, commit = false) => {
        hsvRef.current = nextHsv;
        setHsv(nextHsv);
        const [r, g, b] = hsvToRgb(nextHsv.h, nextHsv.s, nextHsv.v);
        const nextHex = rgbToHex(r, g, b);
        setHex(nextHex);
        setHexInput(nextHex.replace(/^#/, ""));
        if (commit) {
            applyPreview(nextHex);
            const nextHsl = hsvToHsl(nextHsv.h, nextHsv.s, nextHsv.v);
            onColorChange(nextHex, nextHsl);
        }
    }, [applyPreview, onColorChange]);
    const updateSatValFromPointer = (e: React.PointerEvent) => {
        if (!satValAreaRef.current)
            return;
        const rect = satValAreaRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        const nextHsv = { ...hsvRef.current, s: x, v: 1 - y };
        updateFromHsv(nextHsv, false);
    };
    const handleSatValPointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        isDraggingSatVal.current = true;
        updateSatValFromPointer(e);
    };
    const handleSatValPointerMove = (e: React.PointerEvent) => {
        if (isDraggingSatVal.current) {
            updateSatValFromPointer(e);
        }
    };
    const handleSatValPointerUp = (e: React.PointerEvent) => {
        if (isDraggingSatVal.current) {
            isDraggingSatVal.current = false;
            try {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
            catch { }
            const rect = satValAreaRef.current?.getBoundingClientRect();
            if (rect) {
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                updateFromHsv({ ...hsvRef.current, s: x, v: 1 - y }, true);
            }
            else {
                updateFromHsv(hsvRef.current, true);
            }
        }
    };
    const updateHueFromPointer = (e: React.PointerEvent) => {
        if (!hueBarRef.current)
            return;
        const rect = hueBarRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const nextH = Math.round(x * 360) % 360;
        const nextHsv = { ...hsvRef.current, h: nextH };
        updateFromHsv(nextHsv, false);
    };
    const handleHuePointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        isDraggingHue.current = true;
        updateHueFromPointer(e);
    };
    const handleHuePointerMove = (e: React.PointerEvent) => {
        if (isDraggingHue.current) {
            updateHueFromPointer(e);
        }
    };
    const handleHuePointerUp = (e: React.PointerEvent) => {
        if (isDraggingHue.current) {
            isDraggingHue.current = false;
            try {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
            catch { }
            const rect = hueBarRef.current?.getBoundingClientRect();
            if (rect) {
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const nextH = Math.round(x * 360) % 360;
                updateFromHsv({ ...hsvRef.current, h: nextH }, true);
            }
            else {
                updateFromHsv(hsvRef.current, true);
            }
        }
    };
    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
        setHexInput(val);
        if (val.length === 6) {
            const fullHex = `#${val}`;
            const [r, g, b] = hexToRgb(fullHex);
            const nextHsv = rgbToHsv(r, g, b);
            updateFromHsv(nextHsv, true);
        }
    };
    const handleHexBlur = () => {
        const clean = hexInput.replace(/[^0-9A-Fa-f]/g, "");
        if (clean.length === 6) {
            const fullHex = `#${clean}`;
            const [r, g, b] = hexToRgb(fullHex);
            const nextHsv = rgbToHsv(r, g, b);
            updateFromHsv(nextHsv, true);
        }
        else if (clean.length === 3) {
            const fullHex = `#${clean.split("").map((c) => c + c).join("")}`;
            const [r, g, b] = hexToRgb(fullHex);
            const nextHsv = rgbToHsv(r, g, b);
            updateFromHsv(nextHsv, true);
        }
        else {
            setHexInput(hex.replace(/^#/, ""));
        }
    };
    const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;
    const handleEyeDropper = async () => {
        if (hasEyeDropper) {
            try {
                const eyeDropper = new (window as any).EyeDropper();
                const result = await eyeDropper.open();
                if (result?.sRGBHex) {
                    const pickedHex = result.sRGBHex.toLowerCase();
                    const [r, g, b] = hexToRgb(pickedHex);
                    const nextHsv = rgbToHsv(r, g, b);
                    updateFromHsv(nextHsv, true);
                }
            }
            catch {
            }
        }
    };
    const copyHex = () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(hex);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };
    return (<div className="flex flex-col gap-3 p-3 rounded-xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40 animate-suggest-in select-none">

      <div ref={satValAreaRef} onPointerDown={handleSatValPointerDown} onPointerMove={handleSatValPointerMove} onPointerUp={handleSatValPointerUp} onPointerCancel={handleSatValPointerUp} className="relative w-full h-32 rounded-lg overflow-hidden cursor-crosshair touch-none border border-[var(--glass-border)]/50 shadow-inner" style={{
            backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
        }}>
        <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0))",
        }}/>
        <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, #000000, rgba(0, 0, 0, 0))",
        }}/>

        <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.6)] pointer-events-none transition-transform duration-75" style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: hex,
        }}/>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <div ref={hueBarRef} onPointerDown={handleHuePointerDown} onPointerMove={handleHuePointerMove} onPointerUp={handleHuePointerUp} onPointerCancel={handleHuePointerUp} className="relative flex-1 h-3 rounded-full cursor-pointer touch-none border border-[var(--glass-border)]/40 shadow-inner" style={{
            background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
        }}>
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.6)] pointer-events-none" style={{
            left: `${(hsv.h / 360) * 100}%`,
            backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
        }}/>
        </div>
        <span className="text-[10px] font-mono text-[var(--foreground)]/45 tabular-nums w-7 text-right">
          {Math.round(hsv.h)}°
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1">

        <div className="w-7.5 h-7.5 rounded-lg border border-[var(--glass-border)] shadow-xs shrink-0 transition-transform active:scale-95" style={{
            backgroundColor: hex,
        }} title={`Active Accent: ${hex}`}/>

        {hasEyeDropper && (<button type="button" onClick={handleEyeDropper} title="Sample color from screen" className="w-7.5 h-7.5 rounded-lg flex items-center justify-center border border-[var(--glass-border)]/60 bg-[var(--foreground)]/5 text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 transition-colors cursor-pointer active:scale-95 shrink-0">
            <Pipette className="w-3.5 h-3.5"/>
          </button>)}

        <div className="flex items-center gap-1 flex-1 min-w-0 bg-[var(--foreground)]/5 border border-[var(--glass-border)]/50 focus-within:border-[var(--accent)]/70 rounded-lg px-2.5 py-1.5 transition-colors">
          <span className="text-[11px] font-mono text-[var(--foreground)]/40 select-none">#</span>
          <input type="text" value={hexInput} onChange={handleHexInputChange} onBlur={handleHexBlur} onKeyDown={(e) => {
            if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
            }
        }} maxLength={6} placeholder="7CA38E" className="w-full bg-transparent text-xs font-mono font-medium text-[var(--foreground)] uppercase outline-none placeholder:text-[var(--foreground)]/25" spellCheck={false}/>
          <button type="button" onClick={copyHex} title={copied ? "Copied!" : "Copy Hex"} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors cursor-pointer p-0.5 rounded">
            {copied ? (<Check className="w-3.5 h-3.5 text-[var(--accent)]"/>) : (<Copy className="w-3.5 h-3.5"/>)}
          </button>
        </div>
      </div>
    </div>);
}
