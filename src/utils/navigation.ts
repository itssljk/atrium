export function getSettingsUrl(pane?: string): string {
    if (pane) {
        return `./index.html?settings=open&pane=${encodeURIComponent(pane)}`;
    }
    return "./index.html?settings=open";
}
