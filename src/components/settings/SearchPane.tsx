"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import { ExternalLink, Sparkles, Trash2, Plus, ArrowUp, ArrowDown, Pencil, X, Check, ShieldCheck, Leaf, Eye, Wrench, Search, } from "lucide-react";
import { createPortal } from "react-dom";
import { SEARCH_BANGS, faviconUrl } from "@/config/searchEngines";
import { CUSTOM_ENGINE_MAX, CUSTOM_BANGS_MAX, type CustomEngine, type CustomBang } from "@/settings/types";
import type { SearchManager } from "./types";
interface SearchPaneProps {
    search: SearchManager;
}
function PrivacyIcon({ level }: {
    level?: string;
}) {
    const cls = "w-3.5 h-3.5 shrink-0";
    switch (level) {
        case "private":
            return <ShieldCheck className={`${cls} text-[var(--accent)]`} strokeWidth={1.75}/>;
        case "eco":
            return <Leaf className={`${cls} text-[var(--accent)]`} strokeWidth={1.75}/>;
        case "custom":
            return <Wrench className={`${cls} text-[var(--foreground)]/35`} strokeWidth={1.75}/>;
        default:
            return <Eye className={`${cls} text-[var(--foreground)]/35`} strokeWidth={1.75}/>;
    }
}
function renderPrivacyTag(level?: string, label?: string, detail?: string) {
    const text = label || "Standard";
    const tooltip = detail ? `${text}: ${detail}` : text;
    return (<span role="img" aria-label={`Privacy: ${text}`} title={tooltip} className="inline-flex items-center select-none">
      <PrivacyIcon level={level}/>
    </span>);
}
export default function SearchPane({ search }: SearchPaneProps) {
    const [isViewingDirectory, setIsViewingDirectory] = useState(false);
    const [directoryFilter, setDirectoryFilter] = useState("");
    const directoryFilterInputRef = useRef<HTMLInputElement>(null);
    const openDirectoryModal = () => {
        setDirectoryFilter("");
        setIsViewingDirectory(true);
        setTimeout(() => directoryFilterInputRef.current?.focus(), 50);
    };
    useEffect(() => {
        if (!isViewingDirectory)
            return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsViewingDirectory(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isViewingDirectory]);
    const builtInBangs = useMemo(() => {
        const list: Array<{
            bang: string;
            name: string;
            url: string;
            domain: string;
            aliases: string[];
        }> = [];
        const aliasEntries = Object.values(SEARCH_BANGS).filter((b) => b.alias);
        for (const b of Object.values(SEARCH_BANGS)) {
            if (b.alias)
                continue;
            const aliases = aliasEntries
                .filter((a) => a.name === b.name && a.bang !== b.bang)
                .map((a) => a.bang);
            list.push({ ...b, aliases });
        }
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }, []);
    const activeBuiltInBangs = useMemo(() => {
        const deleted = new Set(search.deletedBangs.map((d) => d.toLowerCase()));
        return builtInBangs.filter((b) => !deleted.has(b.bang.toLowerCase()));
    }, [builtInBangs, search.deletedBangs]);
    const normalizedFilter = directoryFilter.trim().toLowerCase();
    const filteredCustomBangs = useMemo(() => {
        if (!normalizedFilter)
            return search.customBangs;
        return search.customBangs.filter((b) => b.bang.toLowerCase().includes(normalizedFilter) ||
            b.name.toLowerCase().includes(normalizedFilter) ||
            b.domain.toLowerCase().includes(normalizedFilter));
    }, [search.customBangs, normalizedFilter]);
    const filteredBuiltInBangs = useMemo(() => {
        if (!normalizedFilter)
            return activeBuiltInBangs;
        return activeBuiltInBangs.filter((b) => b.bang.toLowerCase().includes(normalizedFilter) ||
            b.name.toLowerCase().includes(normalizedFilter) ||
            b.domain.toLowerCase().includes(normalizedFilter) ||
            b.aliases.some((alias) => alias.toLowerCase().includes(normalizedFilter)));
    }, [activeBuiltInBangs, normalizedFilter]);
    const [isEditingBang, setIsEditingBang] = useState(false);
    const [editingBangId, setEditingBangId] = useState<string | null>(null);
    const [bangTriggerInput, setBangTriggerInput] = useState("");
    const [bangNameInput, setBangNameInput] = useState("");
    const [bangUrlInput, setBangUrlInput] = useState("");
    const [bangError, setBangError] = useState<string | null>(null);
    const bangTriggerInputRef = useRef<HTMLInputElement>(null);
    const openAddBangModal = () => {
        setEditingBangId(null);
        setBangTriggerInput("");
        setBangNameInput("");
        setBangUrlInput("");
        setBangError(null);
        setIsEditingBang(true);
        setTimeout(() => bangTriggerInputRef.current?.focus(), 50);
    };
    const openEditBangModal = (bang: CustomBang) => {
        setEditingBangId(bang.id);
        setBangTriggerInput(bang.bang);
        setBangNameInput(bang.name);
        setBangUrlInput(bang.url);
        setBangError(null);
        setIsEditingBang(true);
        setTimeout(() => bangTriggerInputRef.current?.focus(), 50);
    };
    const handleSaveBang = (e: React.FormEvent) => {
        e.preventDefault();
        const result = search.saveCustomBang(bangTriggerInput, bangNameInput, bangUrlInput, editingBangId);
        if (result.success) {
            setIsEditingBang(false);
            setBangError(null);
        }
        else {
            setBangError(result.error || "Failed to save shortcut.");
        }
    };
    const [isEditingEngine, setIsEditingEngine] = useState(false);
    const [editingEngineId, setEditingEngineId] = useState<string | null>(null);
    const [engineNameInput, setEngineNameInput] = useState("");
    const [engineUrlInput, setEngineUrlInput] = useState("");
    const engineNameInputRef = useRef<HTMLInputElement>(null);
    const openAddEngineModal = () => {
        setEditingEngineId(null);
        setEngineNameInput("");
        setEngineUrlInput("");
        setIsEditingEngine(true);
        setTimeout(() => engineNameInputRef.current?.focus(), 50);
    };
    const openEditEngineModal = (engine: CustomEngine) => {
        setEditingEngineId(engine.id);
        setEngineNameInput(engine.name);
        setEngineUrlInput(engine.url);
        setIsEditingEngine(true);
        setTimeout(() => engineNameInputRef.current?.focus(), 50);
    };
    const handleSaveEngine = (e: React.FormEvent) => {
        e.preventDefault();
        const success = search.saveCustomEngine(engineNameInput, engineUrlInput, editingEngineId);
        if (success) {
            setIsEditingEngine(false);
        }
    };
    return (<>
      <div className="flex flex-col gap-5">
        <div data-anchor="search-new-tab" className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]"/> Open in New Tab
            </span>
            <span className="text-[10px] text-[var(--foreground)]/45">
              Launch search queries into a new browser tab
            </span>
          </div>
          <button onClick={() => search.setOpenInNewTab(!search.openInNewTab)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${search.openInNewTab ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${search.openInNewTab ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        <div data-anchor="search-autofocus" className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--foreground)]/90 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[var(--accent)]"/> Auto-focus Search Bar
            </span>
            <span className="text-[10px] text-[var(--foreground)]/45">
              Focus search input immediately when opening a new tab
            </span>
          </div>
          <button onClick={() => search.setAutoFocus(!search.autoFocus)} className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-95 ${search.autoFocus ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
            <div className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-md transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${search.autoFocus ? "translate-x-5" : "translate-x-0"}`}/>
          </button>
        </div>

        <div data-anchor="search-provider" className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--foreground)]/80">Search Provider</span>
            {search.deletedEngineIds.length > 0 && (<button onClick={search.restoreDefaultEngines} className="text-[10px] font-semibold text-[var(--accent)] hover:underline cursor-pointer active:scale-95">
                Restore Defaults
              </button>)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {search.availableEngines.map((engine) => {
            const isSel = search.searchEngineId === engine.id;
            return (<div key={engine.id} onClick={() => search.setSearchEngineId(engine.id)} className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer group select-none ${isSel
                    ? "bg-[var(--foreground)]/8 border-[var(--accent)] text-[var(--foreground)] shadow-sm"
                    : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5"}`}>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={faviconUrl(engine.domain || "example.com", 32)} alt="" className="w-4 h-4 object-contain filter dark:brightness-95 shrink-0"/>
                      <span className={`text-xs font-semibold truncate ${isSel ? "text-[var(--accent)]" : "text-[var(--foreground)]/90"}`}>
                        {engine.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSel ? (<Check className="w-3.5 h-3.5 text-[var(--accent)] stroke-[2.5]"/>) : (<button type="button" onClick={(e) => {
                        e.stopPropagation();
                        search.deleteEngine(engine.id);
                    }} className="p-1 rounded text-[var(--foreground)]/30 hover:text-rose-400 active:scale-90 transition-colors cursor-pointer" title="Delete engine">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 w-full">
                    {renderPrivacyTag(engine.privacyLevel, engine.privacyLabel, engine.privacyDetail)}
                    <span className="text-[10px] font-mono text-[var(--foreground)]/35 truncate">
                      {engine.domain}
                    </span>
                  </div>
                </div>);
        })}
          </div>
        </div>

        <div data-anchor="search-bangs" className="flex flex-col gap-2.5 border-t border-[var(--divider)] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--foreground)]/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]"/> Search Bangs Support
            </span>
            <div className="flex items-center gap-2">
              {search.deletedBangs.length > 0 && (<button type="button" onClick={search.restoreDefaultBangs} className="text-[10px] font-semibold text-[var(--accent)] hover:underline cursor-pointer active:scale-95">
                  Restore Defaults
                </button>)}
              <span className="text-[10px] font-mono text-[var(--foreground)]/40">
                {activeBuiltInBangs.length + search.customBangs.length} shortcuts
              </span>
              <button type="button" onClick={openAddBangModal} disabled={search.customBangs.length >= CUSTOM_BANGS_MAX} className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 disabled:opacity-40 rounded-lg transition-all cursor-pointer active:scale-95">
                <Plus className="w-3 h-3"/> Add Bang
              </button>
            </div>
          </div>

          <p className="text-[10px] text-[var(--foreground)]/50 leading-relaxed">
            Type shortcut triggers like <code className="text-[var(--accent)] bg-[var(--accent)]/10 px-1 rounded">!yt</code> or <code className="text-[var(--accent)] bg-[var(--accent)]/10 px-1 rounded">!w</code> in search to route directly to any site.
          </p>

          <div className="flex flex-wrap items-center gap-1.5 py-0.5">
            {[
            { bang: "!yt", name: "YouTube" },
            { bang: "!gh", name: "GitHub" },
            { bang: "!w", name: "Wikipedia" },
            { bang: "!r", name: "Reddit" },
            { bang: "!ppx", name: "Perplexity" },
        ]
            .filter((chip) => !search.deletedBangs.includes(chip.bang.toLowerCase()))
            .map((chip) => (<span key={chip.bang} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--foreground)]/4 text-[10px]">
                  <span className="font-mono font-bold text-[var(--accent)]">{chip.bang}</span>
                  <span className="text-[var(--foreground)]/60">{chip.name}</span>
                </span>))}
          </div>

          {search.customBangs.length > 0 && (<div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[10px] font-semibold text-[var(--foreground)]/60 uppercase tracking-wider font-mono">
                Your Custom Bangs ({search.customBangs.length})
              </span>
              <div className="flex flex-col gap-1.5">
                {search.customBangs.map((b) => (<div key={b.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--glass-border)]/30 bg-[var(--foreground)]/3">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={faviconUrl(b.domain, 32)} alt="" className="w-4 h-4 object-contain shrink-0" onError={(e) => {
                    (e.target as HTMLElement).style.opacity = "0.2";
                }}/>
                      <span className="font-mono font-bold text-xs text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded shrink-0">
                        {b.bang}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[var(--foreground)]/90 truncate">{b.name}</span>
                        <span className="text-[9px] font-mono text-[var(--foreground)]/45 truncate">{b.url}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => openEditBangModal(b)} aria-label={`Edit ${b.name}`} className="p-1.5 rounded-lg text-[var(--foreground)]/40 hover:text-[var(--accent)] cursor-pointer active:scale-90 transition-colors">
                        <Pencil className="w-3.5 h-3.5"/>
                      </button>
                      <button type="button" onClick={() => search.deleteCustomBang(b.id)} aria-label={`Delete ${b.name}`} className="p-1.5 rounded-lg text-[var(--foreground)]/40 hover:text-rose-400 cursor-pointer active:scale-90 transition-colors">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>))}
              </div>
            </div>)}

          <button type="button" onClick={openDirectoryModal} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--foreground)]/3 hover:bg-[var(--foreground)]/6 border border-[var(--glass-border)]/30 text-[11px] text-[var(--foreground)]/80 transition-all cursor-pointer group active:scale-[0.99] mt-0.5">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[var(--accent)]"/>
              <span className="font-medium">Browse All Shortcuts</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--accent)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              {activeBuiltInBangs.length + search.customBangs.length} available →
            </span>
          </button>
        </div>

        <div data-anchor="search-custom" className="flex flex-col gap-2.5 border-t border-[var(--divider)] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--foreground)]/80">Custom Engines</span>
            <button onClick={openAddEngineModal} disabled={search.customEngines.length >= CUSTOM_ENGINE_MAX} className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 disabled:opacity-40 rounded-lg transition-all cursor-pointer active:scale-95">
              <Plus className="w-3 h-3"/> Add Engine
            </button>
          </div>

          {search.customEngines.length === 0 ? (<div className="text-center py-4 rounded-xl border border-dashed border-[var(--glass-border)] text-xs text-[var(--foreground)]/40">
              No custom engines added yet.
            </div>) : (<div className="flex flex-col gap-1.5">
              {search.customEngines.map((engine, idx) => (<div key={engine.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--glass-border)]/30 bg-[var(--foreground)]/3">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={faviconUrl(engine.domain, 32)} alt="" className="w-4 h-4 object-contain shrink-0"/>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate">{engine.name}</span>
                      <span className="text-[9px] font-mono text-[var(--foreground)]/45 truncate">{engine.url}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => search.moveCustomEngine(idx, "up")} disabled={idx === 0} className="p-1 rounded text-[var(--foreground)]/40 hover:text-[var(--accent)] disabled:opacity-20 cursor-pointer active:scale-90">
                      <ArrowUp className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={() => search.moveCustomEngine(idx, "down")} disabled={idx === search.customEngines.length - 1} className="p-1 rounded text-[var(--foreground)]/40 hover:text-[var(--accent)] disabled:opacity-20 cursor-pointer active:scale-90">
                      <ArrowDown className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={() => openEditEngineModal(engine)} className="p-1 rounded text-[var(--foreground)]/40 hover:text-[var(--accent)] cursor-pointer active:scale-90">
                      <Pencil className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={() => search.deleteEngine(engine.id)} className="p-1 rounded text-[var(--foreground)]/40 hover:text-rose-400 cursor-pointer active:scale-90">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>))}
            </div>)}
        </div>
      </div>

      {isEditingBang && typeof document !== "undefined" && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl glass-input p-6 flex flex-col gap-4 animate-scale-up text-left relative">
            <button type="button" onClick={() => setIsEditingBang(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 cursor-pointer active:scale-90">
              <X className="w-4 h-4"/>
            </button>

            <h3 className="text-base font-semibold text-[var(--foreground)]">
              {editingBangId ? "Edit Custom Bang" : "Add Custom Bang"}
            </h3>

            <form onSubmit={handleSaveBang} className="flex flex-col gap-3.5">
              {bangError && (<div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  {bangError}
                </div>)}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase text-[var(--foreground)]/50">Shortcut Trigger</label>
                <input ref={bangTriggerInputRef} type="text" placeholder="e.g. !k or !jira" value={bangTriggerInput} onChange={(e) => setBangTriggerInput(e.target.value)} required maxLength={15} className="h-9 px-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"/>
                <span className="text-[9px] text-[var(--foreground)]/40">The shortcut to type in the search bar. Leading <code className="text-[var(--accent)]">!</code> is added automatically.</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase text-[var(--foreground)]/50">Site / Service Name</label>
                <input type="text" placeholder="e.g. Kagi Search" value={bangNameInput} onChange={(e) => setBangNameInput(e.target.value)} required maxLength={30} className="h-9 px-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"/>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase text-[var(--foreground)]/50">Search URL</label>
                <input type="text" placeholder="e.g. https://kagi.com/search?q=%s" value={bangUrlInput} onChange={(e) => setBangUrlInput(e.target.value)} required className="h-9 px-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"/>
                <span className="text-[9px] text-[var(--foreground)]/40">Use <code className="text-[var(--accent)] font-mono">%s</code> for the query placeholder.</span>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsEditingBang(false)} className="px-3.5 py-1.5 text-xs font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] cursor-pointer active:scale-95">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-[var(--accent)] text-black rounded-xl hover:shadow-md transition-all cursor-pointer font-bold active:scale-95">
                  Save Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>, document.body)}

      {isEditingEngine && typeof document !== "undefined" && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl glass-input p-6 flex flex-col gap-4 animate-scale-up text-left relative">
            <button type="button" onClick={() => setIsEditingEngine(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 cursor-pointer active:scale-90">
              <X className="w-4 h-4"/>
            </button>

            <h3 className="text-base font-semibold text-[var(--foreground)]">
              {editingEngineId ? "Edit Custom Engine" : "Add Custom Engine"}
            </h3>

            <form onSubmit={handleSaveEngine} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase text-[var(--foreground)]/50">Engine Name</label>
                <input ref={engineNameInputRef} type="text" placeholder="e.g. GitHub Code" value={engineNameInput} onChange={(e) => setEngineNameInput(e.target.value)} required maxLength={20} className="h-9 px-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"/>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase text-[var(--foreground)]/50">Search URL</label>
                <input type="text" placeholder="e.g. https://github.com/search?q=%s" value={engineUrlInput} onChange={(e) => setEngineUrlInput(e.target.value)} required className="h-9 px-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"/>
                <span className="text-[9px] text-[var(--foreground)]/40">Use <code className="text-[var(--accent)] font-mono">%s</code> for query placeholder.</span>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsEditingEngine(false)} className="px-3.5 py-1.5 text-xs font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] cursor-pointer active:scale-95">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-[var(--accent)] text-black rounded-xl hover:shadow-md transition-all cursor-pointer font-bold active:scale-95">
                  Save Engine
                </button>
              </div>
            </form>
          </div>
        </div>, document.body)}

      {isViewingDirectory && typeof document !== "undefined" && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in" onClick={(e) => {
                if (e.target === e.currentTarget)
                    setIsViewingDirectory(false);
            }}>
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl glass-input p-6 flex flex-col gap-4 animate-scale-up text-left relative shadow-2xl overflow-hidden border border-[var(--glass-border)]" role="dialog" aria-modal="true" aria-label="Search Bang Shortcuts Directory">

            <div className="flex items-start justify-between gap-4 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)] tracking-tight">
                  Search Bang Shortcuts
                </h3>
                <p className="text-xs text-[var(--foreground)]/60 mt-0.5">
                  Type a bang trigger in search to route directly to any site, or enter the bang alone to jump straight there.
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {search.deletedBangs.length > 0 && (<button type="button" onClick={search.restoreDefaultBangs} className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer active:scale-95 mr-1">
                    Restore Defaults
                  </button>)}
                <button type="button" onClick={() => {
                setIsViewingDirectory(false);
                openAddBangModal();
            }} disabled={search.customBangs.length >= CUSTOM_BANGS_MAX} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 disabled:opacity-40 rounded-lg transition-all cursor-pointer active:scale-95 mr-1">
                  <Plus className="w-3.5 h-3.5"/> Add Bang
                </button>
                <button type="button" onClick={() => setIsViewingDirectory(false)} aria-label="Close shortcuts directory" className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 cursor-pointer active:scale-90 transition-all">
                  <X className="w-4 h-4"/>
                </button>
              </div>
            </div>

            <div className="relative shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 pointer-events-none"/>
              <input ref={directoryFilterInputRef} type="text" value={directoryFilter} onChange={(e) => setDirectoryFilter(e.target.value)} placeholder="Filter by name, bang (e.g. !yt), or domain..." className="w-full h-10 pl-9 pr-8 rounded-xl bg-[var(--foreground)]/4 hover:bg-[var(--foreground)]/6 border border-[var(--glass-border)] text-xs text-[var(--foreground)] placeholder:text-[var(--foreground)]/35 focus:outline-none focus:border-[var(--accent)] transition-all font-sans"/>
              {directoryFilter && (<button type="button" onClick={() => {
                    setDirectoryFilter("");
                    directoryFilterInputRef.current?.focus();
                }} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--foreground)]/40 hover:text-[var(--foreground)] cursor-pointer">
                  <X className="w-3.5 h-3.5"/>
                </button>)}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 -mr-1 custom-scrollbar">

              {filteredCustomBangs.length > 0 && (<div className="space-y-2">
                  <span className="text-[10px] font-semibold text-[var(--foreground)]/60 uppercase tracking-wider font-mono">
                    Your Custom Bangs ({filteredCustomBangs.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredCustomBangs.map((b) => (<div key={b.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--foreground)]/4 hover:bg-[var(--foreground)]/7 transition-colors group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={faviconUrl(b.domain, 32)} alt="" className="w-4 h-4 object-contain shrink-0" onError={(e) => {
                        (e.target as HTMLElement).style.opacity = "0.2";
                    }}/>
                          <span className="font-mono font-bold text-xs text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded shrink-0">
                            {b.bang}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[var(--foreground)]/90 truncate">{b.name}</span>
                            <span className="text-[10px] font-mono text-[var(--foreground)]/40 truncate">{b.domain || b.url}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button type="button" onClick={() => {
                        setIsViewingDirectory(false);
                        openEditBangModal(b);
                    }} title={`Edit ${b.name}`} className="p-1.5 rounded-lg text-[var(--foreground)]/40 hover:text-[var(--accent)] cursor-pointer active:scale-90 transition-colors">
                            <Pencil className="w-3.5 h-3.5"/>
                          </button>
                          <button type="button" onClick={() => search.deleteCustomBang(b.id)} title={`Delete ${b.name}`} className="p-1.5 rounded-lg text-[var(--foreground)]/40 hover:text-rose-400 cursor-pointer active:scale-90 transition-colors">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </div>))}
                  </div>
                </div>)}

              {filteredBuiltInBangs.length > 0 && (<div className="space-y-2">
                  <span className="text-[10px] font-semibold text-[var(--foreground)]/60 uppercase tracking-wider font-mono">
                    Built-in Shortcuts ({filteredBuiltInBangs.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredBuiltInBangs.map((b) => (<div key={b.bang} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--foreground)]/4 hover:bg-[var(--foreground)]/7 transition-colors group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={faviconUrl(b.domain, 32)} alt="" className="w-4 h-4 object-contain shrink-0" onError={(e) => {
                        (e.target as HTMLElement).style.opacity = "0.2";
                    }}/>
                          <span className="font-mono font-bold text-xs text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded shrink-0">
                            {b.bang}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-semibold text-[var(--foreground)]/90 truncate">{b.name}</span>
                              {b.aliases.length > 0 && (<span className="text-[10px] font-mono text-[var(--foreground)]/35 shrink-0 hidden sm:inline">
                                  ({b.aliases.join(", ")})
                                </span>)}
                            </div>
                            <span className="text-[10px] font-mono text-[var(--foreground)]/40 truncate">{b.domain}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button type="button" onClick={() => search.deleteDefaultBang(b.bang, b.aliases)} title={`Delete ${b.name} shortcut`} className="p-1.5 rounded-lg text-[var(--foreground)]/40 hover:text-rose-400 cursor-pointer active:scale-90 transition-colors">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </div>))}
                  </div>
                </div>)}

              {filteredCustomBangs.length === 0 && filteredBuiltInBangs.length === 0 && (<div className="text-center py-10 rounded-xl text-xs text-[var(--foreground)]/40">
                  No shortcuts found matching &ldquo;{directoryFilter}&rdquo;.
                </div>)}
            </div>

            <div className="pt-3 border-t border-[var(--divider)] flex items-center justify-between text-[11px] text-[var(--foreground)]/50 shrink-0">
              <span>
                Showing {filteredCustomBangs.length + filteredBuiltInBangs.length} shortcut
                {filteredCustomBangs.length + filteredBuiltInBangs.length === 1 ? "" : "s"}
              </span>
              <button type="button" onClick={() => setIsViewingDirectory(false)} className="px-3.5 py-1.5 rounded-lg bg-[var(--foreground)]/6 hover:bg-[var(--foreground)]/10 text-xs font-medium text-[var(--foreground)]/80 cursor-pointer active:scale-95 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>, document.body)}
    </>);
}
