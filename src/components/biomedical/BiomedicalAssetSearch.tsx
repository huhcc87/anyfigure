"use client";

import { Search } from "lucide-react";

interface BiomedicalAssetSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export default function BiomedicalAssetSearch({ value, onChange, resultCount }: BiomedicalAssetSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search 150+ assets…"
        className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-indigo-500 placeholder:text-zinc-600"
      />
      <p className="text-[10px] text-zinc-600 mt-1.5">{resultCount} assets</p>
    </div>
  );
}
