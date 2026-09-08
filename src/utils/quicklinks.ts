export interface Quicklink {
    id: string;
    title: string;
    url: string;
    iconType?: "auto" | "emoji" | "text";
    customIcon?: string;
}
export const DEFAULT_QUICKLINKS: Quicklink[] = [];
export function getDomain(url: string): string {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    }
    catch {
        let clean = url.trim().toLowerCase();
        if (!/^https?:\/\//i.test(clean)) {
            clean = "https://" + clean;
        }
        try {
            return new URL(clean).hostname;
        }
        catch {
            return "";
        }
    }
}
