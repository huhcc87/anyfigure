"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TemplateCard, { type TemplateCardData } from "@/components/templates/TemplateCard";

const allTemplates: TemplateCardData[] = [
  {
    id: "crispr-workflow",
    name: "CRISPR Editing Workflow",
    description: "Complete CRISPR-Cas9 gene editing workflow from guide RNA design through validation with T7E1 assay and functional readouts.",
    category: "Genomics",
    tags: ["CRISPR", "Cas9", "Gene Editing", "Genomics"],
    gradient: "linear-gradient(135deg, #0D9488 0%, #0891B2 100%)",
    panels: 4,
    popular: true,
  },
  {
    id: "rnaseq-pipeline",
    name: "RNA-seq Analysis Pipeline",
    description: "End-to-end transcriptomic analysis pipeline: quality control, alignment, differential expression, and pathway enrichment visualization.",
    category: "Genomics",
    tags: ["RNA-seq", "Transcriptomics", "DEG", "Volcano Plot"],
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
    panels: 6,
    popular: true,
    new: false,
  },
  {
    id: "tumor-microenvironment",
    name: "Tumor Microenvironment",
    description: "Comprehensive illustration of the tumor immune microenvironment with immune cell types, checkpoint molecules, and spatial organization.",
    category: "Oncology",
    tags: ["TME", "Immunosuppression", "T cells", "Cancer"],
    gradient: "linear-gradient(135deg, #DC2626 0%, #EA580C 100%)",
    panels: 4,
    popular: true,
  },
  {
    id: "microbiome-interaction",
    name: "Microbiome Interaction",
    description: "Gut microbiome composition analysis showing dysbiosis patterns, metabolite production pathways, and host-microbe interactions.",
    category: "Microbiology",
    tags: ["Microbiome", "Gut", "Dysbiosis", "Metabolites"],
    gradient: "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
    panels: 3,
  },
  {
    id: "immunotherapy-pathway",
    name: "Immunotherapy Pathway",
    description: "CAR-T cell therapy mechanism from manufacturing through tumor killing, with checkpoint blockade combination strategy.",
    category: "Immunology",
    tags: ["CAR-T", "Immunotherapy", "Checkpoint", "PD-1"],
    gradient: "linear-gradient(135deg, #D97706 0%, #EA580C 100%)",
    panels: 5,
    new: true,
  },
  {
    id: "cell-signaling-cascade",
    name: "Cell Signaling Cascade",
    description: "PI3K/AKT/mTOR or MAPK signaling pathway with upstream receptor activation, phosphorylation events, and downstream transcription factors.",
    category: "Cell Biology",
    tags: ["Signaling", "PI3K", "MAPK", "Kinase"],
    gradient: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
    panels: 4,
  },
  {
    id: "drug-mechanism",
    name: "Drug Mechanism of Action",
    description: "Step-by-step mechanism of action for small molecule inhibitors or biologics with target engagement and downstream effects.",
    category: "Pharmacology",
    tags: ["MOA", "Drug", "Inhibitor", "Target"],
    gradient: "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)",
    panels: 3,
    new: true,
  },
  {
    id: "clinical-trial-design",
    name: "Clinical Trial Design",
    description: "CONSORT-style clinical trial flow diagram with patient enrollment, randomization, treatment arms, and primary outcome data.",
    category: "Clinical",
    tags: ["Clinical Trial", "CONSORT", "Randomization", "Outcomes"],
    gradient: "linear-gradient(135deg, #0369A1 0%, #0891B2 100%)",
    panels: 4,
  },
  {
    id: "single-cell-analysis",
    name: "Single-Cell Analysis",
    description: "scRNA-seq workflow from cell isolation through UMAP visualization, cluster annotation, and trajectory analysis.",
    category: "Genomics",
    tags: ["scRNA-seq", "UMAP", "Clustering", "Single Cell"],
    gradient: "linear-gradient(135deg, #4F46E5 0%, #0891B2 100%)",
    panels: 5,
    new: true,
  },
  {
    id: "protein-structure",
    name: "Protein Structure",
    description: "Multi-domain protein structure with binding sites, post-translational modifications, and interaction interfaces highlighted.",
    category: "Structural Biology",
    tags: ["Protein", "Structure", "Domain", "PTM"],
    gradient: "linear-gradient(135deg, #BE185D 0%, #9333EA 100%)",
    panels: 3,
  },
  {
    id: "kaplan-meier",
    name: "Survival Analysis",
    description: "Kaplan-Meier survival curves with log-rank test statistics, hazard ratios, and confidence intervals for multiple treatment groups.",
    category: "Statistics",
    tags: ["Survival", "Kaplan-Meier", "Log-rank", "Statistics"],
    gradient: "linear-gradient(135deg, #0F766E 0%, #0891B2 100%)",
    panels: 2,
  },
  {
    id: "multiomics",
    name: "Multi-Omics Integration",
    description: "Integrated genomics, transcriptomics, and proteomics analysis with correlation heatmaps and pathway overlap visualization.",
    category: "Genomics",
    tags: ["Multi-Omics", "Integration", "Proteomics", "Genomics"],
    gradient: "linear-gradient(135deg, #92400E 0%, #B45309 100%)",
    panels: 6,
    popular: true,
  },
];

const categories = ["All", "Genomics", "Oncology", "Immunology", "Cell Biology", "Microbiology", "Clinical", "Pharmacology", "Statistics", "Structural Biology"];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "new" | "all">("all");

  const filtered = allTemplates.filter((t) => {
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesSort = sortBy === "all" || (sortBy === "popular" && t.popular) || (sortBy === "new" && t.new);
    return matchesCategory && matchesSearch && matchesSort;
  });

  return (
    <div className="min-h-screen bg-[#080C1C] text-white">
      <Navbar />

      <div className="pt-20">
        {/* Hero */}
        <div className="py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-violet-500/12 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">Templates</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Start with a proven template
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
              Professionally designed scientific figure templates for every research area and publication type.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-sm text-white outline-none focus:border-indigo-500 placeholder:text-zinc-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 flex-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10 border border-white/8"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-zinc-600">Filter:</span>
              <div className="flex gap-1">
                {(["all", "popular", "new"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                      sortBy === s
                        ? "bg-white/10 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Count */}
          <p className="text-xs text-zinc-600 mb-5">
            {filtered.length} template{filtered.length !== 1 ? "s" : ""} found
            {activeCategory !== "All" && ` in ${activeCategory}`}
          </p>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={(id) => {
                    // Navigate to workspace with template
                    window.location.href = "/workspace";
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M21 21l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">No templates found</h3>
              <p className="text-sm text-zinc-500 mb-4">Try a different search term or category.</p>
              <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="text-sm text-indigo-400 hover:text-indigo-300">
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-3xl p-10">
            <h2 className="text-2xl font-bold text-white mb-3">Don&apos;t see what you need?</h2>
            <p className="text-zinc-400 mb-6">
              Use our AI Figure Studio to generate a custom figure from scratch with a natural language prompt.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/ai-figure-studio"
                className="px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                ✦ Generate with AI
              </Link>
              <Link
                href="/workspace"
                className="px-6 py-3 rounded-full text-sm font-medium border border-white/15 text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Start from Scratch
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
