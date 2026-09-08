import React from "react";
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
}
function resolveHref(href: string): string {
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("#")) {
        return href;
    }
    const clean = href.replace(/^\/+/, "");
    if (!clean || clean === "index" || clean === "index.html") {
        return "./index.html";
    }
    if (clean === "settings" || clean === "settings.html") {
        return "./settings.html";
    }
    if (clean === "privacy" || clean === "privacy.html") {
        return "./privacy.html";
    }
    if (clean === "tos" || clean === "tos.html") {
        return "./tos.html";
    }
    if (clean === "trademarks" || clean === "trademarks.html") {
        return "./trademarks.html";
    }
    return href.endsWith(".html") ? `./${clean}` : `./${clean}.html`;
}
export const Link: React.FC<LinkProps> = ({ href, children, ...props }) => {
    const targetHref = resolveHref(href);
    return (<a href={targetHref} {...props}>
      {children}
    </a>);
};
export default Link;
