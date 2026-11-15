import type { RGB } from "./colorExtractor";

export const DEFAULT_WALLPAPER_TINT = "#030307";
const canvasColor: RGB = [3, 3, 7];

export function getWallpaperTint(sample: RGB, opacity: number, dim: number, brightness: number, topShade: number): string {
    const visibleImage = Math.max(0, Math.min(100, opacity)) / 100 * (1 - dim / 100) * (1 - topShade);
    const channels = canvasColor.map((base, index) => {
        const channel = Math.round(base + (sample[index] * brightness - base) * visibleImage);
        return channel.toString(16).padStart(2, "0");
    });
    return `#${channels.join("")}`;
}
