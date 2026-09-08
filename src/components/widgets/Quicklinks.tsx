"use client";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Pencil, X, Trash2 } from "lucide-react";
import { type Quicklink } from "@/utils/quicklinks";
import { useQuicklinksManager } from "@/utils/useQuicklinksManager";
import type { QuicklinksShape } from "@/utils/settingsSchema";
import Favicon from "@/components/shared/Favicon";
function getItemShapeClass(shape: QuicklinksShape): string {
    switch (shape) {
        case "sharp":
            return "rounded-[6px]";
        case "rounded":
            return "rounded-xl";
        case "pill":
        default:
            return "rounded-full";
    }
}
function getDockShapeClass(shape: QuicklinksShape): string {
    switch (shape) {
        case "sharp":
            return "rounded-xl";
        case "rounded":
            return "rounded-2xl";
        case "pill":
        default:
            return "rounded-full";
    }
}
export default function Quicklinks() {
    const [mounted, setMounted] = useState(false);
    const { showQuicklinks, quicklinksStyle = "pills", quicklinksShape = "pill", showKeycaps = true, showLabels, showAddButton, quicklinks: links, addOrEditLink, deleteLink, saveLinks, } = useQuicklinksManager();
    const linksRef = useRef<Quicklink[]>(links);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const draggedIndexRef = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragOverIndexRef = useRef<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<Quicklink | null>(null);
    const [nameInput, setNameInput] = useState("");
    const [urlInput, setUrlInput] = useState("");
    const [iconTypeInput, setIconTypeInput] = useState<"auto" | "emoji" | "text">("auto");
    const [customIconInput, setCustomIconInput] = useState("");
    const [modalError, setModalError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        linksRef.current = links;
    }, [links]);
    useEffect(() => {
        setMounted(true);
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            const isInput = activeEl?.tagName === "INPUT" ||
                activeEl?.tagName === "TEXTAREA" ||
                activeEl?.getAttribute("contenteditable") === "true";
            if (isInput || e.ctrlKey || e.metaKey || e.altKey)
                return;
            const num = parseInt(e.key, 10);
            if (!isNaN(num) && num >= 1 && num <= 9) {
                const linkIndex = num - 1;
                const currentLinks = linksRef.current;
                if (currentLinks[linkIndex]) {
                    e.preventDefault();
                    window.location.href = currentLinks[linkIndex].url;
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    const openAddModal = () => {
        setEditingLink(null);
        setNameInput("");
        setUrlInput("");
        setIconTypeInput("auto");
        setCustomIconInput("");
        setModalError(null);
        setIsModalOpen(true);
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };
    const openEditModal = (link: Quicklink) => {
        setEditingLink(link);
        setNameInput(link.title);
        setUrlInput(link.url);
        setIconTypeInput(link.iconType || "auto");
        setCustomIconInput(link.customIcon || "");
        setModalError(null);
        setIsModalOpen(true);
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLink(null);
        setNameInput("");
        setUrlInput("");
        setIconTypeInput("auto");
        setCustomIconInput("");
        setModalError(null);
    };
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                closeModal();
            }
        };
        if (isModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameInput.trim() || !urlInput.trim())
            return;
        const success = addOrEditLink(nameInput.trim(), urlInput.trim(), iconTypeInput, customIconInput.trim(), editingLink?.id);
        if (!success) {
            setModalError("Maximum limit of 12 shortcuts reached.");
            return;
        }
        closeModal();
    };
    const handleDelete = () => {
        if (!editingLink)
            return;
        deleteLink(editingLink.id);
        closeModal();
    };
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        draggedIndexRef.current = index;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
    };
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndexRef.current === null || draggedIndexRef.current === index)
            return;
        if (dragOverIndexRef.current === index)
            return;
        setDragOverIndex(index);
        dragOverIndexRef.current = index;
    };
    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        draggedIndexRef.current = null;
        dragOverIndexRef.current = null;
    };
    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const sourceIndex = draggedIndexRef.current;
        if (sourceIndex === null || sourceIndex === index)
            return;
        const reordered = [...links];
        const [draggedItem] = reordered.splice(sourceIndex, 1);
        reordered.splice(index, 0, draggedItem);
        saveLinks(reordered);
        setDraggedIndex(null);
        setDragOverIndex(null);
        draggedIndexRef.current = null;
        dragOverIndexRef.current = null;
    };
    if (!mounted || !showQuicklinks)
        return null;
    const itemShape = getItemShapeClass(quicklinksShape);
    const dockShape = getDockShapeClass(quicklinksShape);
    const renderModal = () => {
        if (!isModalOpen || !mounted || typeof document === "undefined")
            return null;
        return createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
        <div ref={modalRef} className="w-full max-w-sm max-h-[85dvh] overflow-y-auto rounded-2xl glass-input p-6 flex flex-col gap-4 animate-liquid-pop text-left relative shadow-2xl mb-[env(safe-area-inset-bottom)]">
          <button type="button" onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 cursor-pointer transition-all duration-200">
            <X className="w-4 h-4"/>
          </button>

          <h3 className="text-base font-semibold text-[var(--foreground)]">
            {editingLink ? "Edit Shortcut" : "Add Shortcut"}
          </h3>

          {modalError && (<div className="p-3 text-xs text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20">
              {modalError}
            </div>)}

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                Name
              </label>
              <input ref={nameInputRef} type="text" placeholder="e.g. GitHub" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required maxLength={20} className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"/>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                URL
              </label>
              <input type="text" placeholder="e.g. https://github.com" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} required className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"/>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                Icon Style
              </label>
              <div className="flex gap-1.5 bg-[var(--foreground)]/5 p-1 rounded-lg border border-[var(--glass-border)]">
                <button type="button" onClick={() => setIconTypeInput("auto")} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 cursor-pointer ${iconTypeInput === "auto"
                ? "bg-[var(--accent)] text-[var(--background)] font-semibold shadow-sm"
                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}>
                  Auto Favicon
                </button>
                <button type="button" onClick={() => setIconTypeInput("emoji")} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 cursor-pointer ${iconTypeInput === "emoji"
                ? "bg-[var(--accent)] text-[var(--background)] font-semibold shadow-sm"
                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}>
                  Emoji
                </button>
                <button type="button" onClick={() => setIconTypeInput("text")} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 cursor-pointer ${iconTypeInput === "text"
                ? "bg-[var(--accent)] text-[var(--background)] font-semibold shadow-sm"
                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}>
                  Badge
                </button>
              </div>
            </div>

            {iconTypeInput !== "auto" && (<div className="flex flex-col gap-1.5 animate-liquid-drop">
                <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                  {iconTypeInput === "emoji" ? "Emoji Icon" : "Badge Text (1-2 chars)"}
                </label>
                <input type="text" placeholder={iconTypeInput === "emoji" ? "e.g. 🚀 or 💻" : "e.g. GH"} value={customIconInput} onChange={(e) => setCustomIconInput(e.target.value)} maxLength={iconTypeInput === "emoji" ? 4 : 2} className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"/>
              </div>)}

            <div className="flex items-center justify-between gap-3 mt-2">
              {editingLink ? (<button type="button" onClick={handleDelete} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5"/>
                  Delete
                </button>) : (<div />)}

              <div className="flex gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--foreground)]/5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 rounded-xl hover:shadow-[0_0_14px_var(--accent-glow)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 cursor-pointer">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>, document.body);
    };
    if (quicklinksStyle === "dock") {
        return (<div className="w-full flex items-center justify-center py-2 select-none animate-fade-in-up">
        <div className={`inline-flex flex-wrap items-center justify-center gap-2 p-1.5 sm:p-2 bg-[var(--glass-bg)]/85 backdrop-blur-2xl border border-[var(--glass-border)] shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-full ${dockShape}`}>
          {links.map((link, index) => {
                const isDragging = index === draggedIndex;
                const isOver = index === dragOverIndex;
                return (<div key={link.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} onDrop={(e) => handleDrop(e, index)} className="relative group shrink-0">
                <a href={link.url} className={`w-11 h-11 flex items-center justify-center relative transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-hover:scale-115 group-hover:-translate-y-1 active:scale-95 cursor-pointer ${itemShape} ${isDragging ? "opacity-35 scale-90" : "opacity-100"} ${isOver
                        ? "bg-[var(--accent)]/25 border border-[var(--accent)] shadow-[0_0_16px_var(--accent-glow)]"
                        : "bg-[var(--foreground)]/6 border border-[var(--glass-border)] shadow-[var(--glass-inset-shadow)] hover:bg-[var(--glass-bg)] hover:border-[var(--glass-border-focus)] hover:shadow-[0_8px_24px_var(--accent-glow),var(--glass-inset-shadow)]"}`}>
                  <Favicon link={link} size="sm"/>

                  <div className="absolute -bottom-1 w-5 h-1 rounded-full bg-[var(--accent)]/0 group-hover:bg-[var(--accent)]/70 blur-[3px] transition-all duration-300 pointer-events-none"/>
                </a>

                <button type="button" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditModal(link);
                    }} className="sm:hidden absolute -top-1 -right-1 p-1 rounded-full bg-[var(--background)] border border-[var(--glass-border)] text-[var(--foreground)]/45 active:text-[var(--accent)] cursor-pointer shadow-xs" aria-label={`Edit ${link.title}`}>
                  <Pencil className="w-2.5 h-2.5"/>
                </button>

                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 translate-y-1 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-30 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--background)]/90 backdrop-blur-md border border-[var(--glass-border)] shadow-[0_8px_20px_rgba(0,0,0,0.35)] whitespace-nowrap">
                  <span className="text-[11px] font-medium text-[var(--foreground)]">{link.title}</span>
                  {showKeycaps && index < 9 && (<span className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/10 text-[9px] font-mono font-medium text-[var(--accent)]">
                      {index + 1}
                    </span>)}
                  <button type="button" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditModal(link);
                    }} className="p-0.5 text-[var(--foreground)]/40 hover:text-[var(--accent)] rounded cursor-pointer transition-colors" title="Edit shortcut">
                    <Pencil className="w-2.5 h-2.5"/>
                  </button>
                </div>
              </div>);
            })}

          {showAddButton && links.length < 12 && (<button type="button" onClick={openAddModal} title="Add Link" className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-dashed border-[var(--glass-border)]/50 text-[var(--foreground)]/40 hover:text-[var(--accent)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/10 hover:scale-115 active:scale-95 transition-all duration-250 cursor-pointer ${itemShape}`}>
              <Plus className="w-4 h-4"/>
            </button>)}
        </div>
        {renderModal()}
      </div>);
    }
    if (quicklinksStyle === "grid") {
        return (<div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-5 py-2 select-none animate-fade-in-up">
        {links.map((link, index) => {
                const isDragging = index === draggedIndex;
                const isOver = index === dragOverIndex;
                return (<a key={link.id} href={link.url} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} onDrop={(e) => handleDrop(e, index)} className={`group flex flex-col items-center select-none w-16 sm:w-20 cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDragging ? "opacity-35 scale-90" : "opacity-100"}`}>

              <div className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center relative transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 active:scale-95 ${itemShape} ${isOver
                        ? "bg-[var(--accent)]/20 border border-[var(--accent)] shadow-[0_0_18px_var(--accent-glow)] scale-110"
                        : "bg-[var(--glass-bg)]/85 backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--glass-inset-shadow),0_4px_16px_rgba(0,0,0,0.35)] group-hover:bg-[var(--glass-bg-dropdown)] group-hover:border-[var(--glass-border-focus)] group-hover:shadow-[0_0_20px_var(--accent-glow),var(--glass-inset-shadow)]"}`}>
                <Favicon link={link} size="md"/>

                {showKeycaps && index < 9 && (<span className="absolute -bottom-1 -left-1 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 px-1.5 py-0.2 rounded-full bg-[var(--background)] border border-[var(--glass-border)] text-[9px] font-mono font-medium text-[var(--foreground)]/60 pointer-events-none shadow-xs">
                    {index + 1}
                  </span>)}

                <button type="button" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditModal(link);
                    }} className="absolute -top-1 -right-1 opacity-100 sm:opacity-0 sm:scale-75 sm:group-hover:opacity-100 sm:group-hover:scale-100 transition-all duration-200 p-1 rounded-full bg-[var(--background)] border border-[var(--glass-border)] text-[var(--foreground)]/45 hover:text-[var(--accent)] cursor-pointer shadow-xs" title="Edit shortcut">
                  <Pencil className="w-2.5 h-2.5"/>
                </button>
              </div>

              {showLabels && (<span className="mt-2 text-xs font-normal tracking-wide text-[var(--foreground)]/75 group-hover:text-[var(--foreground)] text-center truncate max-w-full px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transition-colors duration-200">
                  {link.title}
                </span>)}
            </a>);
            })}

        {showAddButton && links.length < 12 && (<button type="button" onClick={openAddModal} className="group flex flex-col items-center select-none w-16 sm:w-20 cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-dashed border-[var(--glass-border)] group-hover:border-[var(--accent)]/50 bg-[var(--glass-bg)]/60 backdrop-blur-md text-[var(--foreground)]/45 group-hover:bg-[var(--glass-bg)] group-hover:text-[var(--accent)] group-hover:shadow-[0_0_16px_var(--accent-glow)] group-hover:scale-110 active:scale-95 transition-all duration-250 ${itemShape}`}>
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"/>
            </div>
            {showLabels && (<span className="mt-2 text-xs font-normal tracking-wide text-[var(--foreground)]/45 group-hover:text-[var(--accent)] text-center transition-colors duration-200">
                Add Link
              </span>)}
          </button>)}
        {renderModal()}
      </div>);
    }
    return (<div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 py-2 select-none animate-fade-in-up">
      {links.map((link, index) => {
            const isDragging = index === draggedIndex;
            const isOver = index === dragOverIndex;
            return (<a key={link.id} href={link.url} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} onDrop={(e) => handleDrop(e, index)} className={`group relative flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 select-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${itemShape} ${isDragging ? "opacity-35 scale-95" : "opacity-100"} ${isOver
                    ? "bg-[var(--accent)]/20 border border-[var(--accent)] shadow-[0_0_18px_var(--accent-glow)] scale-105"
                    : "bg-[var(--glass-bg)]/80 backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--glass-inset-shadow),0_2px_12px_rgba(0,0,0,0.25)] hover:border-[var(--glass-border-focus)] hover:bg-[var(--glass-bg-dropdown)] hover:shadow-[0_0_18px_var(--accent-glow),var(--glass-inset-shadow)] hover:scale-[1.02]"}`}>
            <div className="shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Favicon link={link} size="sm"/>
            </div>

            {showLabels && (<span className="text-xs font-medium tracking-tight text-[var(--foreground)]/80 group-hover:text-[var(--foreground)] truncate max-w-[96px] sm:max-w-[130px] transition-colors duration-200">
                {link.title}
              </span>)}

            {showKeycaps && index < 9 && (<span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded bg-[var(--foreground)]/8 border border-[var(--glass-border)]/60 text-[9px] font-mono font-medium text-[var(--foreground)]/50 group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/30 transition-colors select-none pointer-events-none">
                {index + 1}
              </span>)}

            <button type="button" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openEditModal(link);
                }} className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 hover:text-[var(--accent)] text-[var(--foreground)]/40 p-1.5 sm:p-0.5 rounded transition-all duration-200 cursor-pointer" title="Edit shortcut">
              <Pencil className="w-2.5 h-2.5"/>
            </button>
          </a>);
        })}

      {showAddButton && links.length < 12 && (<button type="button" onClick={openAddModal} className={`group flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 select-none border border-dashed border-[var(--glass-border)] bg-[var(--glass-bg)]/60 backdrop-blur-md hover:border-[var(--accent)]/60 text-[var(--foreground)]/45 hover:text-[var(--accent)] hover:bg-[var(--glass-bg)] hover:shadow-[0_0_14px_var(--accent-glow)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-95 cursor-pointer ${itemShape}`}>
          <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"/>
          {showLabels && <span className="text-xs font-medium">Add Link</span>}
        </button>)}

      {renderModal()}
    </div>);
}
