"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { settings } from "@/utils/settings";
import { getManualLocation, reverseGeocode } from "@/utils/weather";
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, CloudMoon, Sun, Moon, Droplets, Wind, } from "lucide-react";
interface WeatherCurrent {
    temperature: number;
    apparentTemperature: number;
    weatherCode: number;
    isDay: number;
    humidity: number;
    windSpeed: number;
}
interface WeatherHourly {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    is_day: number[];
}
interface WeatherDaily {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
}
interface WeatherData {
    current: WeatherCurrent;
    location: string;
    hourly: WeatherHourly;
    daily: WeatherDaily;
}
const WMO_CODES: Record<number, {
    description: string;
}> = {
    0: { description: "Clear" },
    1: { description: "Mostly Clear" },
    2: { description: "Partly Cloudy" },
    3: { description: "Overcast" },
    45: { description: "Fog" },
    48: { description: "Rime Fog" },
    51: { description: "Light Drizzle" },
    53: { description: "Drizzle" },
    55: { description: "Heavy Drizzle" },
    56: { description: "Freezing Drizzle" },
    57: { description: "Heavy Freezing Drizzle" },
    61: { description: "Light Rain" },
    63: { description: "Rain" },
    65: { description: "Heavy Rain" },
    66: { description: "Freezing Rain" },
    67: { description: "Heavy Freezing Rain" },
    71: { description: "Light Snow" },
    73: { description: "Snow" },
    75: { description: "Heavy Snow" },
    77: { description: "Snow Grains" },
    80: { description: "Rain Showers" },
    81: { description: "Heavy Rain Showers" },
    82: { description: "Violent Rain" },
    85: { description: "Snow Showers" },
    86: { description: "Heavy Snow Showers" },
    95: { description: "Thunderstorm" },
    96: { description: "Hail Thunderstorm" },
    99: { description: "Heavy Hail Storm" },
};
function WeatherIcon({ code, isDay = 1, className, strokeWidth = 1.5, }: {
    code: number;
    isDay?: number | boolean;
    className?: string;
    strokeWidth?: number;
}) {
    const props = { className, strokeWidth };
    const isNight = isDay === 0 || isDay === false;
    if (code === 0 || code === 1) {
        return isNight ? <Moon {...props}/> : <Sun {...props}/>;
    }
    if (code === 2) {
        return isNight ? <CloudMoon {...props}/> : <CloudSun {...props}/>;
    }
    if (code === 3)
        return <Cloud {...props}/>;
    if (code >= 45 && code <= 48)
        return <CloudFog {...props}/>;
    if (code >= 51 && code <= 57)
        return <CloudDrizzle {...props}/>;
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
        return <CloudRain {...props}/>;
    if (code >= 71 && code <= 77)
        return <CloudSnow {...props}/>;
    if (code >= 85 && code <= 86)
        return <CloudSnow {...props}/>;
    if (code >= 95 && code <= 99)
        return <CloudLightning {...props}/>;
    return <Cloud {...props}/>;
}
function getDescription(code: number): string {
    return WMO_CODES[code]?.description ?? "Unknown";
}
function formatHour(iso: string): string {
    const date = new Date(iso);
    const locale = typeof navigator !== "undefined" ? navigator.language : undefined;
    return new Intl.DateTimeFormat(locale, { hour: "numeric" }).format(date);
}
function formatDay(iso: string): string {
    const date = new Date(iso);
    const locale = typeof navigator !== "undefined" ? navigator.language : undefined;
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
}
interface CachedWeatherData {
    weather: WeatherData;
    timestamp: number;
}
const WEATHER_CACHE_KEY = "weather-cached-data";
const WEATHER_CACHE_TTL = 20 * 60 * 1000;
function getCachedWeather(): WeatherData | null {
    if (typeof window === "undefined")
        return null;
    const raw = settings.get(WEATHER_CACHE_KEY);
    if (!raw)
        return null;
    try {
        const cached: CachedWeatherData = JSON.parse(raw);
        if (!cached?.weather?.current)
            return null;
        if (cached.weather.current.apparentTemperature === undefined) {
            cached.weather.current.apparentTemperature = cached.weather.current.temperature;
        }
        if (cached.weather.current.isDay === undefined) {
            cached.weather.current.isDay = 1;
        }
        if (cached.weather.current.humidity === undefined) {
            cached.weather.current.humidity = 0;
        }
        if (cached.weather.current.windSpeed === undefined) {
            cached.weather.current.windSpeed = 0;
        }
        return cached.weather;
    }
    catch {
        return null;
    }
}
function isWeatherCacheStale(): boolean {
    if (typeof window === "undefined")
        return true;
    const raw = settings.get(WEATHER_CACHE_KEY);
    if (!raw)
        return true;
    try {
        const cached: CachedWeatherData = JSON.parse(raw);
        return Date.now() - cached.timestamp > WEATHER_CACHE_TTL;
    }
    catch {
        return true;
    }
}
function setCachedWeather(weather: WeatherData): void {
    settings.set(WEATHER_CACHE_KEY, JSON.stringify({
        weather,
        timestamp: Date.now(),
    }));
}
export default function WeatherWidget() {
    const [loaded, setLoaded] = useState(false);
    const [enabled, setEnabled] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-weather") !== "false";
    });
    const [forecastEnabled, setForecastEnabled] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-weather-forecast") !== "false";
    });
    const [tempUnit, setTempUnit] = useState<"celsius" | "fahrenheit">(() => {
        if (typeof window === "undefined")
            return "celsius";
        return (settings.get("temp-unit") || "celsius") as "celsius" | "fahrenheit";
    });
    const [weather, setWeather] = useState<WeatherData | null>(() => getCachedWeather());
    const [showForecast, setShowForecast] = useState(false);
    const [forecastHours, setForecastHours] = useState<{
        iso: string;
        temp: number;
        code: number;
        precip: number;
        isDay: number;
    }[]>([]);
    const weatherRef = useRef<WeatherData | null>(weather);
    const isMountedRef = useRef<boolean>(true);
    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        weatherRef.current = weather;
    }, [weather]);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    const loadWeather = useCallback(async () => {
        try {
            const mode = settings.get("weather-mode") || "auto";
            const manualLoc = getManualLocation();
            let latitude: number | null = null;
            let longitude: number | null = null;
            let locName: string = "";
            if (mode === "manual" && manualLoc) {
                latitude = manualLoc.lat;
                longitude = manualLoc.lon;
                locName = manualLoc.name;
            }
            else if (navigator.geolocation) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: false,
                            timeout: 8000,
                            maximumAge: 600000,
                        });
                    });
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    settings.set("weather-location-granted", "true");
                }
                catch (geoErr) {
                    if (manualLoc) {
                        latitude = manualLoc.lat;
                        longitude = manualLoc.lon;
                        locName = manualLoc.name;
                    }
                    else {
                        throw geoErr;
                    }
                }
            }
            else if (manualLoc) {
                latitude = manualLoc.lat;
                longitude = manualLoc.lon;
                locName = manualLoc.name;
            }
            if (latitude === null || longitude === null)
                return;
            const params = new URLSearchParams({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
                hourly: "temperature_2m,weather_code,precipitation_probability,is_day",
                daily: "temperature_2m_max,temperature_2m_min,weather_code",
                forecast_days: "3",
                timezone: "auto",
            });
            const [weatherRes, resolvedName] = await Promise.all([
                fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`).then((r) => r.json()),
                locName ? Promise.resolve(locName) : reverseGeocode(latitude, longitude),
            ]);
            if (isMountedRef.current && weatherRes?.current) {
                const nextWeather: WeatherData = {
                    current: {
                        temperature: Math.round(weatherRes.current.temperature_2m),
                        apparentTemperature: Math.round(weatherRes.current.apparent_temperature ?? weatherRes.current.temperature_2m),
                        weatherCode: weatherRes.current.weather_code,
                        isDay: weatherRes.current.is_day ?? 1,
                        humidity: Math.round(weatherRes.current.relative_humidity_2m ?? 0),
                        windSpeed: Math.round(weatherRes.current.wind_speed_10m ?? 0),
                    },
                    location: resolvedName || locName,
                    hourly: {
                        time: weatherRes.hourly?.time ?? [],
                        temperature_2m: weatherRes.hourly?.temperature_2m ?? [],
                        weather_code: weatherRes.hourly?.weather_code ?? [],
                        precipitation_probability: weatherRes.hourly?.precipitation_probability ?? [],
                        is_day: weatherRes.hourly?.is_day ?? [],
                    },
                    daily: {
                        time: weatherRes.daily?.time ?? [],
                        temperature_2m_max: weatherRes.daily?.temperature_2m_max ?? [],
                        temperature_2m_min: weatherRes.daily?.temperature_2m_min ?? [],
                        weather_code: weatherRes.daily?.weather_code ?? [],
                    },
                };
                setWeather(nextWeather);
                setCachedWeather(nextWeather);
            }
        }
        catch (error) {
            if (error && typeof error === "object" && "code" in error && error.code === 1) {
                settings.set("weather-location-granted", "false");
            }
        }
    }, []);
    useEffect(() => {
        let active = true;
        let permissionStatus: PermissionStatus | null = null;
        const savedEnabled = settings.get("settings-weather") !== "false";
        const handlePermissionChange = () => {
            if (permissionStatus && active) {
                if (permissionStatus.state === "granted") {
                    loadWeather();
                }
                else if (permissionStatus.state === "denied") {
                    const manualLoc = getManualLocation();
                    if (manualLoc) {
                        loadWeather();
                    }
                    else {
                        setWeather(null);
                    }
                }
            }
        };
        const initWeather = async () => {
            if (!savedEnabled) {
                if (active)
                    setLoaded(true);
                return;
            }
            const mode = settings.get("weather-mode") || "auto";
            const manualLoc = getManualLocation();
            if (mode === "manual" && manualLoc) {
                if (active && (!weatherRef.current || isWeatherCacheStale())) {
                    await loadWeather();
                }
                if (active)
                    setLoaded(true);
                return;
            }
            let shouldLoad = false;
            try {
                if (navigator.permissions && navigator.permissions.query) {
                    const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
                    permissionStatus = status;
                    if (status.state === "granted") {
                        shouldLoad = true;
                    }
                    status.addEventListener("change", handlePermissionChange);
                }
                else {
                    shouldLoad = settings.get("weather-location-granted") === "true";
                }
            }
            catch {
                shouldLoad = settings.get("weather-location-granted") === "true";
            }
            if (shouldLoad && active) {
                if (!weatherRef.current || isWeatherCacheStale()) {
                    await loadWeather();
                }
            }
            else if (manualLoc && active) {
                if (!weatherRef.current || isWeatherCacheStale()) {
                    await loadWeather();
                }
            }
            if (active)
                setLoaded(true);
        };
        initWeather();
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && active) {
                if (!weatherRef.current || isWeatherCacheStale()) {
                    loadWeather();
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleVisibilityChange);
        const intervalTimer = setInterval(() => {
            if (!active)
                return;
            if (document.visibilityState !== "visible")
                return;
            if (!weatherRef.current || isWeatherCacheStale()) {
                loadWeather();
            }
        }, 10 * 60 * 1000);
        const handleUpdate = () => {
            const newEnabled = settings.get("settings-weather") !== "false";
            setEnabled(newEnabled);
            if (newEnabled)
                loadWeather();
        };
        const handleTempUnitUpdate = () => {
            setTempUnit((settings.get("temp-unit") || "celsius") as "celsius" | "fahrenheit");
        };
        const handleForecastSettingUpdate = () => {
            setForecastEnabled(settings.get("settings-weather-forecast") !== "false");
            if (settings.get("settings-weather-forecast") === "false") {
                setShowForecast(false);
            }
        };
        const unsubscribe = settings.subscribe((key) => {
            if (key === "settings-weather" || key === "weather-mode" || key === "weather-manual-location")
                handleUpdate();
            if (key === "temp-unit")
                handleTempUnitUpdate();
            if (key === "settings-weather-forecast")
                handleForecastSettingUpdate();
        });
        return () => {
            active = false;
            unsubscribe();
            clearInterval(intervalTimer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleVisibilityChange);
            if (permissionStatus) {
                permissionStatus.removeEventListener("change", handlePermissionChange);
            }
        };
    }, [loadWeather]);
    useEffect(() => {
        if (!showForecast)
            return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowForecast(false);
            }
        };
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowForecast(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showForecast]);
    if (!loaded)
        return null;
    if (!enabled)
        return null;
    if (!weather) {
        return (<div className="fixed top-0 left-0 z-40 p-6 sm:p-12 pt-[max(1.5rem,var(--safe-area-top))] pl-[max(1.5rem,var(--safe-area-left))] select-none pointer-events-none">
        <button type="button" onClick={loadWeather} className="animate-fade-in-up flex items-center gap-1.5 text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70 text-[13px] font-light tracking-wide weather-text pointer-events-auto transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-lg px-2 py-1 -mx-2 -my-1" title="Click to load weather (or set city in settings)" aria-label="Load weather">
          <CloudSun className="w-3.5 h-3.5 shrink-0 animate-pulse" strokeWidth={1.5}/>
          <span>Show Weather</span>
        </button>
      </div>);
    }
    const displayTemp = (celsius: number) => tempUnit === "fahrenheit" ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
    const displayWind = (kmh: number) => tempUnit === "fahrenheit"
        ? `${Math.round(kmh * 0.621371)} mph`
        : `${Math.round(kmh)} km/h`;
    const openForecast = () => {
        if (!forecastEnabled || !weather)
            return;
        const nowMs = Date.now();
        const hours = (weather.hourly.time ?? [])
            .map((iso, i) => ({
            iso,
            temp: weather.hourly.temperature_2m[i],
            code: weather.hourly.weather_code[i],
            precip: weather.hourly.precipitation_probability ? weather.hourly.precipitation_probability[i] : 0,
            isDay: weather.hourly.is_day ? weather.hourly.is_day[i] : 1,
        }))
            .filter((h) => new Date(h.iso).getTime() >= nowMs - 30 * 60 * 1000)
            .slice(0, 6);
        setForecastHours(hours);
        setShowForecast(true);
    };
    const toggleForecast = () => {
        if (showForecast) {
            setShowForecast(false);
        }
        else {
            openForecast();
        }
    };
    return (<div ref={containerRef} className="fixed top-0 left-0 z-40 p-6 sm:p-12 pt-[max(1.5rem,var(--safe-area-top))] pl-[max(1.5rem,var(--safe-area-left))] select-none pointer-events-none" onMouseEnter={openForecast} onMouseLeave={() => setShowForecast(false)}>

      <button type="button" onClick={toggleForecast} aria-expanded={showForecast} aria-haspopup="dialog" aria-label={`Weather: ${displayTemp(weather.current.temperature)} degrees, ${getDescription(weather.current.weatherCode)} in ${weather.location || "current location"}`} className="animate-fade-in-up group/weather flex items-center gap-1.5 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 focus-visible:text-[var(--foreground)]/90 text-[13px] font-light tracking-wide weather-text pointer-events-auto cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 hover:bg-[var(--foreground)]/5 outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-lg px-2.5 py-1.5 sm:py-1 -mx-2 -my-1">
        <WeatherIcon code={weather.current.weatherCode} isDay={weather.current.isDay} className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/weather:scale-120 group-hover/weather:-rotate-6 text-[var(--accent)]" strokeWidth={1.5}/>
        <span className="tabular-nums">
          {displayTemp(weather.current.temperature)}°{tempUnit === "fahrenheit" ? "F" : "C"}
        </span>
        <span className="hidden sm:inline">
          {getDescription(weather.current.weatherCode)}
        </span>
        {weather.location && (<span className="hidden md:inline text-[var(--foreground)]/30 weather-location">
            &middot; {weather.location}
          </span>)}
      </button>

      {forecastEnabled && showForecast && (<div className="absolute left-6 sm:left-12 top-14 sm:top-18 z-50 pointer-events-auto animate-liquid-drop max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-auto max-sm:bottom-[max(1rem,var(--safe-area-bottom))] max-sm:w-auto">
          <div className="rounded-2xl glass-dropdown p-4 min-w-[280px] max-w-[340px] max-sm:min-w-0 max-sm:w-full flex flex-col gap-3 shadow-2xl backdrop-blur-2xl">

            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-[var(--foreground)]/85 truncate">
                  {weather.location || "Current Location"}
                </span>
                <span className="text-[11px] font-light text-[var(--foreground)]/50 truncate">
                  {getDescription(weather.current.weatherCode)}
                  {weather.current.apparentTemperature !== undefined && (<> &middot; Feels {displayTemp(weather.current.apparentTemperature)}°</>)}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-light tabular-nums text-[var(--foreground)]/95">
                  {displayTemp(weather.current.temperature)}°
                </span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-[var(--divider)]"/>

            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-0.5">
              {forecastHours.map((h, i) => {
                const hasRain = h.precip !== undefined && h.precip >= 15;
                return (<div key={h.iso} className="flex flex-col items-center gap-1 shrink-0 min-w-[36px] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 cursor-default">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--foreground)]/45">
                      {i === 0 ? "Now" : formatHour(h.iso)}
                    </span>
                    <WeatherIcon code={h.code} isDay={h.isDay} className="w-4 h-4 text-[var(--foreground)]/80" strokeWidth={1.5}/>
                    <span className="text-xs font-medium tabular-nums text-[var(--foreground)]/90">
                      {displayTemp(h.temp)}°
                    </span>
                    {hasRain ? (<span className="text-[9px] font-mono font-medium text-[var(--accent)] flex items-center gap-0.5 tracking-tight">
                        <Droplets className="w-2 h-2 shrink-0" strokeWidth={2}/>
                        {h.precip}%
                      </span>) : (<span className="h-[14px] text-[9px] text-transparent select-none">-</span>)}
                  </div>);
            })}
            </div>

            {weather.daily.time.length > 0 && (<>
                <div className="h-[1px] w-full bg-[var(--divider)]"/>
                <div className="flex flex-col gap-2">
                  {weather.daily.time.slice(0, 2).map((day, i) => {
                    const max = weather.daily.temperature_2m_max[i];
                    const min = weather.daily.temperature_2m_min[i];
                    return (<div key={day} className="flex items-center justify-between text-[11px] hover:bg-[var(--foreground)]/4 rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors duration-200">
                        <span className="font-medium text-[var(--foreground)]/70 w-12">
                          {i === 0 ? "Today" : formatDay(day)}
                        </span>
                        <div className="flex items-center gap-2 flex-1 justify-center max-w-[140px] px-2">
                          <span className="tabular-nums font-mono text-[10px] text-[var(--foreground)]/45 w-7 text-right">
                            {displayTemp(min)}°
                          </span>
                          <div className="h-1 flex-1 rounded-full bg-[var(--foreground)]/10 overflow-hidden relative">
                            <div className="absolute top-0 bottom-0 rounded-full bg-[var(--accent)]/50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{
                            left: `${Math.max(0, Math.min(60, ((min + 10) / 45) * 100))}%`,
                            right: `${Math.max(0, Math.min(60, (1 - (max + 10) / 45) * 100))}%`,
                        }}/>
                          </div>
                          <span className="tabular-nums font-mono text-[10px] text-[var(--foreground)]/85 w-7 text-left">
                            {displayTemp(max)}°
                          </span>
                        </div>
                        <WeatherIcon code={weather.daily.weather_code[i]} className="w-3.5 h-3.5 shrink-0 text-[var(--foreground)]/75" strokeWidth={1.5}/>
                      </div>);
                })}
                </div>
              </>)}

            {(weather.current.humidity > 0 || weather.current.windSpeed > 0) && (<>
                <div className="h-[1px] w-full bg-[var(--divider)]"/>
                <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.12em] uppercase text-[var(--foreground)]/40 px-0.5">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-2.5 h-2.5 text-[var(--accent)]" strokeWidth={1.5}/>
                    Humidity {weather.current.humidity}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="w-2.5 h-2.5 text-[var(--accent)]" strokeWidth={1.5}/>
                    Wind {displayWind(weather.current.windSpeed)}
                  </span>
                </div>
              </>)}
          </div>
        </div>)}
    </div>);
}
