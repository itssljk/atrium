import type { SettingsPane } from "./useSettingsDrawer";
export interface SettingEntry {
    id: string;
    group: string;
    label: string;
    description: string;
    keywords: string[];
    pane: SettingsPane;
    anchor?: string;
    fallbackAnchor?: string;
    value?: string;
}
export function normalizeText(input: string): string {
    return input
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function termMatchScore(term: string, haystack: string, allowFuzzy = false): number {
    if (!term || !haystack)
        return 0;
    if (haystack === term)
        return 1;
    if (haystack.startsWith(`${term} `))
        return 0.97;
    if (haystack.endsWith(` ${term}`))
        return 0.96;
    if (haystack.startsWith(term))
        return 0.95;
    if (new RegExp(`(^| )${escapeRegExp(term)}( |$)`).test(haystack))
        return 0.92;
    if (haystack.includes(term))
        return 0.78;
    if (allowFuzzy && term.length >= 3) {
        let cursor = 0;
        let first = -1;
        let last = -1;
        for (let i = 0; i < haystack.length && cursor < term.length; i++) {
            if (haystack[i] === term[cursor]) {
                if (first === -1)
                    first = i;
                last = i;
                cursor++;
            }
        }
        if (cursor === term.length) {
            const tightness = term.length / (last - first + 1);
            if (tightness >= 0.45) {
                return Math.min(0.75, 0.35 + 0.4 * tightness);
            }
        }
    }
    return 0;
}
export function tokenizeQuery(query: string): string[] {
    return normalizeText(query).split(" ").filter(Boolean);
}
export function searchSettings(entries: SettingEntry[], query: string, maxResults = 14): SettingEntry[] {
    const terms = tokenizeQuery(query);
    if (terms.length === 0 || query.trim().length < 2)
        return [];
    const phrase = normalizeText(query);
    const scored = entries
        .map((entry, index) => {
        const fields: {
            text: string;
            weight: number;
            fuzzy?: boolean;
        }[] = [
            { text: normalizeText(entry.label), weight: 3, fuzzy: true },
            { text: normalizeText((entry.keywords ?? []).join(" ")), weight: 1.6 },
            { text: normalizeText(entry.description), weight: 1.1 },
            { text: normalizeText(entry.group), weight: 0.8 },
        ];
        if (entry.value) {
            fields.push({ text: normalizeText(entry.value), weight: 0.6 });
        }
        let total = 0;
        let matchedAllTerms = true;
        for (const term of terms) {
            let best = 0;
            for (const field of fields) {
                const score = termMatchScore(term, field.text, field.fuzzy);
                if (score > 0)
                    best = Math.max(best, score * field.weight);
            }
            if (best === 0) {
                matchedAllTerms = false;
                break;
            }
            total += best;
        }
        if (!matchedAllTerms)
            return { entry, score: 0, index };
        const labelText = normalizeText(entry.label);
        const phraseScore = termMatchScore(phrase, labelText);
        if (phraseScore >= 0.92)
            total += 1.4;
        else if (phraseScore >= 0.78)
            total += 0.6;
        return { entry, score: total, index };
    })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index);
    return scored.slice(0, maxResults).map((r) => r.entry);
}
