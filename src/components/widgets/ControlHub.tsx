"use client";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useSettingsDrawer } from "@/utils/useSettingsDrawer";
const PreferencesDrawer = lazy(() => import("@/components/widgets/PreferencesDrawer"));
const prefetchPreferencesDrawer = () => {
    void import("@/components/widgets/PreferencesDrawer");
};
export default function ControlHub() {
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isOpen, hasOpened, activePane, setActivePane, toggle, close } = useSettingsDrawer();
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (!isOpen)
            return;
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                close();
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen, close]);
    if (!mounted)
        return null;
    return (<div ref={containerRef}>

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 mb-[var(--safe-area-bottom)] mr-[var(--safe-area-right)] z-30 pointer-events-none select-none animate-fade-in-up">
        <button onClick={toggle} onPointerEnter={prefetchPreferencesDrawer} onFocus={prefetchPreferencesDrawer} className="group flex items-center rounded-full px-3 py-3 customize-trigger-btn text-[var(--foreground)]/45 pointer-coarse:text-[var(--foreground)]/55 pointer-coarse:bg-[var(--foreground)]/4 pointer-coarse:border pointer-coarse:border-[var(--glass-border)] pointer-coarse:backdrop-blur-md hover:bg-[var(--foreground)]/5 hover:scale-110 hover:shadow-[0_0_20px_var(--accent-glow)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] pointer-events-auto cursor-pointer active:scale-90" aria-label="Customize start page">
          <Pencil className="w-4 h-4 group-hover:text-[var(--accent)] group-hover:rotate-15 group-hover:scale-120 transition-all duration-400 ease-[cubic-bezier(0.34,1.4,0.64,1)]"/>
        </button>
      </div>

      <div className={`fixed inset-0 bg-black/25 dark:bg-black/55 z-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? "opacity-100 backdrop-blur-[6px] pointer-events-auto" : "opacity-0 backdrop-blur-none pointer-events-none"}`} onClick={close}/>

      <div className={`fixed top-0 right-0 h-dvh w-full sm:w-[420px] max-w-[100vw] bg-[var(--glass-bg)] backdrop-blur-[32px] border-l border-[var(--glass-border)] z-50 overflow-hidden shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] max-sm:border-l-0 max-sm:border-t ${isOpen ? "translate-x-0 translate-y-0 opacity-100 pointer-events-auto" : "max-sm:translate-y-full sm:translate-x-full opacity-0 pointer-events-none"}`}>
        {hasOpened && (<Suspense fallback={null}>
            <PreferencesDrawer isOpen={isOpen} activePane={activePane} setActivePane={setActivePane} close={close}/>
          </Suspense>)}
      </div>
    </div>);
}
