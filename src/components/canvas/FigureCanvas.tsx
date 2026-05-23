"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { FigurePlan } from "@/components/figures/FigureRenderer";
import { loadPlanFromStorage, clearPlanFromStorage } from "@/lib/figureStore";

const FigureRenderer = dynamic(() => import("@/components/figures/FigureRenderer"), { ssr: false });

interface FigureCanvasProps {
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  onWheel: (e: React.WheelEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  externalPlan?: FigurePlan | null;
}

const GRID_SIZE = 20;

export default function FigureCanvas({
  zoom, panX, panY, showGrid,
  onWheel, onMouseDown, onMouseMove, onMouseUp,
  externalPlan,
}: FigureCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const [plan, setPlan] = useState<FigurePlan | null>(externalPlan ?? null);

  useEffect(() => {
    if (externalPlan) { setPlan(externalPlan); return; }
    const stored = loadPlanFromStorage();
    if (stored) {
      setPlan(stored);
      clearPlanFromStorage();
    }
  }, [externalPlan]);

  const gridStyle = showGrid ? {
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
    backgroundPosition: `${panX % (GRID_SIZE * zoom)}px ${panY % (GRID_SIZE * zoom)}px`,
  } : {};

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative overflow-hidden bg-[#080C1C] select-none"
      style={{ cursor: "default", ...gridStyle }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Canvas transform layer */}
      <div
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          minHeight: 900,
        }}
      >
        {/* Paper */}
        <div
          className="absolute inset-0 bg-[#0B0F1E] border border-white/8 rounded-sm shadow-2xl"
          style={{ width: 1200, minHeight: 900 }}
        />

        {/* Figure content */}
        {plan ? (
          <div
            ref={figureRef}
            id="figure-export-target"
            className="absolute p-8"
            style={{ width: 1200 }}
          >
            <FigureRenderer plan={plan} compact={false} />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-zinc-600">
                  <rect x="3" y="3" width="22" height="22" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 14h10M14 9v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm text-zinc-600 font-medium">Generate a figure in AI Studio</p>
              <p className="text-xs text-zinc-700 mt-1">or select a tool from the left sidebar to draw</p>
            </div>
          </div>
        )}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-[#0F1629]/80 backdrop-blur-sm border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 font-mono pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>

      {/* Plan loaded badge */}
      {plan && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/25 rounded-full px-3 py-1.5 text-xs text-indigo-300 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
          {plan.panels?.length ?? 0} panels loaded from AI Studio
        </div>
      )}
    </div>
  );
}
