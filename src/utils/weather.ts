import { settings } from "./settings";
export interface GeoCityResult {
    name: string;
    lat: number;
    lon: number;
    country?: string;
    display_name?: string;
}
export interface ManualLocation {
    name: string;
    lat: number;
    lon: number;
}
interface OpenMeteoGeoItem {
    id?: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
    admin2?: string;
}
export async function searchCities(query: string): Promise<GeoCityResult[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2)
        return [];
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.results) && data.results.length > 0) {
                return data.results.map((item: OpenMeteoGeoItem) => {
                    const parts: string[] = [item.name];
                    if (item.admin1 && item.admin1 !== item.name) {
                        parts.push(item.admin1);
                    }
                    if (item.country) {
                        parts.push(item.country);
                    }
                    const label = parts.join(", ");
                    return {
                        name: label,
                        lat: item.latitude,
                        lon: item.longitude,
                        country: item.country,
                        display_name: label,
                    };
                });
            }
        }
    }
    catch (err) {
        console.warn("Open-Meteo geocoding search failed, attempting fallback:", err);
    }
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=jsonv2&limit=5&addressdetails=1`;
        const res = await fetch(url, {
            headers: {
                "Accept-Language": typeof navigator !== "undefined" ? navigator.language : "en",
                "User-Agent": "AtriumTabsStartPage/1.7 (https://github.com/itssljk/atrium-tabs)",
            },
        });
        if (!res.ok)
            return [];
        const data = await res.json();
        if (!Array.isArray(data))
            return [];
        return data.map((item: {
            display_name?: string;
            name?: string;
            lat: string;
            lon: string;
            address?: Record<string, string>;
        }) => {
            const a = item.address || {};
            const cityName = item.name || a.city || a.town || a.village || a.municipality || a.county || "Unknown";
            const country = a.country || "";
            const label = country ? `${cityName}, ${country}` : cityName;
            return {
                name: label,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                country,
                display_name: item.display_name,
            };
        });
    }
    catch (err) {
        console.warn("Nominatim fallback search failed:", err);
        return [];
    }
}
interface CachedGeoLocation {
    lat: number;
    lon: number;
    name: string;
    timestamp: number;
}
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
    const cachedData = settings.get("weather-cached-location");
    if (cachedData) {
        try {
            const cached: CachedGeoLocation = JSON.parse(cachedData);
            const distance = Math.sqrt(Math.pow(cached.lat - lat, 2) + Math.pow(cached.lon - lon, 2));
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (distance < 0.02 && Date.now() - cached.timestamp < oneDayMs) {
                return cached.name;
            }
        }
        catch (e) {
            console.warn("Failed to parse cached weather location:", e);
        }
    }
    try {
        const lang = typeof navigator !== "undefined" && navigator.language ? navigator.language.split("-")[0] : "en";
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`);
        if (res.ok) {
            const data = await res.json();
            const cityName = data.city || data.locality || data.principalSubdivision || data.countryName || "";
            if (cityName) {
                settings.set("weather-cached-location", JSON.stringify({
                    lat,
                    lon,
                    name: cityName,
                    timestamp: Date.now(),
                }));
                return cityName;
            }
        }
    }
    catch {
    }
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=10`, {
            headers: {
                "Accept-Language": typeof navigator !== "undefined" ? navigator.language : "en",
                "User-Agent": "AtriumTabsStartPage/1.7 (https://github.com/itssljk/atrium-tabs)",
            },
        });
        if (res.ok) {
            const data = await res.json();
            if (data?.address) {
                const a = data.address;
                const name = a.city || a.town || a.village || a.municipality || a.county || a.state || a.country || "";
                if (name) {
                    settings.set("weather-cached-location", JSON.stringify({
                        lat,
                        lon,
                        name,
                        timestamp: Date.now(),
                    }));
                    return name;
                }
            }
        }
    }
    catch {
    }
    return "";
}
export function getManualLocation(): ManualLocation | null {
    const raw = settings.get("weather-manual-location");
    if (!raw)
        return null;
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed.lat === "number" && typeof parsed.lon === "number") {
            return parsed;
        }
    }
    catch { }
    return null;
}
export function setManualLocation(loc: ManualLocation): void {
    settings.set("weather-manual-location", JSON.stringify(loc));
}
