import { DEFAULT_QUICKLINKS } from "./quicklinks";
import type { Quicklink } from "./quicklinks";
import type { ManualLocation } from "./weather";
export type Theme = "dark";
export type TempUnit = "celsius" | "fahrenheit";
export type WeatherMode = "auto" | "manual";
export type MailService = "gmail" | "outlook" | "yahoo" | "proton" | "icloud" | "fastmail" | "custom";
export type MailStyle = "pill" | "icon" | "glass";
export type MailLabelMode = "generic" | "provider";
export type BgType = "default" | "curated" | "upload" | "url" | "bing";
export type SearchBarShape = "pill" | "rounded" | "sharp";
export type SearchBarStyle = "glass" | "solid";
export type SearchBarColor = "default" | "accent" | "sage" | "violet" | "amber" | "rose" | "cyan" | "custom";
export type QuicklinksStyle = "pills" | "dock" | "grid";
export type QuicklinksShape = "pill" | "rounded" | "sharp";
export type GreetingMode = "both" | "greeting" | "quote";
export type GreetingGradientStart = "left" | "right" | "top" | "bottom";
export interface CustomEngine {
    id: string;
    name: string;
    url: string;
    domain: string;
}
export interface CustomBang {
    id: string;
    bang: string;
    name: string;
    url: string;
    domain: string;
}
type Parser<T> = (raw: string) => T;
function bool(fallback: boolean): Parser<boolean> {
    return (raw) => (raw === "" ? fallback : raw === "true");
}
function str<T extends string>(fallback: T, values?: readonly T[]): Parser<string> {
    return (raw) => {
        if (raw === "")
            return fallback;
        if (values && !values.includes(raw as T))
            return fallback;
        return raw;
    };
}
function num(fallback: number): Parser<number> {
    return (raw) => {
        if (raw === "")
            return fallback;
        const parsed = parseInt(raw, 10);
        return Number.isNaN(parsed) ? fallback : parsed;
    };
}
function json<T>(fallback: T, validate?: (value: unknown) => T | null): Parser<T> {
    return (raw) => {
        if (raw === "")
            return fallback;
        try {
            const parsed = JSON.parse(raw);
            if (validate) {
                return validate(parsed) ?? fallback;
            }
            return parsed as T;
        }
        catch {
            return fallback;
        }
    };
}
function validateQuicklinks(value: unknown): Quicklink[] | null {
    if (!Array.isArray(value))
        return null;
    return value.filter((l): l is Quicklink => typeof l === "object" && l !== null && typeof (l as Quicklink).id === "string" && typeof (l as Quicklink).url === "string");
}
function validateEngines(value: unknown): CustomEngine[] | null {
    if (!Array.isArray(value))
        return null;
    return value.filter((e): e is CustomEngine => typeof e === "object" && e !== null && typeof (e as CustomEngine).id === "string" && typeof (e as CustomEngine).url === "string");
}
function validateCustomBangs(value: unknown): CustomBang[] | null {
    if (!Array.isArray(value))
        return null;
    return value.filter((b): b is CustomBang => typeof b === "object" &&
        b !== null &&
        typeof (b as CustomBang).id === "string" &&
        typeof (b as CustomBang).bang === "string" &&
        typeof (b as CustomBang).name === "string" &&
        typeof (b as CustomBang).url === "string");
}
function validateStringArray(value: unknown): string[] | null {
    return Array.isArray(value) && value.every((v) => typeof v === "string") ? (value as string[]) : null;
}
function validateManualLocation(value: unknown): ManualLocation | null {
    if (typeof value !== "object" || value === null)
        return null;
    const loc = value as ManualLocation;
    return typeof loc.name === "string" && typeof loc.lat === "number" && typeof loc.lon === "number" ? loc : null;
}
export interface SettingDef {
    key: string;
    default: unknown;
    parse: (raw: string) => unknown;
    sync: boolean;
    serialize?: (value: never) => string;
}
const boolSerialize = (v: boolean) => (v ? "true" : "false");
const jsonSerialize = (v: unknown) => JSON.stringify(v);
const passthrough = (v: string) => v;
export const SETTINGS_SCHEMA = {
    theme: { key: "theme", default: "dark", parse: str<Theme>("dark", ["dark"]), sync: true, serialize: passthrough },
    accent: { key: "accent", default: "sage", parse: str("sage"), sync: true, serialize: passthrough },
    "custom-accent": { key: "custom-accent", default: "#7ca38e", parse: str("#7ca38e"), sync: true, serialize: passthrough },
    "auto-accent-color": { key: "auto-accent-color", default: "", parse: str(""), sync: true, serialize: passthrough },
    "settings-glow": { key: "settings-glow", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    "settings-perf": { key: "settings-perf", default: false, parse: bool(false), sync: true, serialize: boolSerialize },
    "settings-weather": { key: "settings-weather", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    "settings-weather-forecast": { key: "settings-weather-forecast", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    "weather-mode": { key: "weather-mode", default: "auto", parse: str<WeatherMode>("auto", ["auto", "manual"]), sync: true, serialize: passthrough },
    "weather-manual-location": {
        key: "weather-manual-location",
        default: null,
        parse: json<ManualLocation | null>(null, validateManualLocation),
        sync: true,
        serialize: jsonSerialize,
    },
    "temp-unit": { key: "temp-unit", default: "celsius", parse: str<TempUnit>("celsius", ["celsius", "fahrenheit"]), sync: true, serialize: passthrough },
    "settings-quicklinks": { key: "settings-quicklinks", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    "settings-quicklinks-style": {
        key: "settings-quicklinks-style",
        default: "pills",
        parse: (raw: string): QuicklinksStyle => {
            if (raw === "pills" || raw === "dock" || raw === "grid")
                return raw;
            if (raw === "capsule" || raw === "mono")
                return "pills";
            if (raw === "tile")
                return "grid";
            if (raw === "icon")
                return "dock";
            return "pills";
        },
        sync: true,
        serialize: passthrough,
    },
    "settings-quicklinks-shape": { key: "settings-quicklinks-shape", default: "pill", parse: str<QuicklinksShape>("pill", ["pill", "rounded", "sharp"]), sync: true, serialize: passthrough },
    "settings-quicklinks-keycaps": { key: "settings-quicklinks-keycaps", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    "settings-quicklinks-labels": { key: "settings-quicklinks-labels", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    "settings-quicklinks-add-button": { key: "settings-quicklinks-add-button", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    quicklinks: { key: "quicklinks", default: DEFAULT_QUICKLINKS, parse: json<Quicklink[]>(DEFAULT_QUICKLINKS, validateQuicklinks), sync: true, serialize: jsonSerialize },
    username: { key: "username", default: "", parse: str(""), sync: true, serialize: passthrough },
    "settings-greeting": { key: "settings-greeting", default: true, parse: bool(true), sync: false, serialize: boolSerialize },
    "settings-greeting-mode": { key: "settings-greeting-mode", default: "both", parse: str<GreetingMode>("both", ["both", "greeting", "quote"]), sync: false, serialize: passthrough },
    "greeting-gradient-start": { key: "greeting-gradient-start", default: "left", parse: str<GreetingGradientStart>("left", ["left", "right", "top", "bottom"]), sync: false, serialize: passthrough },
    "greeting-gradient-stop": { key: "greeting-gradient-stop", default: 30, parse: num(30), sync: false, serialize: (v: number) => String(v) },
    "settings-show-mail": { key: "settings-show-mail", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    "mail-service": { key: "mail-service", default: "gmail", parse: str<MailService>("gmail", ["gmail", "outlook", "yahoo", "proton", "icloud", "fastmail", "custom"]), sync: true, serialize: passthrough },
    "mail-style": { key: "mail-style", default: "pill", parse: str<MailStyle>("pill", ["pill", "icon", "glass"]), sync: true, serialize: passthrough },
    "mail-label-mode": { key: "mail-label-mode", default: "generic", parse: str<MailLabelMode>("generic", ["generic", "provider"]), sync: true, serialize: passthrough },
    "custom-mail-url": { key: "custom-mail-url", default: "", parse: str(""), sync: true, serialize: passthrough },
    "settings-sync": { key: "settings-sync", default: false, parse: bool(false), sync: false, serialize: boolSerialize },
    "bg-type": { key: "bg-type", default: "default", parse: str<BgType>("default", ["default", "curated", "upload", "url", "bing"]), sync: true, serialize: passthrough },
    "bg-curated-url": { key: "bg-curated-url", default: "", parse: str(""), sync: true, serialize: passthrough },
    "bg-curated-credits": { key: "bg-curated-credits", default: "", parse: str(""), sync: true, serialize: passthrough },
    "bg-url-link": { key: "bg-url-link", default: "", parse: str(""), sync: true, serialize: passthrough },
    "bg-opacity": { key: "bg-opacity", default: 100, parse: num(100), sync: true, serialize: (v: number) => String(v) },
    "bg-blur": { key: "bg-blur", default: 0, parse: num(0), sync: true, serialize: (v: number) => String(v) },
    "bg-dim": { key: "bg-dim", default: 40, parse: num(40), sync: true, serialize: (v: number) => String(v) },
    "bg-dim-touched": { key: "bg-dim-touched", default: false, parse: bool(false), sync: true, serialize: boolSerialize },
    "bg-bing-cache": { key: "bg-bing-cache", default: "", parse: str(""), sync: true, serialize: passthrough },
    "settings-bg-readability": { key: "settings-bg-readability", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    "search-engine-id": { key: "search-engine-id", default: "google", parse: str("google"), sync: true, serialize: passthrough },
    "settings-search-new-tab": { key: "settings-search-new-tab", default: false, parse: bool(false), sync: true, serialize: boolSerialize },
    "settings-search-autofocus": { key: "settings-search-autofocus", default: true, parse: bool(true), sync: true, serialize: boolSerialize },
    "search-bar-shape": { key: "search-bar-shape", default: "pill", parse: str<SearchBarShape>("pill", ["pill", "rounded", "sharp"]), sync: true, serialize: passthrough },
    "search-bar-style": { key: "search-bar-style", default: "glass", parse: str<SearchBarStyle>("glass", ["glass", "solid"]), sync: true, serialize: passthrough },
    "search-bar-color": {
        key: "search-bar-color",
        default: "default",
        parse: str<SearchBarColor>("default", ["default", "accent", "sage", "violet", "amber", "rose", "cyan", "custom"]),
        sync: true,
        serialize: passthrough,
    },
    "search-bar-custom-color": { key: "search-bar-custom-color", default: "#7ca38e", parse: str("#7ca38e"), sync: true, serialize: passthrough },
    "custom-engines": { key: "custom-engines", default: [] as CustomEngine[], parse: json<CustomEngine[]>([], validateEngines), sync: true, serialize: jsonSerialize },
    "custom-bangs": { key: "custom-bangs", default: [] as CustomBang[], parse: json<CustomBang[]>([], validateCustomBangs), sync: true, serialize: jsonSerialize },
    "deleted-engines": { key: "deleted-engines", default: [] as string[], parse: json<string[]>([], validateStringArray), sync: true, serialize: jsonSerialize },
    "deleted-bangs": { key: "deleted-bangs", default: [] as string[], parse: json<string[]>([], validateStringArray), sync: true, serialize: jsonSerialize },
} satisfies Record<string, SettingDef>;
export type SettingsSchema = typeof SETTINGS_SCHEMA;
export type SettingsKey = keyof SettingsSchema;
type ParseResult<F> = F extends (raw: string) => infer T ? T : never;
export type SettingsValues = {
    [K in SettingsKey]: ParseResult<SettingsSchema[K]["parse"]>;
};
export const SYNC_KEYS: ReadonlySet<string> = new Set(Object.values(SETTINGS_SCHEMA)
    .filter((def) => def.sync)
    .map((def) => def.key));
