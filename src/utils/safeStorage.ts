export const safeLocalStorage = {
    getItem(key: string, defaultValue: string = ""): string {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                return window.localStorage.getItem(key) || defaultValue;
            }
        }
        catch (e) {
            console.warn(`localStorage.getItem failed for key "${key}":`, e);
        }
        return defaultValue;
    },
    setItem(key: string, value: string): void {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        }
        catch (e) {
            console.warn(`localStorage.setItem failed for key "${key}":`, e);
        }
    },
    removeItem(key: string): void {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                window.localStorage.removeItem(key);
            }
        }
        catch (e) {
            console.warn(`localStorage.removeItem failed for key "${key}":`, e);
        }
    }
};
