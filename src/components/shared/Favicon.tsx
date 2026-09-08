import { useState } from "react";
import { getDomain, type Quicklink } from "@/utils/quicklinks";
interface FaviconProps {
    link: Quicklink;
    size?: "xs" | "sm" | "md" | "lg";
}
export default function Favicon({ link, size = "md" }: FaviconProps) {
    const [error, setError] = useState(false);
    const domain = getDomain(link.url);
    const containerClass = size === "xs"
        ? "w-5 h-5 text-[10px] font-bold"
        : size === "sm"
            ? "w-6 h-6 text-xs font-bold"
            : size === "lg"
                ? "w-10 h-10 text-base font-semibold"
                : "w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-semibold";
    const imgClass = size === "xs"
        ? "w-3.5 h-3.5"
        : size === "sm"
            ? "w-4 h-4"
            : size === "lg"
                ? "w-6 h-6"
                : "w-5 h-5 sm:w-5.5 sm:h-5.5";
    if (link.iconType === "emoji" && link.customIcon) {
        return (<div className={`${containerClass} rounded-full flex items-center justify-center select-none shrink-0 transition-transform duration-300`}>
        {link.customIcon}
      </div>);
    }
    if (link.iconType === "text" && link.customIcon) {
        return (<div className={`${containerClass} rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center uppercase select-none shrink-0 transition-transform duration-300`}>
        {link.customIcon.slice(0, 2)}
      </div>);
    }
    if (error || !domain) {
        return (<div className={`${containerClass} rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center select-none shrink-0 transition-transform duration-300`}>
        {link.title.charAt(0).toUpperCase()}
      </div>);
    }
    return (<img src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`} alt="" loading="lazy" decoding="async" width={32} height={32} onError={() => setError(true)} className={`${imgClass} object-contain rounded-sm filter dark:brightness-95 select-none pointer-events-none transition-transform duration-300 shrink-0`}/>);
}
