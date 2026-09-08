import { useState, useCallback, useEffect } from "react";
import { settings } from "./settings";
import { getManualLocation, setManualLocation, type ManualLocation } from "./weather";
import type { GreetingGradientStart, GreetingMode, MailService, MailStyle, MailLabelMode } from "./settingsSchema";
export type TempUnit = "celsius" | "fahrenheit";
export type WeatherMode = "auto" | "manual";
export type { GreetingMode, MailService, MailStyle, MailLabelMode };
export const MAIL_PROVIDERS: Record<Exclude<MailService, "custom">, {
    name: string;
    url: string;
}> = {
    gmail: { name: "Gmail", url: "https://mail.google.com" },
    outlook: { name: "Outlook", url: "https://outlook.live.com/mail/" },
    yahoo: { name: "Yahoo", url: "https://mail.yahoo.com" },
    proton: { name: "Proton", url: "https://mail.proton.me" },
    icloud: { name: "iCloud", url: "https://www.icloud.com/mail" },
    fastmail: { name: "Fastmail", url: "https://app.fastmail.com" },
};
export function getMailUrl(service: MailService, customUrl: string): string {
    if (service === "custom") {
        const trimmed = customUrl.trim();
        if (!trimmed)
            return "https://mail.google.com";
        if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("mailto:")) {
            return "https://" + trimmed;
        }
        return trimmed;
    }
    return MAIL_PROVIDERS[service]?.url || "https://mail.google.com";
}
export function getMailName(service: MailService): string {
    if (service === "custom")
        return "Custom Mail";
    return MAIL_PROVIDERS[service]?.name || "Mail";
}
export function useGeneralManager() {
    const [username, setUsernameState] = useState(() => {
        if (typeof window === "undefined")
            return "";
        return settings.get("username");
    });
    const [showGreeting, setShowGreetingState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-greeting") !== "false";
    });
    const [greetingMode, setGreetingModeState] = useState<GreetingMode>(() => {
        if (typeof window === "undefined")
            return "both";
        return (settings.get("settings-greeting-mode") || "both") as GreetingMode;
    });
    const [greetingGradientStart, setGreetingGradientStartState] = useState<GreetingGradientStart>(() => {
        if (typeof window === "undefined")
            return "left";
        return (settings.get("greeting-gradient-start") || "left") as GreetingGradientStart;
    });
    const [greetingGradientStop, setGreetingGradientStopState] = useState<number>(() => {
        if (typeof window === "undefined")
            return 30;
        return settings.getValue("greeting-gradient-stop");
    });
    const [showWeather, setShowWeatherState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-weather") !== "false";
    });
    const [tempUnit, setTempUnitState] = useState<TempUnit>(() => {
        if (typeof window === "undefined")
            return "celsius";
        return (settings.get("temp-unit") || "celsius") as TempUnit;
    });
    const [showForecast, setShowForecastState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-weather-forecast") !== "false";
    });
    const [weatherMode, setWeatherModeState] = useState<WeatherMode>(() => {
        if (typeof window === "undefined")
            return "auto";
        return (settings.get("weather-mode") || "auto") as WeatherMode;
    });
    const [manualLocation, setManualLocationState] = useState<ManualLocation | null>(() => {
        if (typeof window === "undefined")
            return null;
        return getManualLocation();
    });
    const [showMailButton, setShowMailButtonState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-show-mail") !== "false";
    });
    const [mailService, setMailServiceState] = useState<MailService>(() => {
        if (typeof window === "undefined")
            return "gmail";
        return (settings.get("mail-service") || "gmail") as MailService;
    });
    const [mailStyle, setMailStyleState] = useState<MailStyle>(() => {
        if (typeof window === "undefined")
            return "pill";
        return (settings.get("mail-style") || "pill") as MailStyle;
    });
    const [mailLabelMode, setMailLabelModeState] = useState<MailLabelMode>(() => {
        if (typeof window === "undefined")
            return "generic";
        return (settings.get("mail-label-mode") || "generic") as MailLabelMode;
    });
    const [customMailUrl, setCustomMailUrlState] = useState(() => {
        if (typeof window === "undefined")
            return "";
        return settings.get("custom-mail-url");
    });
    const [syncEnabled, setSyncEnabledState] = useState(() => {
        if (typeof window === "undefined")
            return false;
        return settings.getValue("settings-sync");
    });
    const isSyncAvailable = typeof window !== "undefined" ? settings.isSyncAvailable() : false;
    useEffect(() => {
        const handleUpdate = (key: string) => {
            switch (key) {
                case "username":
                    setUsernameState(settings.get("username"));
                    break;
                case "settings-greeting":
                    setShowGreetingState(settings.get("settings-greeting") !== "false");
                    break;
                case "settings-greeting-mode":
                    setGreetingModeState((settings.get("settings-greeting-mode") || "both") as GreetingMode);
                    break;
                case "greeting-gradient-start":
                    setGreetingGradientStartState((settings.get("greeting-gradient-start") || "left") as GreetingGradientStart);
                    break;
                case "greeting-gradient-stop":
                    setGreetingGradientStopState(settings.getValue("greeting-gradient-stop"));
                    break;
                case "settings-weather":
                    setShowWeatherState(settings.get("settings-weather") !== "false");
                    break;
                case "temp-unit":
                    setTempUnitState((settings.get("temp-unit") || "celsius") as TempUnit);
                    break;
                case "settings-weather-forecast":
                    setShowForecastState(settings.get("settings-weather-forecast") !== "false");
                    break;
                case "weather-mode":
                    setWeatherModeState((settings.get("weather-mode") || "auto") as WeatherMode);
                    break;
                case "weather-manual-location":
                    setManualLocationState(getManualLocation());
                    break;
                case "settings-show-mail":
                    setShowMailButtonState(settings.get("settings-show-mail") !== "false");
                    break;
                case "mail-service":
                    setMailServiceState((settings.get("mail-service") || "gmail") as MailService);
                    break;
                case "mail-style":
                    setMailStyleState((settings.get("mail-style") || "pill") as MailStyle);
                    break;
                case "mail-label-mode":
                    setMailLabelModeState((settings.get("mail-label-mode") || "generic") as MailLabelMode);
                    break;
                case "custom-mail-url":
                    setCustomMailUrlState(settings.get("custom-mail-url"));
                    break;
                case "settings-sync":
                    setSyncEnabledState(settings.getValue("settings-sync"));
                    break;
            }
        };
        return settings.subscribe(handleUpdate);
    }, []);
    const setUsername = useCallback((val: string) => {
        setUsernameState(val);
        settings.set("username", val);
    }, []);
    const setShowGreeting = useCallback((val: boolean) => {
        setShowGreetingState(val);
        settings.set("settings-greeting", val ? "true" : "false");
    }, []);
    const setGreetingMode = useCallback((val: GreetingMode) => {
        setGreetingModeState(val);
        settings.set("settings-greeting-mode", val);
    }, []);
    const setGreetingGradientStart = useCallback((val: GreetingGradientStart) => {
        setGreetingGradientStartState(val);
        settings.set("greeting-gradient-start", val);
    }, []);
    const setGreetingGradientStop = useCallback((val: number) => {
        setGreetingGradientStopState(val);
        settings.set("greeting-gradient-stop", String(val));
    }, []);
    const setShowWeather = useCallback((val: boolean) => {
        setShowWeatherState(val);
        settings.set("settings-weather", val ? "true" : "false");
    }, []);
    const setTempUnit = useCallback((val: TempUnit) => {
        setTempUnitState(val);
        settings.set("temp-unit", val);
    }, []);
    const setShowForecast = useCallback((val: boolean) => {
        setShowForecastState(val);
        settings.set("settings-weather-forecast", val ? "true" : "false");
    }, []);
    const setWeatherMode = useCallback((val: WeatherMode) => {
        setWeatherModeState(val);
        settings.set("weather-mode", val);
    }, []);
    const updateManualLocation = useCallback((loc: ManualLocation | null) => {
        setManualLocationState(loc);
        if (loc) {
            setManualLocation(loc);
        }
        else {
            settings.remove("weather-manual-location");
        }
    }, []);
    const setShowMailButton = useCallback((val: boolean) => {
        setShowMailButtonState(val);
        settings.set("settings-show-mail", val ? "true" : "false");
    }, []);
    const setMailService = useCallback((val: MailService) => {
        setMailServiceState(val);
        settings.set("mail-service", val);
    }, []);
    const setMailStyle = useCallback((val: MailStyle) => {
        setMailStyleState(val);
        settings.set("mail-style", val);
    }, []);
    const setMailLabelMode = useCallback((val: MailLabelMode) => {
        setMailLabelModeState(val);
        settings.set("mail-label-mode", val);
    }, []);
    const setCustomMailUrl = useCallback((val: string) => {
        setCustomMailUrlState(val);
        settings.set("custom-mail-url", val);
    }, []);
    const setSyncEnabled = useCallback((val: boolean) => {
        setSyncEnabledState(val);
        settings.setValue("settings-sync", val);
        if (val) {
            void settings.syncAllToRemote();
        }
    }, []);
    return {
        username,
        setUsername,
        showGreeting,
        setShowGreeting,
        greetingMode,
        setGreetingMode,
        greetingGradientStart,
        setGreetingGradientStart,
        greetingGradientStop,
        setGreetingGradientStop,
        showWeather,
        setShowWeather,
        tempUnit,
        setTempUnit,
        showForecast,
        setShowForecast,
        weatherMode,
        setWeatherMode,
        manualLocation,
        updateManualLocation,
        showMailButton,
        setShowMailButton,
        mailService,
        setMailService,
        mailStyle,
        setMailStyle,
        mailLabelMode,
        setMailLabelMode,
        customMailUrl,
        setCustomMailUrl,
        syncEnabled,
        setSyncEnabled,
        isSyncAvailable,
    };
}
