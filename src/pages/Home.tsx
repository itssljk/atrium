import { useEffect, useState } from "react";
import SearchBar from "@/components/widgets/SearchBar";
import Greeting from "@/components/widgets/Greeting";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import MailWidget from "@/components/widgets/MailWidget";
import ControlHub from "@/components/widgets/ControlHub";
import BackgroundOverlay from "@/components/widgets/BackgroundOverlay";
import Quicklinks from "@/components/widgets/Quicklinks";
import { ErrorBoundary } from "@/components/core/ErrorBoundary";
import { settings } from "@/utils/settings";
export default function Home() {
    const [showGreeting, setShowGreeting] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-greeting") !== "false";
    });
    useEffect(() => {
        const unsubscribe = settings.subscribe((key) => {
            if (key === "settings-greeting") {
                setShowGreeting(settings.get("settings-greeting") !== "false");
            }
        });
        return unsubscribe;
    }, []);
    return (<ErrorBoundary>
      <div className="relative isolate min-h-screen min-h-dvh w-full flex flex-col justify-between overflow-x-clip bg-[var(--background)] text-[var(--foreground)] transition-colors duration-400 p-6 pt-[max(1.5rem,var(--safe-area-top))] pb-[max(1.5rem,var(--safe-area-bottom))] pl-[max(1.5rem,var(--safe-area-left))] pr-[max(1.5rem,var(--safe-area-right))] sm:p-12">
        <BackgroundOverlay />

        <div className="absolute top-[35%] left-1/2 w-[300px] h-[300px] sm:w-[550px] sm:h-[550px] rounded-full bg-[var(--accent)]/10 dark:bg-[var(--accent)]/7 blur-[80px] sm:blur-[130px] pointer-events-none -z-10 animate-breathe"/>

        <main className={`flex flex-col items-center gap-8 sm:gap-10 flex-1 w-full max-w-4xl mx-auto transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showGreeting ? "pt-[12vh] sm:pt-[18vh]" : "pt-[16vh] sm:pt-[24vh]"}`}>
          <Greeting />
          <SearchBar />
          <Quicklinks />
        </main>

        <WeatherWidget />
        <MailWidget />
        <ControlHub />
      </div>
    </ErrorBoundary>);
}
