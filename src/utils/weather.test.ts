import { describe, it, expect, beforeEach, vi } from "vitest";
import { searchCities, reverseGeocode, getManualLocation, setManualLocation } from "./weather";
import { settings } from "./settings";
describe("weather utilities", () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.restoreAllMocks();
    });
    it("searchCities returns empty on empty or 1-char query", async () => {
        expect(await searchCities("")).toEqual([]);
        expect(await searchCities("a")).toEqual([]);
    });
    it("getManualLocation returns null when unset or malformed", () => {
        expect(getManualLocation()).toBeNull();
        settings.set("weather-manual-location", "not-json");
        expect(getManualLocation()).toBeNull();
    });
    it("setManualLocation and getManualLocation round-trips location", () => {
        const loc = { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 };
        setManualLocation(loc);
        expect(getManualLocation()).toEqual(loc);
    });
    it("reverseGeocode uses cached location when fresh", async () => {
        settings.set("weather-cached-location", JSON.stringify({
            lat: 50.0,
            lon: 10.0,
            name: "Frankfurt",
            timestamp: Date.now(),
        }));
        const name = await reverseGeocode(50.005, 10.005);
        expect(name).toBe("Frankfurt");
    });
    it("searchCities formats Open-Meteo geocoding results", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                results: [
                    {
                        id: 1,
                        name: "Berlin",
                        latitude: 52.52,
                        longitude: 13.41,
                        country: "Germany",
                        admin1: "State of Berlin",
                    },
                ],
            }),
        } as Response);
        const results = await searchCities("Berlin");
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe("Berlin, State of Berlin, Germany");
        expect(results[0].lat).toBe(52.52);
        expect(results[0].lon).toBe(13.41);
    });
});
