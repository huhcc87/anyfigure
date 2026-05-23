"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { BiomedicalCategory } from "@/types";

const categories: { id: BiomedicalCategory; label: string; color: string }[] = [
  { id: "dna-rna", label: "DNA / RNA", color: "#06B6D4" },
  { id: "proteins", label: "Proteins", color: "#8B5CF6" },
  { id: "cells", label: "Cells", color: "#10B981" },
  { id: "bacteria", label: "Bacteria", color: "#F59E0B" },
  { id: "immune-cells", label: "Immune Cells", color: "#6366F1" },
  { id: "tumor-cells", label: "Tumor Cells", color: "#EF4444" },
  { id: "organs", label: "Organs", color: "#EC4899" },
  { id: "crispr", label: "CRISPR", color: "#14B8A6" },
  { id: "sequencing", label: "Sequencing", color: "#F97316" },
  { id: "pathways", label: "Pathways", color: "#A855F7" },
  { id: "microbiome", label: "Microbiome", color: "#84CC16" },
  { id: "lab-equipment", label: "Lab Equipment", color: "#64748B" },
];

const assetsByCategory: Record<BiomedicalCategory, { id: string; name: string; symbol: string }[]> = {
  "dna-rna": [
    { id: "dna-helix", name: "DNA Helix", symbol: "🧬" },
    { id: "mrna-strand", name: "mRNA Strand", symbol: "〰️" },
    { id: "ribosome", name: "Ribosome", symbol: "⭕" },
    { id: "trna", name: "tRNA", symbol: "↺" },
    { id: "dna-damage", name: "DNA Damage", symbol: "✂️" },
    { id: "nucleosome", name: "Nucleosome", symbol: "🔵" },
  ],
  proteins: [
    { id: "antibody", name: "Antibody", symbol: "Y" },
    { id: "receptor", name: "Receptor", symbol: "⊢" },
    { id: "enzyme", name: "Enzyme", symbol: "◇" },
    { id: "kinase", name: "Kinase", symbol: "⚡" },
    { id: "transcription-factor", name: "TF", symbol: "★" },
    { id: "cytokine", name: "Cytokine", symbol: "✦" },
  ],
  cells: [
    { id: "t-cell", name: "T Cell", symbol: "🔵" },
    { id: "b-cell", name: "B Cell", symbol: "🟣" },
    { id: "macrophage", name: "Macrophage", symbol: "🟤" },
    { id: "cancer-cell", name: "Cancer Cell", symbol: "🔴" },
    { id: "stem-cell", name: "Stem Cell", symbol: "⭐" },
    { id: "neuron", name: "Neuron", symbol: "🌟" },
  ],
  bacteria: [
    { id: "ecoli", name: "E. coli", symbol: "🦠" },
    { id: "streptococcus", name: "Streptococcus", symbol: "⚪" },
    { id: "lactobacillus", name: "Lactobacillus", symbol: "🟡" },
    { id: "bacteroides", name: "Bacteroides", symbol: "🟢" },
  ],
  "immune-cells": [
    { id: "nk-cell", name: "NK Cell", symbol: "⬡" },
    { id: "dendritic-cell", name: "Dendritic Cell", symbol: "✴" },
    { id: "neutrophil", name: "Neutrophil", symbol: "◎" },
    { id: "monocyte", name: "Monocyte", symbol: "●" },
  ],
  "tumor-cells": [
    { id: "tumor-mass", name: "Tumor Mass", symbol: "🔴" },
    { id: "cancer-stem-cell", name: "CSC", symbol: "⭐" },
    { id: "metastatic-cell", name: "Metastatic Cell", symbol: "💢" },
    { id: "tumor-microenv", name: "TME", symbol: "🌐" },
  ],
  organs: [
    { id: "lung", name: "Lung", symbol: "🫁" },
    { id: "liver", name: "Liver", symbol: "🫀" },
    { id: "kidney", name: "Kidney", symbol: "⬩" },
    { id: "brain", name: "Brain", symbol: "🧠" },
    { id: "colon", name: "Colon", symbol: "⊃" },
  ],
  crispr: [
    { id: "cas9", name: "Cas9", symbol: "✂" },
    { id: "guide-rna", name: "Guide RNA", symbol: "→" },
    { id: "cas9-complex", name: "Cas9 Complex", symbol: "⚙" },
    { id: "dna-cut", name: "DNA Cut", symbol: "✂️" },
  ],
  sequencing: [
    { id: "illumina-read", name: "Illumina Read", symbol: "≡" },
    { id: "nanopore", name: "Nanopore", symbol: "○" },
    { id: "pcr-chip", name: "PCR Chip", symbol: "▦" },
    { id: "gel", name: "Gel", symbol: "▥" },
  ],
  pathways: [
    { id: "pi3k-akt", name: "PI3K/AKT", symbol: "→" },
    { id: "mapk", name: "MAPK/ERK", symbol: "⟹" },
    { id: "jak-stat", name: "JAK-STAT", symbol: "⇒" },
    { id: "wnt", name: "Wnt/β-cat", symbol: "⟶" },
  ],
  microbiome: [
    { id: "gut-flora", name: "Gut Flora", symbol: "🦠" },
    { id: "microbiome-diversity", name: "Diversity", symbol: "◉" },
    { id: "metabolite", name: "Metabolite", symbol: "◈" },
    { id: "biofilm", name: "Biofilm", symbol: "∿" },
  ],
  "lab-equipment": [
    { id: "microscope", name: "Microscope", symbol: "🔬" },
    { id: "pipette", name: "Pipette", symbol: "⬇" },
    { id: "flask", name: "Flask", symbol: "⧫" },
    { id: "pcr-machine", name: "PCR Machine", symbol: "▧" },
    { id: "flow-cytometer", name: "Flow Cytometer", symbol: "◫" },
  ],
};

interface AssetLibraryProps {
  onInsert?: (assetId: string, name: string) => void;
}

export default function AssetLibrary({ onInsert }: AssetLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<BiomedicalCategory>("cells");
  const [search, setSearch] = useState("");

  const assets = assetsByCategory[activeCategory] || [];
  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 h-full bg-[#0C1120] border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
          Biomedical Assets
        </h3>
        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2.5 py-2 outline-none focus:border-indigo-500 placeholder:text-zinc-600"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap p-2 border-b border-white/10 max-h-28 overflow-y-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0",
              activeCategory === cat.id
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300 bg-white/5 hover:bg-white/10"
            )}
            style={
              activeCategory === cat.id
                ? { backgroundColor: cat.color + "25", color: cat.color, border: `1px solid ${cat.color}50` }
                : {}
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map((asset) => {
            const cat = categories.find((c) => c.id === activeCategory);
            return (
              <button
                key={asset.id}
                onClick={() => onInsert?.(asset.id, asset.name)}
                className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 transition-all group border border-transparent hover:border-white/10"
                title={asset.name}
              >
                <span className="text-xl leading-none">{asset.symbol}</span>
                <span
                  className="text-[9px] font-medium text-zinc-600 group-hover:text-zinc-400 truncate w-full text-center px-0.5 transition-colors"
                >
                  {asset.name}
                </span>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-xs text-zinc-600">
            No assets found for &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
