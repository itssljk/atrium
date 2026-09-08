import { useEffect, useState, useCallback, type ChangeEvent } from "react";
import { saveBackgroundBlob, clearBackgroundBlob, getBackgroundBlob, DEFAULT_BG_SETTINGS, } from "./backgroundDb";
import { settings } from "./settings";
import { fetchBingWallpaper, getCachedBingWallpaper, type BingWallpaperData, } from "./bingWallpaper";
export type BgType = "default" | "curated" | "upload" | "url" | "bing";
export type PicsumSubTab = "presets" | "gallery";
export interface PicsumPhoto {
    id: string;
    author: string;
    width: number;
    height: number;
    url: string;
    download_url: string;
}
export function useBackgroundManager() {
    const [bgType, setBgTypeState] = useState<BgType>(() => {
        if (typeof window === "undefined")
            return DEFAULT_BG_SETTINGS.type;
        return (settings.get("bg-type") || DEFAULT_BG_SETTINGS.type) as BgType;
    });
    const [bgCuratedUrl, setBgCuratedUrlState] = useState(() => {
        if (typeof window === "undefined")
            return DEFAULT_BG_SETTINGS.curatedUrl;
        return settings.get("bg-curated-url") || DEFAULT_BG_SETTINGS.curatedUrl;
    });
    const [bgUrlLink, setBgUrlLinkState] = useState(() => {
        if (typeof window === "undefined")
            return DEFAULT_BG_SETTINGS.urlLink;
        return settings.get("bg-url-link") || DEFAULT_BG_SETTINGS.urlLink;
    });
    const [bgOpacity, setBgOpacityState] = useState(() => {
        if (typeof window === "undefined")
            return DEFAULT_BG_SETTINGS.opacity;
        return settings.getNumber("bg-opacity", DEFAULT_BG_SETTINGS.opacity);
    });
    const [bgBlur, setBgBlurState] = useState(() => {
        if (typeof window === "undefined")
            return DEFAULT_BG_SETTINGS.blur;
        return settings.getNumber("bg-blur", DEFAULT_BG_SETTINGS.blur);
    });
    const [bgDim, setBgDimState] = useState(() => {
        if (typeof window === "undefined")
            return DEFAULT_BG_SETTINGS.dim;
        return settings.getNumber("bg-dim", DEFAULT_BG_SETTINGS.dim);
    });
    const [bgDimTouched, setBgDimTouchedState] = useState(() => {
        if (typeof window === "undefined")
            return false;
        return settings.get("bg-dim-touched") === "true";
    });
    const [smartReadability, setSmartReadabilityState] = useState(() => {
        if (typeof window === "undefined")
            return true;
        return settings.get("settings-bg-readability") !== "false";
    });
    const [hasUpload, setHasUpload] = useState(false);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [picsumSubTab, setPicsumSubTab] = useState<PicsumSubTab>("presets");
    const [picsumPage, setPicsumPage] = useState(1);
    const [picsumPhotos, setPicsumPhotos] = useState<PicsumPhoto[]>([]);
    const [picsumLoading, setPicsumLoading] = useState(false);
    const [picsumError, setPicsumError] = useState("");
    const [bingData, setBingData] = useState<BingWallpaperData | null>(() => getCachedBingWallpaper());
    const [bingLoading, setBingLoading] = useState(false);
    const [bingError, setBingError] = useState<string | null>(null);
    useEffect(() => {
        return () => {
            if (uploadPreview) {
                URL.revokeObjectURL(uploadPreview);
            }
        };
    }, [uploadPreview]);
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        getBackgroundBlob().then((blob) => {
            if (blob) {
                setHasUpload(true);
                setUploadPreview(URL.createObjectURL(blob));
            }
        });
    }, []);
    useEffect(() => {
        if (picsumSubTab !== "gallery")
            return;
        let active = true;
        const fetchPhotos = async () => {
            setPicsumLoading(true);
            setPicsumError("");
            try {
                const res = await fetch(`https://picsum.photos/v2/list?page=${picsumPage}&limit=16`);
                if (!res.ok)
                    throw new Error("Failed to fetch web gallery");
                const data = await res.json();
                if (active) {
                    setPicsumPhotos(data);
                }
            }
            catch (err: unknown) {
                if (active) {
                    const errMsg = err instanceof Error ? err.message : "An error occurred";
                    setPicsumError(errMsg);
                }
            }
            finally {
                if (active) {
                    setPicsumLoading(false);
                }
            }
        };
        fetchPhotos();
        return () => {
            active = false;
        };
    }, [picsumPage, picsumSubTab]);
    const setBgType = useCallback((type: BgType) => {
        setBgTypeState(type);
        settings.set("bg-type", type);
    }, []);
    const selectCurated = useCallback((url: string, photographer: string, profileUrl: string) => {
        setBgCuratedUrlState(url);
        settings.set("bg-curated-url", url);
        const credits = JSON.stringify({ name: photographer, url: profileUrl });
        settings.set("bg-curated-credits", credits);
        setBgType("curated");
    }, [setBgType]);
    const setUrlLink = useCallback((url: string) => {
        setBgUrlLinkState(url);
        settings.set("bg-url-link", url);
    }, []);
    const setOpacity = useCallback((val: number) => {
        setBgOpacityState(val);
        settings.set("bg-opacity", val.toString());
    }, []);
    const setBlur = useCallback((val: number) => {
        setBgBlurState(val);
        settings.set("bg-blur", val.toString());
    }, []);
    const setDim = useCallback((val: number) => {
        setBgDimState(val);
        settings.set("bg-dim", val.toString());
        if (!bgDimTouched) {
            setBgDimTouchedState(true);
            settings.set("bg-dim-touched", "true");
        }
    }, [bgDimTouched]);
    const setSmartReadability = useCallback((val: boolean) => {
        setSmartReadabilityState(val);
        settings.set("settings-bg-readability", val ? "true" : "false");
    }, []);
    const uploadFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setUploadError(null);
        if (!file.type.startsWith("image/")) {
            setUploadError("Please upload an image file.");
            return;
        }
        try {
            const savedBlob = await saveBackgroundBlob(file);
            setHasUpload(true);
            if (uploadPreview) {
                URL.revokeObjectURL(uploadPreview);
            }
            const newPreview = URL.createObjectURL(savedBlob);
            setUploadPreview(newPreview);
            setBgType("upload");
        }
        catch (err) {
            console.error("Error saving background:", err);
            setUploadError("Failed to save background image locally.");
        }
    }, [uploadPreview, setBgType]);
    const removeUpload = useCallback(async () => {
        try {
            await clearBackgroundBlob();
            setHasUpload(false);
            if (uploadPreview) {
                URL.revokeObjectURL(uploadPreview);
                setUploadPreview(null);
            }
            if (bgType === "upload") {
                setBgType("default");
            }
        }
        catch (err) {
            console.error("Error clearing background:", err);
        }
    }, [uploadPreview, bgType, setBgType]);
    const randomPicsum = useCallback(async () => {
        setPicsumLoading(true);
        setPicsumError("");
        try {
            const randomPage = Math.floor(Math.random() * 30) + 1;
            const res = await fetch(`https://picsum.photos/v2/list?page=${randomPage}&limit=20`);
            if (!res.ok)
                throw new Error("Failed to fetch random background.");
            const photos = await res.json();
            if (photos.length === 0)
                throw new Error("No photos found.");
            const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
            const url = `https://picsum.photos/id/${randomPhoto.id}/1920/1080`;
            selectCurated(url, randomPhoto.author, randomPhoto.url);
        }
        catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : "An error occurred.";
            setPicsumError(msg);
        }
        finally {
            setPicsumLoading(false);
        }
    }, [selectCurated]);
    const loadBingWallpaper = useCallback(async (forceRefresh = false) => {
        setBingLoading(true);
        setBingError(null);
        try {
            const data = await fetchBingWallpaper(forceRefresh);
            setBingData(data);
        }
        catch (err) {
            console.error("Failed to load Bing wallpaper:", err);
            const msg = err instanceof Error ? err.message : "Failed to load Bing Daily Wallpaper.";
            setBingError(msg);
        }
        finally {
            setBingLoading(false);
        }
    }, []);
    const selectBing = useCallback(async () => {
        setBgType("bing");
        if (!bingData) {
            await loadBingWallpaper(false);
        }
    }, [setBgType, bingData, loadBingWallpaper]);
    useEffect(() => {
        if (bgType === "bing" && !bingData) {
            loadBingWallpaper(false);
        }
    }, [bgType, bingData, loadBingWallpaper]);
    return {
        bgType,
        setBgType,
        bgCuratedUrl,
        selectCurated,
        bgUrlLink,
        setUrlLink,
        bgOpacity,
        setOpacity,
        bgBlur,
        setBlur,
        bgDim,
        setDim,
        bgDimTouched,
        smartReadability,
        setSmartReadability,
        hasUpload,
        uploadPreview,
        uploadError,
        uploadFile,
        removeUpload,
        randomPicsum,
        picsumSubTab,
        setPicsumSubTab,
        picsumPage,
        setPicsumPage,
        picsumPhotos,
        picsumLoading,
        picsumError,
        bingData,
        bingLoading,
        bingError,
        loadBingWallpaper,
        selectBing,
    };
}
