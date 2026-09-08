"use client";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useGeneralManager, getMailUrl, getMailName } from "@/utils/useGeneralManager";
export default function MailWidget() {
    const [mounted, setMounted] = useState(false);
    const general = useGeneralManager();
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted || !general.showMailButton) {
        return null;
    }
    const url = getMailUrl(general.mailService, general.customMailUrl);
    const label = general.mailLabelMode === "provider"
        ? getMailName(general.mailService)
        : "Mail";
    return (<div className="fixed top-0 right-0 z-40 p-6 sm:p-12 pt-[max(1.5rem,var(--safe-area-top))] pr-[max(1.5rem,var(--safe-area-right))] select-none pointer-events-none" data-testid="mail-widget">
      {general.mailStyle === "pill" && (<a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label}`} className="animate-fade-in-up flex items-center gap-1.5 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 focus-visible:text-[var(--foreground)]/90 text-[13px] font-light tracking-wide pointer-events-auto cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 hover:bg-[var(--foreground)]/5 outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-lg px-2.5 py-1.5 sm:py-1 -mx-2 -my-1 group/mail">
          <Mail className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover/mail:scale-115 group-hover/mail:text-[var(--accent)]" strokeWidth={1.5}/>
          <span>{label}</span>
        </a>)}

      {general.mailStyle === "icon" && (<a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label}`} title={label} className="animate-fade-in-up flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-full text-[var(--foreground)]/50 hover:text-[var(--foreground)]/90 hover:bg-[var(--foreground)]/5 active:scale-90 hover:scale-110 focus-visible:text-[var(--foreground)]/90 pointer-events-auto cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]">
          <Mail className="w-4 h-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] hover:rotate-6" strokeWidth={1.5}/>
        </a>)}

      {general.mailStyle === "glass" && (<a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label}`} className="animate-fade-in-up flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-dropdown)] border border-[var(--glass-border)] hover:border-[var(--glass-border-focus)] hover:shadow-[0_0_16px_var(--accent-glow)] text-[var(--foreground)]/75 hover:text-[var(--foreground)] text-xs font-medium tracking-wide shadow-sm backdrop-blur-md active:scale-92 hover:scale-105 pointer-events-auto cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]">
          <Mail className="w-3.5 h-3.5 shrink-0 text-[var(--accent)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover:scale-115" strokeWidth={1.5}/>
          <span>{label}</span>
        </a>)}
    </div>);
}
