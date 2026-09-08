export interface CuratedBackground {
    id: string;
    name: string;
    url: string;
    thumbnail: string;
    photographer: string;
    profileUrl: string;
}
export const CURATED_BACKGROUNDS: CuratedBackground[] = [
    {
        id: "tokyo",
        name: "Tokyo Dusk",
        url: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=240&q=80",
        photographer: "Louie Martinez",
        profileUrl: "https://unsplash.com/@louiemartinez"
    },
    {
        id: "newyork",
        name: "Manhattan Sunset",
        url: "https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=240&q=80",
        photographer: "Emiliano Bar",
        profileUrl: "https://unsplash.com/@emilianobar"
    },
    {
        id: "singapore",
        name: "Marina Bay Sands",
        url: "https://images.unsplash.com/flagged/photo-1562503542-2a1e6f03b16b?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/flagged/photo-1562503542-2a1e6f03b16b?auto=format&fit=crop&w=240&q=80",
        photographer: "Swapnil Bapat",
        profileUrl: "https://unsplash.com/@swapnilsbapat"
    },
    {
        id: "paris",
        name: "Paris Twilight",
        url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=240&q=80",
        photographer: "Chris Karidis",
        profileUrl: "https://unsplash.com/@chriskaridis"
    },
    {
        id: "london",
        name: "London Thames",
        url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=240&q=80",
        photographer: "Benjamin Davies",
        profileUrl: "https://unsplash.com/@bendavisual"
    },
    {
        id: "goldengate",
        name: "Golden Gate Bridge",
        url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=240&q=80",
        photographer: "Maarten van den Heuvel",
        profileUrl: "https://unsplash.com/@mvdheuvel"
    },
    {
        id: "rome",
        name: "Rome Colosseum",
        url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=240&q=80",
        photographer: "David Köhler",
        profileUrl: "https://unsplash.com/@davidk"
    },
    {
        id: "istanbul",
        name: "Galata Horizon",
        url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=240&q=80",
        photographer: "Anna Berdnik",
        profileUrl: "https://unsplash.com/@annaberdnik"
    },
    {
        id: "mountains",
        name: "Foggy Highlands",
        url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=240&q=80",
        photographer: "Eberhard Grossgasteiger",
        profileUrl: "https://unsplash.com/@eberhardg"
    },
    {
        id: "forest",
        name: "Forest Pathway",
        url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=240&q=80",
        photographer: "Dave Hoefler",
        profileUrl: "https://unsplash.com/@davehoefler"
    },
    {
        id: "alpine",
        name: "Starry Alpine Peaks",
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=240&q=80",
        photographer: "Benjamin Voros",
        profileUrl: "https://unsplash.com/@vorosbenis711"
    },
    {
        id: "mistypines",
        name: "Sunlit Pine Woods",
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=240&q=80",
        photographer: "Kalen Emsley",
        profileUrl: "https://unsplash.com/@kalenemsley"
    },
    {
        id: "beach",
        name: "Tranquil Shore",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=240&q=80",
        photographer: "Sean Oulashin",
        profileUrl: "https://unsplash.com/@seanoulashin"
    },
    {
        id: "castle",
        name: "Misty Castle",
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=240&q=80",
        photographer: "Vincentiu Solomon",
        profileUrl: "https://unsplash.com/@vincentiusolomon"
    },
    {
        id: "lonetree",
        name: "Solitary Tree",
        url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=240&q=80",
        photographer: "Sarah Dorweiler",
        profileUrl: "https://unsplash.com/@sarahdorweiler"
    },
    {
        id: "stillwater",
        name: "Cosmic Reflection",
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=240&q=80",
        photographer: "Alexander Andrews",
        profileUrl: "https://unsplash.com/@alexanderandrews"
    }
];
