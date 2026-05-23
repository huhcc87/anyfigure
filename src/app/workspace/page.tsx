"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import EditorTopbar from "@/components/editor/EditorTopbar";
import LeftSidebar from "@/components/editor/LeftSidebar";
import RightSidebar from "@/components/editor/RightSidebar";

const InfiniteCanvas = dynamic(() => import("@/components/canvas/InfiniteCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#080C1C]">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-600">Loading canvas…</p>
      </div>
    </div>
  ),
});

const AssetLibrary = dynamic(() => import("@/components/biomedical/AssetLibrary"), {
  ssr: false,
});

type PanelType = null | "biomedical" | "charts" | "templates" | "ai" | "uploads";

export default function WorkspacePage() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#080C1C] overflow-hidden">
      {/* Topbar */}
      <EditorTopbar
        onAIGenerate={() => setShowAIModal(true)}
        onExport={() => setShowExportModal(true)}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left icon sidebar */}
        <LeftSidebar
          activePanel={activePanel}
          onOpenPanel={(panel) => setActivePanel(panel)}
        />

        {/* Expanded panel (asset library, etc.) */}
        {activePanel === "biomedical" && (
          <AssetLibrary
            onInsert={(id, name) => {
              // TODO: insert asset into canvas
              console.log("Insert asset:", id, name);
            }}
          />
        )}

        {activePanel === "charts" && (
          <div className="w-64 bg-[#0C1120] border-r border-white/10 flex flex-col p-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-3">Charts</h3>
            <div className="grid grid-cols-2 gap-2">
              {["Bar Chart", "Line Chart", "Scatter", "Pie Chart", "Heatmap", "Volcano Plot", "Box Plot", "Kaplan-Meier"].map((chart) => (
                <button
                  key={chart}
                  className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-indigo-500/30 flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-indigo-400">
                      <path d="M2 10h8M4 10V6M6 10V4M8 10V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-[9px] text-zinc-500 text-center leading-tight px-0.5">{chart}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activePanel === "templates" && (
          <div className="w-64 bg-[#0C1120] border-r border-white/10 flex flex-col p-3 overflow-y-auto">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-3">Templates</h3>
            <div className="space-y-2">
              {[
                { name: "CRISPR Editing Workflow", gradient: "from-teal-500 to-cyan-600" },
                { name: "RNA-seq Pipeline", gradient: "from-violet-500 to-indigo-600" },
                { name: "Tumor Microenvironment", gradient: "from-rose-500 to-red-600" },
                { name: "Immunotherapy Pathway", gradient: "from-amber-500 to-orange-600" },
                { name: "Cell Signaling Cascade", gradient: "from-blue-500 to-indigo-600" },
                { name: "Microbiome Interaction", gradient: "from-emerald-500 to-green-600" },
              ].map((t) => (
                <button
                  key={t.name}
                  className="w-full rounded-xl overflow-hidden border border-white/8 hover:border-indigo-500/30 transition-all"
                >
                  <div className={`h-16 bg-gradient-to-br ${t.gradient} opacity-70 flex items-center justify-center`}>
                    <div className="grid grid-cols-2 gap-1 w-12">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-sm bg-white/20" />
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#0F1629] px-2.5 py-2">
                    <p className="text-xs font-medium text-zinc-300 text-left">{t.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activePanel === "ai" && (
          <div className="w-72 bg-[#0C1120] border-r border-white/10 flex flex-col p-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-3">AI Tools</h3>
            <div className="space-y-2">
              <textarea
                placeholder="Describe the figure you want to create..."
                className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-indigo-500 resize-none placeholder:text-zinc-600 leading-relaxed"
                rows={4}
              />
              <button
                onClick={() => setShowAIModal(true)}
                className="w-full py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-all"
              >
                ✦ Generate Figure
              </button>
            </div>
            <div className="mt-4 space-y-1.5">
              <p className="text-xs text-zinc-600 uppercase tracking-wide font-semibold">Quick prompts</p>
              {["Add statistical annotations", "Suggest color palette", "Write figure legend", "Improve layout"].map((p) => (
                <button key={p} className="w-full text-left text-xs text-zinc-500 hover:text-zinc-300 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-indigo-400 mr-1.5">→</span>{p}
                </button>
              ))}
            </div>
          </div>
        )}

        {activePanel === "uploads" && (
          <div className="w-64 bg-[#0C1120] border-r border-white/10 flex flex-col p-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-3">Uploads</h3>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
                <path d="M12 15V4M9 7l3-3 3 3M5 19h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-xs text-zinc-500 text-center">
                Drop files or click to upload<br />
                <span className="text-zinc-600">PNG, JPG, SVG, TIFF</span>
              </p>
            </div>
          </div>
        )}

        {/* Canvas */}
        <InfiniteCanvas />

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* AI Generate Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAIModal(false)}>
          <div
            className="relative w-full max-w-lg bg-[#0F1629] border border-white/15 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">AI Figure Generator</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Describe your figure and AI will generate it</p>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <textarea
                placeholder="e.g. Show the CRISPR-Cas9 mechanism targeting KRAS in pancreatic cancer cells, with guide RNA design and T7E1 assay validation..."
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 resize-none placeholder:text-zinc-600 leading-relaxed"
                rows={4}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Figure Type</label>
                  <select className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                    <option>Pathway Diagram</option>
                    <option>Graphical Abstract</option>
                    <option>Cell Biology</option>
                    <option>Mechanism of Action</option>
                    <option>Data Visualization</option>
                    <option>Workflow Diagram</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Scientific Field</label>
                  <select className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                    <option>Cancer Biology</option>
                    <option>Immunology</option>
                    <option>Genomics</option>
                    <option>Microbiome</option>
                    <option>Neuroscience</option>
                    <option>Cell Biology</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Journal Style</label>
                  <select className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                    <option>Nature</option>
                    <option>Science</option>
                    <option>Cell</option>
                    <option>NEJM</option>
                    <option>Lancet</option>
                    <option>Generic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Number of Panels</label>
                  <select className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 outline-none cursor-pointer">
                    <option>1</option>
                    <option>2</option>
                    <option selected>4</option>
                    <option>6</option>
                    <option>8</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowAIModal(false)}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                ✦ Generate Figure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)}>
          <div
            className="relative w-full max-w-sm bg-[#0F1629] border border-white/15 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Export Figure</h2>
              <button onClick={() => setShowExportModal(false)} className="text-zinc-500 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {["PNG", "SVG", "PDF", "PPTX"].map((fmt) => (
                  <button key={fmt} className="py-3 rounded-xl border border-white/10 bg-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/10 text-sm font-semibold text-zinc-300 hover:text-white transition-all">
                    {fmt}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-zinc-500 block mb-2">Resolution</label>
                <div className="flex gap-2">
                  {["72 DPI", "150 DPI", "300 DPI"].map((dpi, i) => (
                    <button
                      key={dpi}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        i === 2
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {dpi}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/5">
                <span className="text-xs text-zinc-400">Transparent background</span>
                <div className="w-9 h-5 rounded-full bg-indigo-500/30 relative cursor-pointer">
                  <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 right-0.75" />
                </div>
              </div>

              <button className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-all">
                Download Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
