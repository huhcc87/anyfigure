"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { FigurePlan } from "@/components/figures/FigureRenderer";
import {
  getEditableFigure,
  saveEditableFigure,
  type EditableFigureRecord,
} from "@/lib/makeEditable/editableFigureStore";
import { cacheEditPlan, deleteWorkspaceSnapshotIdb } from "@/lib/figureStore";
import { buildEditableRecordSync } from "@/lib/makeEditable/persistEditableAssets";
import { getPanelTextManifest } from "@/lib/makeEditable/imageRegionUtils";

interface FigureViewerToolbarProps {
  figureId: string;
  plan: FigurePlan;
  onTextEditToggle?: (active: boolean) => void;
  textEditActive?: boolean;
  hasEditableLayer?: boolean;
  onExport?: () => void;
  onExportPng?: () => void;
  onExportPptx?: () => void;
  whiteBackground?: boolean;
  onWhiteBgToggle?: () => void;
  onPlanUpdate?: (plan: FigurePlan) => void;
}

function ChevronDown() {
  return (
    <svg className="w-3 h-3 ml-0.5 opacity-60" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WandIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 4l5 5M3 21l7.5-7.5M14 5l5 5M9 9l-1.5 1.5M6 12l-1.5 1.5" strokeLinecap="round" />
      <path d="M18 2l4 4" strokeLinecap="round" />
    </svg>
  );
}

