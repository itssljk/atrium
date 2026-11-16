"use client";
import { useEffect, useState } from "react";
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
    const [copyStatus, setCopyStatus] = useState<"copying" | "success" | "failure" | null>(null);
    useEffect(() => {
        if (copyStatus !== "success" && copyStatus !== "failure")
            return;
        const timeout = setTimeout(() => setCopyStatus(null), 3000);
        return () => clearTimeout(timeout);
    }, [copyStatus]);
    const handleCopyInvite = async () => {
        if (copyStatus === "copying")
            return;
        setCopyStatus("copying");
        try {
            await navigator.clipboard.writeText(siteConfig.links.discord);
            setCopyStatus("success");
        }
        catch {
            setCopyStatus("failure");
        }
    };
    const [backupStatus, setBackupStatus] = useState<{
        success: boolean;
        message: string;
        reload?: boolean;
    } | null>(null);
    const [confirmReset, setConfirmReset] = useState(false);
    const [operation, setOperation] = useState<"restore" | "reset" | null>(null);
    const busy = operation !== null;
    const handleExport = () => {
        const success = exportSettingsToFile();
        setBackupStatus({ success, message: success ? "Settings backup download started." : "Could not export settings." });
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        e.currentTarget.value = "";
        if (!file || busy)
            return;
        setOperation("restore");
        setBackupStatus(null);
        try {
            const result = await importSettingsFromJson(await file.text());
            const count = `Restored ${result.importedCount} ${result.importedCount === 1 ? "setting" : "settings"}.`;
            const detail = result.success ? result.warning : (result.error ?? "Could not restore settings.");
            const message = [result.importedCount > 0 ? count : "", detail].filter(Boolean).join(" ");
            setBackupStatus({ success: result.success, message, reload: result.importedCount > 0 });
        }
        catch {
            setBackupStatus({ success: false, message: "Could not read the settings backup." });
        }
        finally {
            setOperation(null);
        }
    };
    const handleReset = async () => {
        if (busy)
            return;
        if (!confirmReset) {
            setConfirmReset(true);
            return;
        }
        setConfirmReset(false);
        setOperation("reset");
        setBackupStatus(null);
        try {
            await resetAllSettings();
            setBackupStatus({ success: true, message: "Settings reset to defaults. Settings Sync is off and the uploaded wallpaper was cleared.", reload: true });
        }
        catch (error) {
            setBackupStatus({ success: false, message: error instanceof Error ? error.message : "Could not finish resetting settings." });
        }
        finally {
            setOperation(null);
        }
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
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--divider)]">
          <button type="button" onClick={handleCopyInvite} aria-disabled={copyStatus === "copying"} className="text-xs text-[var(--accent)] hover:underline cursor-pointer font-medium active:scale-95 transition-transform duration-200">
            Copy Discord Invite Link
          </button>
          <span role="status" className="text-xs text-[var(--foreground)]/80">
            {copyStatus === "success" && "Link Copied!"}
            {copyStatus === "failure" && "Couldn’t copy the invite. Use Join Server to open it."}
          </span>
        </div>
      </div>

      <div data-anchor="backup-reset" className="p-4 rounded-2xl bg-[var(--foreground)]/2 border border-[var(--glass-border)]/30 flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Archive className="w-4 h-4 text-[var(--accent)]"/> Backup &amp; Reset
          </span>
          <span className="text-[11px] text-[var(--foreground)]/50">
            Export or restore settings as JSON. Backup files exclude uploaded wallpaper images and the Settings Sync switch.
          </span>
        </div>

        <div role="status" className={backupStatus ? `p-2.5 rounded-xl text-xs font-medium border ${backupStatus.success
                ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"}` : undefined}>
          {operation === "reset" ? "Resetting settings…" : operation === "restore" ? "Restoring settings…" : backupStatus?.message}
        </div>
        {backupStatus?.reload && <button type="button" onClick={() => window.location.reload()} className="self-start text-xs font-medium text-[var(--accent)] underline cursor-pointer">
          Reload to apply settings
        </button>}
        {confirmReset && <p id="reset-settings-warning" role="alert" className="text-sm leading-relaxed text-[var(--foreground)]">
          Reset restores all preferences to their defaults, permanently removes this device’s uploaded wallpaper, and turns off Settings Sync.
          If Settings Sync is on, reset also removes Atrium’s synced settings from browser sync storage, affecting other devices that use it.
        </p>}

        <div className="flex items-center gap-2 flex-wrap pt-1">
          <button type="button" onClick={handleExport} disabled={busy || confirmReset} className="px-3 py-1.5 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/80 text-xs font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 border border-[var(--glass-border)]/40 disabled:opacity-50">
            <Download className="w-3.5 h-3.5 text-[var(--accent)]"/>
            <span>Export Backup</span>
          </button>

          <label className="px-3 py-1.5 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/80 text-xs font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 border border-[var(--glass-border)]/40 has-[:disabled]:opacity-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--accent)]">
            <Upload className="w-3.5 h-3.5 text-[var(--accent)]"/>
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleFileChange} disabled={busy || confirmReset} className="sr-only"/>
          </label>

          {confirmReset && <button type="button" onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:bg-[var(--foreground)]/5">Cancel</button>}
          <button type="button" onClick={handleReset} disabled={busy} aria-describedby={confirmReset ? "reset-settings-warning" : undefined} className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 border disabled:opacity-50 ${confirmReset
            ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
            : "bg-[var(--foreground)]/3 text-[var(--foreground)]/60 hover:text-rose-400 hover:bg-rose-500/10 border-[var(--glass-border)]/30"}`}>
            <RotateCcw className="w-3.5 h-3.5"/>
            <span>{confirmReset ? "Confirm Reset" : "Reset Settings"}</span>
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
