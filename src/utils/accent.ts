export interface AccentPreset {
    id: string;
    name: string;
    color: string;
}
export const ACCENT_PRESETS: AccentPreset[] = [
    { id: "sage", name: "Sage", color: "#7ca38e" },
    { id: "violet", name: "Violet", color: "#A78BFA" },
    { id: "amber", name: "Amber", color: "#FBBF24" },
    { id: "rose", name: "Rose", color: "#FB7185" },
    { id: "cyan", name: "Cyan", color: "#22D3EE" }
];
const REMOVED_ACCENT_FALLBACKS: Record<string, string> = {
    slate: "sage"
};
export function normalizeAccent(accent: string): string {
    return REMOVED_ACCENT_FALLBACKS[accent] ?? accent;
}
export function hexToHsl(hex: string): {
    h: number;
    s: number;
    l: number;
} {
    const clean = hex.trim().replace(/^#/, "");
    let r = 0, g = 0, b = 0;
    if (clean.length === 3) {
        r = parseInt(clean[0] + clean[0], 16);
        g = parseInt(clean[1] + clean[1], 16);
        b = parseInt(clean[2] + clean[2], 16);
    }
    else if (clean.length === 6) {
        r = parseInt(clean.slice(0, 2), 16);
        g = parseInt(clean.slice(2, 4), 16);
        b = parseInt(clean.slice(4, 6), 16);
    }
    else {
        return { h: 0, s: 0, l: 0 };
    }
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}
export function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k_n = k(n);
        const color = l - a * Math.max(Math.min(k_n - 3, 9 - k_n, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