export function FigureViewerToolbar({
  figureId,
  plan,
  onTextEditToggle,
  textEditActive = false,
  hasEditableLayer = false,
  onExport,
  onExportPng,
  onExportPptx,
  whiteBackground = true,
  onWhiteBgToggle,
  onPlanUpdate,
}: FigureViewerToolbarProps) {
  const [converting, setConverting] = useState(false);
  const [hasConversion, setHasConversion] = useState(false);
  const [makeEditableOpen, setMakeEditableOpen] = useState(false);
  const [upscaleOpen, setUpscaleOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getEditableFigure(figureId).then((rec) => setHasConversion(!!rec?.svg));
  }, [figureId]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMakeEditableOpen(false);
        setUpscaleOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openEditor = useCallback(
    async (rec?: EditableFigureRecord, planOverride?: FigurePlan) => {
      await deleteWorkspaceSnapshotIdb(figureId);
      const p = planOverride ?? plan;
      await cacheEditPlan(figureId, p);
      const url = rec?.editorUrl || `/workspace?figure=${encodeURIComponent(figureId)}&editable=1`;
      window.location.href = url;
    },
    [figureId, plan]
  );

  const runConversion = useCallback(
    async (openAfter = true) => {
      if (converting) return;

      setConverting(true);
      setMakeEditableOpen(false);

      try {
        toast.info("Detecting diagram labels with AI…");
        const res = await fetch(`/api/figures/${figureId}/make-editable`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();

        if (!res.ok || data.status !== "ok") {
          console.error("[make-editable] API error:", data);
          toast.error(data.message || "Conversion failed. Please try again later.");
          return;
        }

        const enrichedPlan = data.plan as FigurePlan;
        onPlanUpdate?.(enrichedPlan);
        await deleteWorkspaceSnapshotIdb(figureId);
        await cacheEditPlan(figureId, enrichedPlan);

        const record = buildEditableRecordSync(figureId, enrichedPlan);
        await saveEditableFigure(record);
        setHasConversion(true);

        const labelMsg = data.labelCount
          ? `Found ${data.labelCount} editable labels. `
          : "";

        if (openAfter) {
          toast.success(`${labelMsg}Opening editor…`);
          await openEditor(record, enrichedPlan);
        } else {
          toast.success(`${labelMsg}Figure converted to editable SVG.`);
        }
      } catch (err) {
        console.error("[make-editable] failed:", err);
        toast.error("Conversion failed. Please try again later.");
      } finally {
        setConverting(false);
      }
    },
    [converting, figureId, plan, openEditor, onPlanUpdate]
  );

  const pill =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50/80 border-b border-slate-100 flex-wrap">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          className={pill}
          onClick={() => toast.info("Region redraw opens in Workspace — use Make Editable first.")}
          title="Redraw a selected region"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" strokeDasharray="4 3" />
            <path d="M12 3v2M12 19v2" strokeLinecap="round" />
          </svg>
          Region Redraw
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-600 transition-colors cursor-pointer shadow-sm"
          onClick={() => void openEditor(undefined, plan)}
          title="Open figure in full canvas editor — every label is independently editable, draggable, resizable (FigureLabs-style)"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6v6H9z" />
            <path d="M3 9h6M9 3v6M15 21v-6M21 15h-6" strokeLinecap="round" />
          </svg>
          Edit Every Element
        </button>

        <button
          type="button"
          className={`${pill} ${textEditActive ? "ring-2 ring-teal-500 border-teal-400 bg-teal-50" : ""}`}
          onClick={() => {
            if (!hasEditableLayer && !textEditActive) {
              toast.info("Building editable text layer…");
            }
            onTextEditToggle?.(!textEditActive);
          }}
          title="Quick text edit in place (use 'Edit Every Element' for full canvas editor)"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" />
          </svg>
          Quick Text Edit
        </button>

        <div className="relative">
          <button type="button" className={pill} onClick={() => { setUpscaleOpen(!upscaleOpen); setMakeEditableOpen(false); }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <text x="12" y="14" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none">HD</text>
            </svg>
            Upscale
            <ChevronDown />
          </button>
          {upscaleOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 w-44 rounded-xl border border-slate-200 bg-white shadow-lg py-1">
              {[2, 4].map((x) => (
                <button
                  key={x}
                  type="button"
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer"
                  onClick={() => { setUpscaleOpen(false); toast.info(`${x}× upscale coming soon.`); }}
                >
                  {x}× resolution
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={pill}
          onClick={onWhiteBgToggle}
          title="Toggle white background"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M12 4v16" />
          </svg>
          White BG
          {!whiteBackground && <span className="text-[10px] text-amber-600 ml-0.5">off</span>}
        </button>
      </div>

      <div className="flex items-center gap-1.5" ref={dropdownRef}>
        <div className="relative">
          <button
            type="button"
            className={pill}
            disabled={converting}
            onClick={() => { setMakeEditableOpen(!makeEditableOpen); setUpscaleOpen(false); }}
          >
            {converting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                Converting…
              </>
            ) : (
              <>
                <WandIcon />
                Make Editable
                <ChevronDown />
              </>
            )}
          </button>

          {makeEditableOpen && !converting && (
            <div className="absolute top-full right-0 mt-1 z-30 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-1">
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                onClick={() => runConversion(true)}
              >
                <p className="text-xs font-semibold text-slate-900">Convert to editable SVG</p>
                <p className="text-[10px] text-slate-500 mt-0.5">AI detects labels + opens layered editor</p>
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                onClick={() => { setMakeEditableOpen(false); onExportPptx?.(); }}
              >
                <p className="text-xs font-semibold text-slate-900">Editable PPTX</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Download fully editable slides</p>
              </button>
              <button
                type="button"
                disabled={converting}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 cursor-pointer"
                onClick={() => {
                  setMakeEditableOpen(false);
                  const hasLabels = plan.panels?.some((p) => (getPanelTextManifest(p)?.regions.length ?? 0) > 0);
                  if (hasLabels) {
                    void (async () => {
                      await deleteWorkspaceSnapshotIdb(figureId);
                      const rec = buildEditableRecordSync(figureId, plan);
                      await saveEditableFigure(rec);
                      toast.success("Opening editable view…");
                      await openEditor(rec, plan);
                    })();
                  } else {
                    void runConversion(true);
                  }
                }}
              >
                <p className="text-xs font-semibold text-slate-900">Open editable view</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {hasConversion ? "Edit in canvas with layered SVG" : "Convert first to unlock"}
                </p>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={onExport || onExportPng}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v12M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 19h16" strokeLinecap="round" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}
