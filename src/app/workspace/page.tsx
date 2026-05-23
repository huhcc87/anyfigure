"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import EditorTopbar from "@/components/editor/EditorTopbar";
import LeftSidebar from "@/components/editor/LeftSidebar";
import RightSidebar from "@/components/editor/RightSidebar";
import { useEditorStore } from "@/store/editorStore";

const FigureCanvas = dynamic(() => import("@/components/canvas/FigureCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#080C1C]">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
    </div>
  ),
});

const AssetLibrary = dynamic(() => import("@/components/biomedical/AssetLibrary"), { ssr: false });

type PanelType = null | "biomedical" | "charts" | "templates" | "ai" | "uploads";
type ExportFormat = "png" | "svg" | "pdf" | "pptx";

export default function WorkspacePage() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportDpi, setExportDpi] = useState<72 | 150 | 300>(300);
  const [exportTransparent, setExportTransparent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { zoom, panX, panY, setZoom, setPan, showGrid } = useEditorStore();

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setZoom(zoom + (-e.deltaY * 0.002));
    } else {
      setPan(panX - e.deltaX, panY - e.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPan]);

  const handleMouseDown = useCallback(() => {}, []);
  const handleMouseMove = useCallback(() => {}, []);
  const handleMouseUp = useCallback(() => {}, []);

  const handleExport = async () => {
    const target = document.getElementById("figure-export-target");
    if (!target) {
      setExportError("No figure to export. Generate one in AI Studio first.");
      return;
    }
    setIsExporting(true);
    setExportError(null);
    try {
      const scale = exportDpi / 96;
      if (exportFormat === "png") {
        const { toPng } = await import("html-to-image");
        const { saveAs } = await import("file-saver");
        const url = await toPng(target, {
          pixelRatio: scale,
          backgroundColor: exportTransparent ? undefined : "#0B0F1E",
        });
        saveAs(url, "anyfigure-export.png");
      } else if (exportFormat === "svg") {
        const { toSvg } = await import("html-to-image");
        const { saveAs } = await import("file-saver");
        const url = await toSvg(target, {
          backgroundColor: exportTransparent ? undefined : "#0B0F1E",
        });
        saveAs(url, "anyfigure-export.svg");
      } else if (exportFormat === "pdf") {
        const { toPng } = await import("html-to-image");
        const { PDFDocument } = await import("pdf-lib");
        const { saveAs } = await import("file-saver");
        const url = await toPng(target, { pixelRatio: scale, backgroundColor: exportTransparent ? undefined : "#0B0F1E" });
        const imgBytes = await fetch(url).then(r => r.arrayBuffer());
        const pdf = await PDFDocument.create();
        const img = await pdf.embedPng(imgBytes);
        const page = pdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        const bytes = await pdf.save();
        saveAs(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }), "anyfigure-export.pdf");
      } else if (exportFormat === "pptx") {
        const { toPng } = await import("html-to-image");
        const PptxGenJS = (await import("pptxgenjs")).default;
        const { saveAs } = await import("file-saver");
        const url = await toPng(target, { pixelRatio: 2, backgroundColor: exportTransparent ? undefined : "#0B0F1E" });
        const pptx = new PptxGenJS();
        pptx.defineLayout({ name: "FIGURE", width: 13.33, height: 7.5 });
        pptx.layout = "FIGURE";
        const slide = pptx.addSlide();
        slide.addImage({ data: url, x: 0, y: 0, w: "100%", h: "100%" });
        const blob = (await pptx.write({ outputType: "blob" })) as Blob;
        saveAs(blob, "anyfigure-export.pptx");
      }
      setShowExportModal(false);
    } catch (err) {
      setExportError(`Export failed: ${String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#080C1C] overflow-hidden">
      <EditorTopbar
        onAIGenerate={() => setShowAIModal(true)}
        onExport={() => setShowExportModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar activePanel={activePanel} onOpenPanel={(p) => setActivePanel(p)} />

        {activePanel === "biomedical" && (
          <AssetLibrary onInsert={(id, name) => console.log("Insert:", id, name)} />
        )}
        {activePanel === "charts" && (
          <div className="w-64 bg-[#0C1120] border-r border-white/10 flex flex-col p-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-3">Charts</h3>
            <div className="grid grid-cols-2 gap-2">
              {["Bar Chart","Line Chart","Scatter","Pie Chart","Heatmap","Volcano Plot","Box Plot","Kaplan-Meier"].map((c) => (
                <button key={c} className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-indigo-500/30 flex flex-col items-center justify-center gap-1 transition-all">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-indigo-400"><path d="M2 10h8M4 10V6M6 10V4M8 10V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  <span className="text-[9px] text-zinc-500 text-center px-0.5">{c}</span>
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
                { name: "CRISPR Editing Workflow", g: "from-teal-500 to-cyan-600" },
                { name: "RNA-seq Pipeline", g: "from-violet-500 to-indigo-600" },
                { name: "Tumor Microenvironment", g: "from-rose-500 to-red-600" },
                { name: "Immunotherapy Pathway", g: "from-amber-500 to-orange-600" },
                { name: "Cell Signaling Cascade", g: "from-blue-500 to-indigo-600" },
              ].map((t) => (
                <button key={t.name} className="w-full rounded-xl overflow-hidden border border-white/8 hover:border-indigo-500/30 transition-all">
                  <div className={`h-14 bg-gradient-to-br ${t.g} opacity-70 flex items-center justify-center`}>
                    <div className="grid grid-cols-2 gap-1 w-10">{[...Array(4)].map((_,i)=><div key={i} className="aspect-square rounded-sm bg-white/20"/>)}</div>
                  </div>
                  <div className="bg-[#0F1629] px-2.5 py-2"><p className="text-xs font-medium text-zinc-300 text-left">{t.name}</p></div>
                </button>
              ))}
            </div>
          </div>
        )}
        {activePanel === "ai" && (
          <div className="w-72 bg-[#0C1120] border-r border-white/10 flex flex-col p-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-3">AI Tools</h3>
            <textarea placeholder="Describe changes to make..." className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-indigo-500 resize-none placeholder:text-zinc-600" rows={4} />
            <button onClick={() => setShowAIModal(true)} className="mt-2 w-full py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white">✦ Generate Figure</button>
          </div>
        )}

        {/* Main canvas */}
        <FigureCanvas
          zoom={zoom}
          panX={panX}
          panY={panY}
          showGrid={showGrid}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />

        <RightSidebar />
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAIModal(false)}>
          <div className="relative w-full max-w-lg bg-[#0F1629] border border-white/15 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">AI Figure Generator</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Go to AI Studio for full generation</p>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-zinc-500 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>
            <a href="/ai-figure-studio" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-all">
              ✦ Open AI Figure Studio
            </a>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowExportModal(false); setExportError(null); }}>
          <div className="relative w-full max-w-sm bg-[#0F1629] border border-white/15 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Export Figure</h2>
              <button onClick={() => setShowExportModal(false)} className="text-zinc-500 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              {/* Format */}
              <div>
                <label className="text-xs text-zinc-500 block mb-2 uppercase tracking-wide font-semibold">Format</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["png","svg","pdf","pptx"] as ExportFormat[]).map(f => (
                    <button key={f} onClick={() => setExportFormat(f)}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${exportFormat === f ? "bg-indigo-500/20 text-indigo-300 border-2 border-indigo-500/50" : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {/* Resolution */}
              <div>
                <label className="text-xs text-zinc-500 block mb-2 uppercase tracking-wide font-semibold">Resolution</label>
                <div className="flex gap-2">
                  {([72, 150, 300] as const).map(dpi => (
                    <button key={dpi} onClick={() => setExportDpi(dpi)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${exportDpi === dpi ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10"}`}>
                      {dpi} DPI
                    </button>
                  ))}
                </div>
              </div>
              {/* Transparent */}
              <button
                onClick={() => setExportTransparent(!exportTransparent)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
              >
                <span className="text-xs text-zinc-400">Transparent background</span>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${exportTransparent ? "bg-indigo-500" : "bg-white/10"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all ${exportTransparent ? "right-[3px]" : "left-[3px]"}`} />
                </div>
              </button>
              {exportError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{exportError}</p>
              )}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Exporting…</>
                ) : (
                  <>Download {exportFormat.toUpperCase()} ({exportDpi} DPI)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
