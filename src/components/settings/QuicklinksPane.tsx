"use client";
import { useState } from "react";
import { Plus, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import Favicon from "@/components/shared/Favicon";
import type { Quicklink } from "@/utils/quicklinks";
import type { QuicklinksStyle, QuicklinksShape } from "@/utils/settingsSchema";
import type { QuicklinksManager } from "./types";
interface QuicklinksPaneProps {
    quicklinksManager: QuicklinksManager;
}
export default function QuicklinksPane({ quicklinksManager }: QuicklinksPaneProps) {
    const [isEditingShortcut, setIsEditingShortcut] = useState(false);
    const [editingShortcutId, setEditingShortcutId] = useState<string | null>(null);
    const [shortcutNameInput, setShortcutNameInput] = useState("");
    const [shortcutUrlInput, setShortcutUrlInput] = useState("");
    const [shortcutIconTypeInput, setShortcutIconTypeInput] = useState<"auto" | "emoji" | "text">("auto");
    const [shortcutCustomIconInput, setShortcutCustomIconInput] = useState("");
    const openAddShortcut = () => {
        setEditingShortcutId(null);
        setShortcutNameInput("");
        setShortcutUrlInput("");
        setShortcutIconTypeInput("auto");
        setShortcutCustomIconInput("");
        setIsEditingShortcut(true);
    };
    const openEditShortcut = (link: Quicklink) => {
        setEditingShortcutId(link.id);
        setShortcutNameInput(link.title);
        setShortcutUrlInput(link.url);
        setShortcutIconTypeInput(link.iconType || "auto");
        setShortcutCustomIconInput(link.customIcon || "");
        setIsEditingShortcut(true);
    };
    const handleSaveShortcut = (e: React.FormEvent) => {
        e.preventDefault();
        quicklinksManager.addOrEditLink(shortcutNameInput, shortcutUrlInput, shortcutIconTypeInput, shortcutCustomIconInput, editingShortcutId);
        setIsEditingShortcut(false);
    };
    return (<div className="flex flex-col gap-5">

      <div data-anchor="quicklinks-style" className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-[var(--foreground)]/80">Shortcuts Style</span>
          <span className="text-[10px] text-[var(--foreground)]/45">
            Practical and smooth layouts for everyday navigation
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
                id: "pills",
                label: "Fluid Pills",
                sub: "Modern tags",
                preview: (isSel: boolean) => (<div className={`w-12 h-5 rounded-full border px-1.5 flex items-center gap-1 transition-all ${isSel
                        ? "border-[var(--accent)] bg-[var(--accent)]/15 shadow-[0_0_10px_var(--accent-glow)]"
                        : "border-[var(--glass-border)] bg-[var(--foreground)]/5"}`}>
                  <div className={`w-2 h-2 rounded-full ${isSel ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/30"}`}/>
                  <div className={`w-5 h-1 rounded-full ${isSel ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/25"}`}/>
                </div>),
            },
            {
                id: "dock",
                label: "Glass Shelf",
                sub: "Unified dock",
                preview: (isSel: boolean) => (<div className={`w-14 h-5 rounded-full border px-1.5 flex items-center justify-center gap-1 transition-all ${isSel
                        ? "border-[var(--accent)] bg-[var(--accent)]/15 shadow-[0_0_10px_var(--accent-glow)]"
                        : "border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-xs"}`}>
                  <div className={`w-2 h-2 rounded-full ${isSel ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/30"}`}/>
                  <div className={`w-2.5 h-2.5 rounded-full ${isSel ? "bg-[var(--accent)] shadow-[0_0_6px_var(--accent-glow)]" : "bg-[var(--foreground)]/50"}`}/>
                  <div className={`w-2 h-2 rounded-full ${isSel ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/30"}`}/>
                </div>),
            },
            {
                id: "grid",
                label: "Quiet Grid",
                sub: "Classic refined",
                preview: (isSel: boolean) => (<div className="flex flex-col items-center gap-0.5">
                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${isSel
                        ? "border-[var(--accent)] bg-[var(--accent)]/20 shadow-[0_0_8px_var(--accent-glow)]"
                        : "border-[var(--glass-border)] bg-[var(--foreground)]/5"}`}>
                    <div className={`w-2 h-2 rounded-full ${isSel ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/35"}`}/>
                  </div>
                  <div className={`w-4 h-0.5 rounded-full ${isSel ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/25"}`}/>
                </div>),
            },
        ].map((item) => {
            const isSel = (quicklinksManager.quicklinksStyle || "pills") === item.id;
            return (<button key={item.id} type="button" onClick={() => quicklinksManager.setQuicklinksStyle(item.id as QuicklinksStyle)} className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer ${isSel
                    ? "bg-[var(--accent)]/12 border-[var(--accent)] text-[var(--foreground)] shadow-sm"
                    : "bg-[var(--foreground)]/3 border-[var(--glass-border)]/40 text-[var(--foreground)]/65 hover:bg-[var(--foreground)]/6 hover:text-[var(--foreground)]"}`}>
                {item.preview(isSel)}
                <div className="flex flex-col items-center">
                  <span className={`text-xs font-semibold ${isSel ? "text-[var(--accent)]" : ""}`}>
                    {item.label}
                  </span>
                  <span className="text-[9px] text-[var(--foreground)]/40 leading-none mt-0.5">
                    {item.sub}
                  </span>
                </div>
              </button>);
        })}
        </div>
      </div>

      <div className="h-[1px] bg-[var(--divider)]"/>

      <div data-anchor="quicklinks-shape" className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-[var(--foreground)]/80">Corner Shape</span>
          <span className="text-[10px] text-[var(--foreground)]/45">
            Roundness of shortcut items and containers
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "pill", label: "Pill", sub: "Capsule", radiusClass: "rounded-full" },
            { id: "rounded", label: "Rounded", sub: "Curved", radiusClass: "rounded-xl" },
            { id: "sharp", label: "Sharp", sub: "Crisp", radiusClass: "rounded-[6px]" },
        ].map((item) => {
            const isSel = (quicklinksManager.quicklinksShape || "pill") === item.id;
            return (<button key={item.id} type="button" onClick={() => quicklinksManager.setQuicklinksShape(item.id as QuicklinksShape)} className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer ${isSel
                    ? "bg-[var(--accent)]/12 border-[var(--accent)] text-[var(--foreground)] shadow-sm"
                    : "bg-[var(--foreground)]/3 border-[var(--glass-border)]/40 text-[var(--foreground)]/65 hover:bg-[var(--foreground)]/6 hover:text-[var(--foreground)]"}`}>
                <div className={`w-8 h-4 border flex items-center justify-center transition-all ${item.radiusClass} ${isSel
                    ? "border-[var(--accent)] bg-[var(--accent)]/20"
                    : "border-[var(--foreground)]/30 bg-[var(--foreground)]/4"}`}/>
                <div className="flex flex-col items-center">
                  <span className={`text-[11px] font-semibold ${isSel ? "text-[var(--accent)]" : ""}`}>
                    {item.label}
                  </span>
                  <span className="text-[8px] text-[var(--foreground)]/40 leading-none mt-0.5">
                    {item.sub}
                  </span>
                </div>
              </button>);
        })}
        </div>
      </div>

      <div className="h-[1px] bg-[var(--divider)]"/>

      <div className="flex flex-col gap-2 bg-[var(--foreground)]/3 p-3.5 rounded-2xl border border-[var(--glass-border)]/40">
        <div className="flex items-center justify-between py-1 border-b border-[var(--divider)]">
          <span className="text-xs font-medium text-[var(--foreground)]/90">Enable Shortcuts Bar</span>
          <button role="switch" aria-checked={quicklinksManager.showQuicklinks} aria-label="Enable Shortcuts Bar" onClick={() => quicklinksManager.setShowQuicklinks(!quicklinksManager.showQuicklinks)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${quicklinksManager.showQuicklinks ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${quicklinksManager.showQuicklinks ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-[var(--divider)]">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[var(--foreground)]/90">Number Shortcuts (1-9)</span>
            <span className="text-[9px] text-[var(--foreground)]/45">Display numeric keyboard shortcuts</span>
          </div>
          <button role="switch" aria-checked={quicklinksManager.showKeycaps} aria-label="Number Shortcuts (1-9)" onClick={() => quicklinksManager.setShowKeycaps(!quicklinksManager.showKeycaps)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${quicklinksManager.showKeycaps ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${quicklinksManager.showKeycaps ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-[var(--divider)]">
          <span className="text-xs font-medium text-[var(--foreground)]/90">Show Text Labels</span>
          <button role="switch" aria-checked={quicklinksManager.showLabels} aria-label="Show Text Labels" onClick={() => quicklinksManager.setShowLabels(!quicklinksManager.showLabels)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${quicklinksManager.showLabels ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${quicklinksManager.showLabels ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-medium text-[var(--foreground)]/90">Show &ldquo;+&rdquo; Add Button</span>
          <button role="switch" aria-checked={quicklinksManager.showAddButton} aria-label="Show “+” Add Button" onClick={() => quicklinksManager.setShowAddButton(!quicklinksManager.showAddButton)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${quicklinksManager.showAddButton ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md liquid-switch-thumb ${quicklinksManager.showAddButton ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>
      </div>

      {isEditingShortcut ? (<form onSubmit={handleSaveShortcut} className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--foreground)]/4 border border-[var(--glass-border)]">
          <h4 className="text-xs font-semibold text-[var(--foreground)]">
            {editingShortcutId ? "Edit Shortcut" : "Add Shortcut"}
          </h4>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-semibold text-[var(--foreground)]/50">Name</label>
            <input type="text" value={shortcutNameInput} onChange={(e) => setShortcutNameInput(e.target.value)} placeholder="e.g. GitHub" required maxLength={20} className="h-8.5 px-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"/>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-semibold text-[var(--foreground)]/50">URL</label>
            <input type="text" value={shortcutUrlInput} onChange={(e) => setShortcutUrlInput(e.target.value)} placeholder="https://github.com" required className="h-8.5 px-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"/>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-semibold text-[var(--foreground)]/50">Icon Style</label>
            <div className="flex gap-1 bg-[var(--foreground)]/5 p-1 rounded-xl">
              {(["auto", "emoji", "text"] as const).map((mode) => (<button key={mode} type="button" onClick={() => setShortcutIconTypeInput(mode)} className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${shortcutIconTypeInput === mode
                    ? "bg-[var(--accent)] text-[var(--background)] font-bold shadow-sm"
                    : "text-[var(--foreground)]/60"}`}>
                  {mode === "auto" ? "Favicon" : mode === "emoji" ? "Emoji" : "Badge"}
                </button>))}
            </div>
          </div>

          {shortcutIconTypeInput !== "auto" && (<div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold text-[var(--foreground)]/50">
                {shortcutIconTypeInput === "emoji" ? "Emoji" : "Badge (1-2 chars)"}
              </label>
              <input type="text" value={shortcutCustomIconInput} onChange={(e) => setShortcutCustomIconInput(e.target.value)} placeholder={shortcutIconTypeInput === "emoji" ? "🚀" : "GH"} maxLength={shortcutIconTypeInput === "emoji" ? 4 : 2} className="h-8.5 px-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"/>
            </div>)}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsEditingShortcut(false)} className="px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] cursor-pointer active:scale-95">
              Cancel
            </button>
            <button type="submit" className="px-3.5 py-1.5 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] rounded-lg cursor-pointer font-bold active:scale-95">
              Save
            </button>
          </div>
        </form>) : (<div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--foreground)]/80">
              Shortcuts List ({quicklinksManager.quicklinks.length}/12)
            </span>
            <button onClick={openAddShortcut} disabled={quicklinksManager.quicklinks.length >= 12} className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 disabled:opacity-40 rounded-lg transition-all cursor-pointer active:scale-95">
              <Plus className="w-3 h-3"/> Add Link
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {quicklinksManager.quicklinks.map((link, idx) => (<div key={link.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--glass-border)]/30 bg-[var(--foreground)]/3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Favicon link={link} size="sm"/>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate">{link.title}</span>
                    <span className="text-[9px] text-[var(--foreground)]/45 truncate">{link.url}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => quicklinksManager.moveLink(idx, "up")} disabled={idx === 0} className="p-1 rounded text-[var(--foreground)]/40 hover:text-[var(--accent)] disabled:opacity-20 cursor-pointer active:scale-90" title="Move up">
                    <ArrowUp className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={() => quicklinksManager.moveLink(idx, "down")} disabled={idx === quicklinksManager.quicklinks.length - 1} className="p-1 rounded text-[var(--foreground)]/40 hover:text-[var(--accent)] disabled:opacity-20 cursor-pointer active:scale-90" title="Move down">
                    <ArrowDown className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={() => openEditShortcut(link)} className="p-1 rounded text-[var(--foreground)]/40 hover:text-[var(--accent)] cursor-pointer active:scale-90" title="Edit">
                    <Pencil className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={() => quicklinksManager.deleteLink(link.id)} className="p-1 rounded text-[var(--foreground)]/40 hover:text-rose-400 cursor-pointer active:scale-90" title="Delete">
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </div>))}
          </div>
        </div>)}
    </div>);
}
