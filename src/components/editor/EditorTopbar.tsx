"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EditorTopbarProps {
  onExport?: () => void;
  onAIGenerate?: () => void;
}

export default function EditorTopbar({ onExport, onAIGenerate }: EditorTopbarProps) {
  const pathname = usePathname();
  const { projectName, setProjectName, zoom, setZoom, undo, redo, historyIndex, history } = useEditorStore();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleNameSubmit = () => {
    setProjectName(nameValue || "Untitled Figure");
    setEditingName(false);
  };

  const zoomPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <header className="h-12 bg-[#0F1629] border-b border-white/10 flex items-center px-3 gap-2 flex-shrink-0 z-20">
      {/* Logo + app nav */}
      <Link href="/ai-figure-studio" className="flex items-center gap-1.5 mr-1 flex-shrink-0" title="AnyFigure">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4" stroke="white" strokeWidth="1.5"/>
            <path d="M6 4v4M4 6h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </Link>

      <div className="hidden lg:flex items-center gap-0.5 mr-1">
        {[
          { href: "/ai-figure-studio", label: "AI Figure Studio" },
          { href: "/workspace", label: "Workspace" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-2 py-1 rounded text-[11px] font-medium transition-colors",
              pathname === link.href ? "text-white bg-white/10" : "text-zinc-500 hover:text-zinc-200"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Project Name */}
      {editingName ? (
        <input
          autoFocus
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={(e) => { if (e.key === "Enter") handleNameSubmit(); if (e.key === "Escape") setEditingName(false); }}
          className="bg-white/10 text-white text-sm font-medium px-2 py-1 rounded outline-none border border-indigo-500 min-w-[140px] max-w-[220px]"
        />
      ) : (
        <button
          onClick={() => { setEditingName(true); setNameValue(projectName); }}
          className="text-white text-sm font-medium hover:bg-white/5 px-2 py-1 rounded transition-colors max-w-[200px] truncate"
        >
          {projectName}
        </button>
      )}

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Undo / Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (⌘Z)"
        className={cn(
          "p-1.5 rounded hover:bg-white/10 transition-colors",
          canUndo ? "text-zinc-300" : "text-zinc-600 cursor-not-allowed"
        )}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M4 5H9.5a3.5 3.5 0 010 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M6.5 2.5L4 5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (⌘⇧Z)"
        className={cn(
          "p-1.5 rounded hover:bg-white/10 transition-colors",
          canRedo ? "text-zinc-300" : "text-zinc-600 cursor-not-allowed"
        )}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M11 5H5.5a3.5 3.5 0 000 7H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8.5 2.5L11 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="p-1.5 rounded hover:bg-white/10 text-zinc-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <select
          value={zoomPresets.includes(Math.round(zoom * 100) / 100) ? zoom : "custom"}
          onChange={(e) => { if (e.target.value !== "custom") setZoom(parseFloat(e.target.value)); }}
          className="bg-white/5 text-white text-xs rounded px-1 py-1 border border-white/10 outline-none cursor-pointer hover:bg-white/10"
          style={{ width: 60 }}
        >
          {zoomPresets.map((z) => (
            <option key={z} value={z} className="bg-[#0F1629]">
              {Math.round(z * 100)}%
            </option>
          ))}
          <option value="custom" className="bg-[#0F1629]">{Math.round(zoom * 100)}%</option>
        </select>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="p-1.5 rounded hover:bg-white/10 text-zinc-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1" />

      {/* Right Actions */}
      <button
        onClick={onAIGenerate}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-500/20"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1L8 5H12L8.75 7.5L10 11.5L6.5 9L3 11.5L4.25 7.5L1 5H5L6.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
        AI Generate
      </button>

      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/15 hover:bg-white/5 text-zinc-300 text-xs font-medium transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2 9v2h9V9M6.5 1v7M4 5l2.5-2.5L9 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Share
      </button>

      <button
        onClick={onExport}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2 9v2h9V9M6.5 2v7M4 7l2.5 2.5L9 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Export
      </button>
    </header>
  );
}
