export const siteConfig = {
    name: "Atrium Tabs",
    version: "1.0.0",
    description: "A clean, minimal, and ambient-themed dark browser start page.",
    url: "https://github.com/itssljk/atrium-tabs",
    links: {
        github: "https://github.com/itssljk/atrium-tabs",
        discord: "https://discord.gg/Kfn4V2nF3N",
    },
    mainNav: [
        {
            title: "Home",
            href: "/",
        },
        {
            title: "Settings",
            href: "/settings",
        },
    ],
};
export type SiteConfig = typeof siteConfig;
