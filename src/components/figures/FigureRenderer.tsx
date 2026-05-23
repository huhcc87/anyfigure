"use client";

import dynamic from "next/dynamic";

const ChartPanel = dynamic(() => import("./ChartPanel"), { ssr: false });
const PathwayPanel = dynamic(() => import("./PathwayPanel"), { ssr: false });
const CellPanel = dynamic(() => import("./CellPanel"), { ssr: false });

export interface PanelSpec {
  id: string;
  label: string;
  type: string;
  chartType?: string;
  description: string;
  dataContext?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface FigurePlan {
  title?: string;
  legend?: string;
  colorPalette?: string[];
  suggestedLayout?: string;
  panels?: PanelSpec[];
}

interface FigureRendererProps {
  plan: FigurePlan;
  compact?: boolean;
}

const PALETTE = ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

function detectPanelVariant(panel: PanelSpec, index: number): {
  component: "chart" | "pathway" | "cell";
  variant: string;
  color: string;
} {
  // Use chartType from DeepSeek first (most reliable)
  const ct = (panel.chartType || "").toLowerCase().replace(/[-_\s]/g, "");
  const t = ((panel.type || "") + " " + (panel.description || "")).toLowerCase();

  // Explicit chartType mapping
  const chartTypeMap: Record<string, { component: "chart" | "pathway" | "cell"; variant: string; color: string }> = {
    "barchart": { component: "chart", variant: "bar", color: "#6366F1" },
    "kaplanmeier": { component: "chart", variant: "survival", color: "#10B981" },
    "volcanoplot": { component: "chart", variant: "volcano", color: "#EF4444" },
    "heatmap": { component: "chart", variant: "heatmap", color: "#6366F1" },
    "linechart": { component: "chart", variant: "line", color: "#06B6D4" },
    "flowcytometry": { component: "cell", variant: "flow-cytometry", color: "#8B5CF6" },
    "piechart": { component: "chart", variant: "pie", color: "#8B5CF6" },
    "westernblot": { component: "cell", variant: "western-blot", color: "#6366F1" },
    "microscopy": { component: "cell", variant: "microscopy", color: "#8B5CF6" },
    "crisprschematic": { component: "pathway", variant: "crispr", color: "#06B6D4" },
    "pathwaysignaling": { component: "pathway", variant: "signaling", color: "#6366F1" },
    "immunecheckpoint": { component: "pathway", variant: "immune", color: "#EF4444" },
    "cellschematic": { component: "cell", variant: "schematic", color: "#06B6D4" },
    "mechanismdiagram": { component: "cell", variant: "schematic", color: "#8B5CF6" },
    "timelinediagram": { component: "pathway", variant: "generic", color: "#F59E0B" },
    "molecularstructure": { component: "pathway", variant: "generic", color: "#06B6D4" },
  };

  if (ct && chartTypeMap[ct]) return chartTypeMap[ct];

  // Partial match on chartType
  for (const [key, val] of Object.entries(chartTypeMap)) {
    if (ct.includes(key) || key.includes(ct)) return val;
  }

  // Fallback: description-based detection
  if (t.includes("volcano")) return { component: "chart", variant: "volcano", color: "#EF4444" };
  if (t.includes("heatmap") || t.includes("heat map") || t.includes("matrix")) return { component: "chart", variant: "heatmap", color: "#6366F1" };
  if (t.includes("survival") || t.includes("kaplan") || t.includes("overall survival")) return { component: "chart", variant: "survival", color: "#10B981" };
  if (t.includes("pie") || t.includes("proportion") || t.includes("composition") || t.includes("percentage")) return { component: "chart", variant: "pie", color: "#8B5CF6" };
  if (t.includes("growth curve") || t.includes("tumor volume") || t.includes("time course") || t.includes("longitudinal")) return { component: "chart", variant: "line", color: "#06B6D4" };
  if (t.includes("western") || t.includes("blot") || t.includes("immunoblot")) return { component: "cell", variant: "western-blot", color: "#6366F1" };
  if (t.includes("flow") || t.includes("facs") || t.includes("cytometry")) return { component: "cell", variant: "flow-cytometry", color: "#8B5CF6" };
  if (t.includes("microscop") || t.includes("imaging") || t.includes("fluoresc") || t.includes("confocal")) return { component: "cell", variant: "microscopy", color: "#8B5CF6" };
  if (t.includes("crispr") || t.includes("cas9")) return { component: "pathway", variant: "crispr", color: "#06B6D4" };
  if (t.includes("checkpoint") || t.includes("pd-1") || t.includes("pd-l1") || t.includes("car-t")) return { component: "pathway", variant: "immune", color: "#EF4444" };
  if (t.includes("pi3k") || t.includes("akt") || t.includes("mapk") || t.includes("erk") || t.includes("mtor")) return { component: "pathway", variant: "metabolic", color: "#8B5CF6" };
  if (t.includes("pathway") || t.includes("signaling") || t.includes("cascade") || t.includes("kinase")) return { component: "pathway", variant: "signaling", color: "#6366F1" };
  if (t.includes("schematic") || t.includes("mechanism") || t.includes("model") || t.includes("diagram")) return { component: "cell", variant: "schematic", color: "#6366F1" };
  if (t.includes("cell") || t.includes("organelle")) return { component: "cell", variant: "cell", color: "#6366F1" };
  if (t.includes("bar") || t.includes("expression") || t.includes("quantif") || t.includes("level")) return { component: "chart", variant: "bar", color: "#6366F1" };

  // Last resort: cycle through meaningful types per panel index
  const cycle: { component: "chart" | "pathway" | "cell"; variant: string; color: string }[] = [
    { component: "pathway", variant: "signaling", color: "#6366F1" },
    { component: "chart", variant: "bar", color: "#8B5CF6" },
    { component: "chart", variant: "volcano", color: "#EF4444" },
    { component: "cell", variant: "schematic", color: "#06B6D4" },
    { component: "chart", variant: "heatmap", color: "#10B981" },
    { component: "pathway", variant: "immune", color: "#F59E0B" },
  ];
  return cycle[index % cycle.length];
}

function PanelContent({ panel, color, compact, index }: { panel: PanelSpec; color: string; compact: boolean; index: number }) {
  const { component, variant } = detectPanelVariant(panel, index);

  if (component === "chart") {
    return <ChartPanel variant={variant as never} color={color} height={compact ? 140 : 180} />;
  }
  if (component === "pathway") {
    return <PathwayPanel variant={variant as never} color={color} />;
  }
  return <CellPanel variant={variant as never} color={color} />;
}

export default function FigureRenderer({ plan, compact = false }: FigureRendererProps) {
  const panels = plan.panels || [];
  const palette = plan.colorPalette?.length ? plan.colorPalette : PALETTE;

  if (panels.length === 0) return null;

  const cols = panels.length <= 2 ? panels.length : panels.length <= 4 ? 2 : panels.length <= 6 ? 3 : 4;

  return (
    <div className="w-full">
      {/* Figure title */}
      {plan.title && (
        <h3 className="text-sm font-bold text-white mb-3 leading-snug">{plan.title}</h3>
      )}

      {/* Panels grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {panels.map((panel, i) => {
          const color = palette[i % palette.length];
          return (
            <div
              key={panel.id || i}
              className="rounded-xl overflow-hidden border border-white/8 bg-[#080C1C]"
              style={{ borderColor: color + "30" }}
            >
              {/* Panel label bar */}
              <div
                className="flex items-center justify-between px-2.5 py-1.5 border-b"
                style={{ borderColor: color + "20", backgroundColor: color + "12" }}
              >
                <span className="text-xs font-bold" style={{ color }}>{panel.label}</span>
                <span className="text-[9px] text-zinc-600 truncate ml-2 max-w-[80%]">{panel.type}</span>
              </div>

              {/* Visual panel */}
              <div className={`${compact ? "p-1.5" : "p-2"} bg-[#050810]`} style={{ minHeight: compact ? 160 : 210 }}>
                <PanelContent panel={panel} color={color} compact={compact} index={i} />
              </div>

              {/* Description */}
              <div className="px-2.5 py-1.5 border-t" style={{ borderColor: color + "15" }}>
                <p className="text-[9px] text-zinc-500 leading-relaxed line-clamp-2">{panel.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Figure legend */}
      {plan.legend && (
        <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/8">
          <p className="text-[10px] text-zinc-400 leading-relaxed italic">{plan.legend}</p>
        </div>
      )}
    </div>
  );
}
