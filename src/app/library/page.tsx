"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import AppSidebar from "@/components/layout/AppSidebar";

interface Folder {
  id: string;
  name: string;
  isFavorites?: boolean;
  count: number;
  updatedAt: string;
}

const FOLDERS_KEY = "anyfigure_library_folders";

function loadFolders(): Folder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) {
      return [{ id: "favorites", name: "Favorites", isFavorites: true, count: 0, updatedAt: new Date().toISOString() }];
    }
    return JSON.parse(raw) as Folder[];
  } catch {
    return [];
  }
}

function saveFolders(folders: Folder[]) {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch {
    /* ignore quota */
  }
}

export default function LibraryPage() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    startTransition(() => {
      setFolders(loadFolders());
    });
  }, []);

  const handleCreateFolder = () => {
    const name = window.prompt("Folder name?");
    if (!name?.trim()) return;
    const next: Folder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      count: 0,
      updatedAt: new Date().toISOString(),
    };
    const updated = [...folders, next];
    setFolders(updated);
    saveFolders(updated);
    toast.success(`Created folder "${next.name}"`);
  };

  const handleDelete = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    if (folder?.isFavorites) return;
    if (!window.confirm(`Delete folder "${folder?.name}"?`)) return;
    const updated = folders.filter((f) => f.id !== id);
    setFolders(updated);
    saveFolders(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />

      <div className="max-w-6xl mx-auto px-6 py-8 md:pl-24">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 mb-3"
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 3L3 6l4 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Library</h1>
          <p className="text-sm text-slate-500 mt-1">Organize and curate your figures into folders.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* New folder card */}
          <button
            type="button"
            onClick={handleCreateFolder}
            className="aspect-[5/4] rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold">New folder</span>
          </button>

          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} onDelete={() => handleDelete(folder.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FolderCard({ folder, onDelete }: { folder: Folder; onDelete: () => void }) {
  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all">
      <div className="p-4 pb-3">
        {folder.isFavorites && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-semibold mb-2">
            <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5 4.5 4z" />
            </svg>
            Favorites
          </div>
        )}
        <div className="aspect-[4/3] rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm font-semibold text-slate-900">{folder.name}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{folder.count} figures · updated recently</p>
      </div>
      {!folder.isFavorites && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete folder"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
