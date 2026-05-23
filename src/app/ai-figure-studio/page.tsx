"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import type { FigureType, ScientificField, JournalStyle } from "@/types";

const figureTypes: { value: FigureType; label: string; icon: string; description: string }[] = [
  { value: "graphical-abstract", label: "Graphical Abstract", icon: "🖼", description: "Visual summary of research" },
  { value: "pathway-diagram", label: "Pathway Diagram", icon: "🔄", description: "Molecular signaling pathways" },
  { value: "cell-biology", label: "Cell Biology", icon: "🔬", description: "Cellular processes and structures" },
  { value: "mechanism-of-action", label: "Mechanism of Action", icon: "⚙️", description: "Drug/protein mechanisms" },
  { value: "clinical-trial", label: "Clinical Trial", icon: "📊", description: "Trial design and results" },
  { value: "data-visualization", label: "Data Visualization", icon: "📈", description: "Charts and statistical figures" },
  { value: "workflow-diagram", label: "Workflow Diagram", icon: "🗺", description: "Experimental pipelines" },
  { value: "molecular-structure", label: "Molecular Structure", icon: "🧬", description: "3D molecular diagrams" },
];

const scientificFields: { value: ScientificField; label: string }[] = [
  { value: "cancer-biology", label: "Cancer Biology" },
  { value: "immunology", label: "Immunology" },
  { value: "genomics", label: "Genomics" },
  { value: "microbiome", label: "Microbiome" },
  { value: "neuroscience", label: "Neuroscience" },
  { value: "cardiology", label: "Cardiology" },
  { value: "drug-discovery", label: "Drug Discovery" },
  { value: "cell-biology", label: "Cell Biology" },
  { value: "biochemistry", label: "Biochemistry" },
];

