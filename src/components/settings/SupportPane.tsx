"use client";
import { useState } from "react";
import { MessageSquare, Scale, ShieldCheck, PenLine, Archive, Download, Upload, RotateCcw } from "lucide-react";
import Link from "@/components/core/Link";
import { siteConfig } from "@/config/site";
import { exportSettingsToFile, importSettingsFromJson, resetAllSettings } from "@/utils/backup";
import type { SettingsPane } from "@/utils/useSettingsDrawer";

const exploreFeatures = [
    { pane: "search", title: "Search bangs", description: "Start a query with a bang such as !g to search Google directly.", button: "Search settings" },
    { pane: "quicklinks", title: "Shortcut keys", description: "Press 1–9 outside a text field to open the matching shortcut in order.", button: "Quicklinks settings" },
    { pane: "background", title: "Wallpapers", description: "Try a daily wallpaper, choose a curated image, or use your own.", button: "Background settings" },
] as const;

export default function SupportPane({ onNavigate }: { onNavigate: (pane: SettingsPane) => void }) {
    const [copiedInvite, setCopiedInvite] = useState(false);
    const handleCopyInvite = () => {
        navigator.clipboard.writeText(siteConfig.links.discord);
        setCopiedInvite(true);
        setTimeout(() => setCopiedInvite(false), 2000);
    };
    const [importStatus, setImportStatus] = useState<{
        success?: boolean;
        message?: string;
    } | null>(null);
    const [confirmReset, setConfirmReset] = useState(false);
    const fileInputRef = useState<HTMLInputElement | null>(null);
    const handleExport = () => {
        const success = exportSettingsToFile();
        if (success) {
            setImportStatus({ success: true, message: "Settings exported successfully." });
            setTimeout(() => setImportStatus(null), 3000);
        }
        else {
            setImportStatus({ success: false, message: "Failed to export settings." });
            setTimeout(() => setImportStatus(null), 3000);
        }
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (typeof content === "string") {
                const result = importSettingsFromJson(content);
                if (result.success) {
                    setImportStatus({
                        success: true,
                        message: `Successfully restored ${result.importedCount} settings. Refreshing...`,
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
                else {
                    setImportStatus({
                        success: false,
                        message: result.error || "Failed to import settings file.",
                    });
                    setTimeout(() => setImportStatus(null), 4000);
                }
            }
        };
        reader.onerror = () => {
            setImportStatus({ success: false, message: "Failed to read file." });
            setTimeout(() => setImportStatus(null), 3000);
        };
        reader.readAsText(file);
        e.target.value = "";
    };
    const handleReset = () => {
        if (!confirmReset) {
            setConfirmReset(true);
            setTimeout(() => setConfirmReset(false), 4000);
            return;
        }
        resetAllSettings();
        setConfirmReset(false);
        setImportStatus({ success: true, message: "Settings reset to defaults. Reloading..." });
        setTimeout(() => {
            window.location.reload();
        }, 800);
    };
    return (<div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--foreground)]/2 border border-[var(--glass-border)]/30">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Explore Atrium</h3>
        <ul className="flex flex-col divide-y divide-[var(--divider)]">
          {exploreFeatures.map(({ pane, title, description, button }) => (
            <li key={pane} className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
              <div className="flex min-w-0 flex-1 basis-36 flex-col gap-0.5">
                <span className="text-xs font-medium text-[var(--foreground)]">{title}</span>
                <span className="text-[11px] text-[var(--foreground)]/70">{description}</span>
              </div>
              <button type="button" onClick={() => onNavigate(pane)} className="px-3 py-1.5 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/80 text-xs font-medium cursor-pointer border border-[var(--glass-border)]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
                {button}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="p-4 rounded-2xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/45 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--foreground)]">Atrium Community</span>
            <span className="text-[11px] text-[var(--foreground)]/50">Join our official Discord server</span>
          </div>
          <a href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 active:scale-95 shadow-sm">
            Join Server
          </a>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--divider)]">
          <button onClick={handleCopyInvite} className="text-xs text-[var(--accent)] hover:underline cursor-pointer font-medium active:scale-95 transition-transform duration-200">
            {copiedInvite ? "✓ Link Copied!" : "Copy Discord Invite Link"}
          </button>
        </div>
      </div>

      <div data-anchor="backup-reset" className="p-4 rounded-2xl bg-[var(--foreground)]/2 border border-[var(--glass-border)]/30 flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Archive className="w-4 h-4 text-[var(--accent)]"/> Backup &amp; Reset
          </span>
          <span className="text-[11px] text-[var(--foreground)]/50">
            Export your settings to a JSON file or restore a previous backup
          </span>
        </div>

        {importStatus && (<div className={`p-2.5 rounded-xl text-xs font-medium border ${importStatus.success
                ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
            {importStatus.message}
          </div>)}

        <div className="flex items-center gap-2 flex-wrap pt-1">
          <button type="button" onClick={handleExport} className="px-3 py-1.5 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/80 text-xs font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 border border-[var(--glass-border)]/40">
            <Download className="w-3.5 h-3.5 text-[var(--accent)]"/>
            <span>Export Backup</span>
          </button>

          <label className="px-3 py-1.5 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/80 text-xs font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 border border-[var(--glass-border)]/40">
            <Upload className="w-3.5 h-3.5 text-[var(--accent)]"/>
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleFileChange} className="hidden"/>
          </label>

          <button type="button" onClick={handleReset} className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 border ${confirmReset
            ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
            : "bg-[var(--foreground)]/3 text-[var(--foreground)]/60 hover:text-rose-400 hover:bg-rose-500/10 border-[var(--glass-border)]/30"}`}>
            <RotateCcw className="w-3.5 h-3.5"/>
            <span>{confirmReset ? "Click to Confirm Reset" : "Reset Settings"}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--foreground)]/2 border border-[var(--glass-border)]/30">
        <span className="text-sm font-semibold text-[var(--foreground)]">Legal</span>
        <div className="flex flex-col gap-2 text-xs">
          <Link href="/tos" className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-lg text-[var(--foreground)]/75 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 active:scale-[0.98] transition-all duration-200 cursor-pointer">
            <Scale className="w-3.5 h-3.5 text-[var(--accent)]"/>
            <span className="font-medium">Terms of Service</span>
            <span className="ml-auto text-[10px] text-[var(--foreground)]/40">The agreement governing your use</span>
          </Link>
          <Link href="/privacy" className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-lg text-[var(--foreground)]/75 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 active:scale-[0.98] transition-all duration-200 cursor-pointer">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]"/>
            <span className="font-medium">Privacy Policy</span>
            <span className="ml-auto text-[10px] text-[var(--foreground)]/40">Zero tracking, local-only data</span>
          </Link>
          <Link href="/trademarks" className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-lg text-[var(--foreground)]/75 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 active:scale-[0.98] transition-all duration-200 cursor-pointer">
            <PenLine className="w-3.5 h-3.5 text-[var(--accent)]"/>
            <span className="font-medium">Trademarks &amp; Branding</span>
            <span className="ml-auto text-[10px] text-[var(--foreground)]/40">Using the Atrium name and marks</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[var(--foreground)]/2 border border-[var(--glass-border)]/30 text-xs text-[var(--foreground)]/70 leading-relaxed">
        <span className="font-semibold text-[var(--foreground)]">About Atrium</span>
        <span>Atrium Tabs is built with privacy in mind. No telemetry, no external ad trackers, no profile logging. All preferences stay completely on your local device.</span>
      </div>
    </div>);
}
