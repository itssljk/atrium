import type { PrivacyLevel } from "@/config/searchEngines";
export interface CustomEngine {
    id: string;
    name: string;
    url: string;
    domain: string;
    privacyLabel?: string;
    privacyLevel?: PrivacyLevel;
    privacyDetail?: string;
}
export const CUSTOM_ENGINE_MAX = 8;
export interface CustomBang {
    id: string;
    bang: string;
    name: string;
    url: string;
    domain: string;
}
export const CUSTOM_BANGS_MAX = 30;