const journalStyles: { value: JournalStyle; label: string; color: string }[] = [
  { value: "nature", label: "Nature", color: "from-red-500/20 to-red-600/10 border-red-500/20 hover:border-red-500/40" },
  { value: "science", label: "Science", color: "from-blue-500/20 to-blue-600/10 border-blue-500/20 hover:border-blue-500/40" },
  { value: "cell", label: "Cell", color: "from-violet-500/20 to-violet-600/10 border-violet-500/20 hover:border-violet-500/40" },
  { value: "nejm", label: "NEJM", color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/20 hover:border-indigo-500/40" },
  { value: "lancet", label: "Lancet", color: "from-teal-500/20 to-teal-600/10 border-teal-500/20 hover:border-teal-500/40" },
  { value: "generic", label: "Generic", color: "from-zinc-500/20 to-zinc-600/10 border-zinc-500/20 hover:border-zinc-500/40" },
];

const examplePrompts = [
  "Show CRISPR-Cas9 editing of KRAS G12D in pancreatic ductal adenocarcinoma cells with guide RNA design, T7E1 assay validation, and tumor growth inhibition data",
  "Illustrate the tumor immune microenvironment showing exhausted CD8+ T cells, regulatory T cells, MDSCs, and checkpoint molecule expression with spatial organization",
  "Create an RNA-seq analysis pipeline from raw FASTQ reads through quality control, alignment, differential expression, and pathway enrichment with representative volcano plot",
  "Depict the PI3K/AKT/mTOR signaling cascade showing upstream RTK activation, key phosphorylation events, downstream targets, and feedback inhibition mechanisms",
  "Show gut microbiome dysbiosis in colorectal cancer patients vs healthy controls with relative abundance heatmap and key metabolite production pathways",
  "Illustrate CAR-T cell manufacturing process from leukapheresis through viral transduction, expansion, and infusion with efficacy readout in a leukemia model",
];

interface GeneratedFigure {
  id: string;
  prompt: string;
  figureType: string;
  field: string;
  panels: number;
  timestamp: Date;
}

export default function AIFigureStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [figureType, setFigureType] = useState<FigureType>("pathway-diagram");
  const [field, setField] = useState<ScientificField>("cancer-biology");
  const [journalStyle, setJournalStyle] = useState<JournalStyle>("nature");
  const [numPanels, setNumPanels] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFigures, setGeneratedFigures] = useState<GeneratedFigure[]>([]);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setEnhancedPrompt(null);

    await new Promise((r) => setTimeout(r, 2200));

    const newFigure: GeneratedFigure = {
      id: `fig-${Date.now()}`,
      prompt: prompt.slice(0, 80),
      figureType,
      field,
      panels: numPanels,
      timestamp: new Date(),
    };

    setGeneratedFigures((prev) => [newFigure, ...prev]);
    setIsGenerating(false);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    await new Promise((r) => setTimeout(r, 800));
    setEnhancedPrompt(
      prompt + " — showing key molecular components, signaling cascades, and cellular context with publication-quality annotations and statistical validation panels suitable for a high-impact journal submission"
    );
  };

  const gradients = [
    "from-indigo-600/20 via-violet-600/15 to-cyan-600/10",
    "from-rose-600/20 via-red-600/15 to-orange-600/10",
    "from-emerald-600/20 via-green-600/15 to-teal-600/10",
    "from-amber-600/20 via-yellow-600/15 to-orange-600/10",
    "from-blue-600/20 via-indigo-600/15 to-violet-600/10",
  ];

  return (
    <div className="min-h-screen bg-[#080C1C] text-white">
      <Navbar />

      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
            Powered by GPT-4o + DeepSeek
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              AI Figure Studio
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Describe your experiment in plain language. Our AI generates publication-ready biomedical figures in seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Left: Input Form */}
          <div className="space-y-5">
            {/* Prompt Input */}
            <div className="bg-[#0F1629] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-white">Describe your figure</label>
                <button
                  onClick={handleEnhancePrompt}
                  disabled={!prompt.trim()}
                  className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-zinc-700 transition-colors flex items-center gap-1"
                >
                  <span>✦</span> Enhance with AI
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); setEnhancedPrompt(null); }}
                placeholder="e.g. Show CRISPR-Cas9 targeting of KRAS in pancreatic cancer with T7E1 assay validation and tumor growth data..."
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 resize-none placeholder:text-zinc-600 leading-relaxed transition-colors"
                rows={5}
              />
              {enhancedPrompt && (
                <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-indigo-400 text-xs font-semibold">✦ AI-enhanced prompt</span>
                    <button
                      onClick={() => { setPrompt(enhancedPrompt); setEnhancedPrompt(null); }}
                      className="text-xs text-white/60 hover:text-white ml-auto"
                    >
                      Use this →
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{enhancedPrompt}</p>
                </div>
              )}
            </div>

            {/* Figure Type Selection */}
            <div className="bg-[#0F1629] border border-white/10 rounded-2xl p-5">
              <label className="text-sm font-semibold text-white block mb-3">Figure Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {figureTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFigureType(type.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                      figureType === type.value
                        ? "bg-indigo-500/15 border-indigo-500/40 text-white"
                        : "bg-white/3 border-white/8 text-zinc-500 hover:bg-white/8 hover:text-zinc-300 hover:border-white/15"
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-xs font-medium leading-tight">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration Row */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Scientific Field */}
              <div className="bg-[#0F1629] border border-white/10 rounded-2xl p-4">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block mb-3">Scientific Field</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {scientificFields.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setField(f.value)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                        field === f.value
                          ? "bg-indigo-500/20 text-indigo-300 font-medium"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Style */}
              <div className="bg-[#0F1629] border border-white/10 rounded-2xl p-4">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block mb-3">Journal Style</label>
                <div className="space-y-1.5">
                  {journalStyles.map((j) => (
                    <button
                      key={j.value}
                      onClick={() => setJournalStyle(j.value)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs border transition-all bg-gradient-to-r ${j.color} ${
                        journalStyle === j.value ? "text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {j.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Panels */}
              <div className="bg-[#0F1629] border border-white/10 rounded-2xl p-4">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block mb-3">Panels</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumPanels(n)}
                      className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        numPanels === n
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-white/5 text-zinc-500 border border-white/8 hover:bg-white/10 hover:text-zinc-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-600 mt-3 text-center">{numPanels} panel{numPanels !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 text-white hover:from-indigo-400 hover:via-violet-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Generating figure…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">✦</span>
                  Generate Figure with AI
                </span>
              )}
            </button>
          </div>

          {/* Right: Examples + Generated */}
          <div className="space-y-5">
            {/* Example Prompts */}
            <div className="bg-[#0F1629] border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Example Prompts</h3>
              <div className="space-y-2">
                {examplePrompts.map((exPrompt, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(exPrompt)}
                    className="w-full text-left px-3 py-2.5 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-indigo-500/20 text-xs text-zinc-500 hover:text-zinc-300 transition-all"
                  >
                    <span className="text-indigo-400 mr-1.5">→</span>
                    <span className="line-clamp-2">{exPrompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generation History */}
            {generatedFigures.length > 0 && (
              <div className="bg-[#0F1629] border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Generated Figures</h3>
                <div className="space-y-3">
                  {generatedFigures.map((fig, i) => (
                    <div key={fig.id} className="rounded-xl overflow-hidden border border-white/8 hover:border-indigo-500/30 transition-all group">
                      <div className={`h-28 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                        <div className="grid grid-cols-2 gap-2 w-20">
                          {Array.from({ length: Math.min(fig.panels, 4) }).map((_, pi) => (
                            <div key={pi} className="aspect-square rounded bg-white/15 border border-white/20 flex items-center justify-center text-xs text-white/60 font-bold">
                              {String.fromCharCode(65 + pi)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-[#0C1020]">
                        <p className="text-xs font-medium text-zinc-300 mb-1 line-clamp-1">{fig.prompt}…</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-600">{fig.panels} panels · {fig.field}</span>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href="/workspace"
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                              Edit →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
