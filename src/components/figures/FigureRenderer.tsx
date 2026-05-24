"use client";

import dynamic from "next/dynamic";
import { assemblePanelSVG, type AssemblyElement } from "./assembly/BioAssets";
import { getPanelScene, isDataChartType } from "@/lib/panelScenes";
import type { DetectedTextRegion, TextRegionManifest } from "@/types/detectedText";

const ChartPanel = dynamic(() => import("./ChartPanel"), { ssr: false });
const PathwayPanel = dynamic(() => import("./PathwayPanel"), { ssr: false });
const CellPanel = dynamic(() => import("./CellPanel"), { ssr: false });

export type GenerationMode = "smart" | "charts" | "svg" | "image" | "assembly";

export interface PanelSpec {
  id: string;
  label: string;
  type: string;
  chartType?: string;
  description: string;
  dataContext?: string;
  // Enriched by generation modes
  svgContent?: string;
  imageUrl?: string;
  assemblyElements?: AssemblyElement[];
  assemblyTitle?: string;
  color?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  /** @deprecated Legacy normalized regions — use textNodesManifest */
  textRegions?: DetectedTextRegion[];
  /** Pixel-accurate text region manifest (cached after OCR/vision) */
  textNodesManifest?: TextRegionManifest;
  imageNaturalWidth?: number;
  imageNaturalHeight?: number;
  textRegionsModel?: string;
}

export interface FigurePlan {
  title?: string;
  legend?: string;
  colorPalette?: string[];
  suggestedLayout?: string;
  panels?: PanelSpec[];
  mode?: GenerationMode;
}

interface FigureRendererProps {
  plan: FigurePlan;
  compact?: boolean;
  /** Publication-style white canvas (default in workspace export) */
  whiteBackground?: boolean;
  /** Show full images without cropping */
  fullSize?: boolean;
  /** Hide mode badge (used for PNG/SVG export) */
  hideBadge?: boolean;
  /** Constrained card preview in "Your figures" list */
  preview?: boolean;
  /** Panels still generating (show placeholders, not templates) */
  enriching?: boolean;
}

const PALETTE = ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

function detectPanelVariant(panel: PanelSpec, index: number): {
  component: "chart" | "pathway" | "cell";
  variant: string;
  color: string;
} {
  const ct = (panel.chartType || "").toLowerCase().replace(/[-_\s]/g, "");
  const t = ((panel.type || "") + " " + (panel.description || "")).toLowerCase();

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
  for (const [key, val] of Object.entries(chartTypeMap)) {
    if (ct.includes(key) || key.includes(ct)) return val;
  }

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

// SVG mode: renders AI-generated SVG string
function SvgPanel({ svgContent, label, preview }: { svgContent: string; label: string; preview?: boolean }) {
  return (
    <div className="relative w-full flex justify-center" style={{ minHeight: preview ? 140 : 180 }}>
      <div
        className="[&>svg]:max-w-full [&>svg]:h-auto [&>svg]:block"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ lineHeight: 0, maxWidth: preview ? 420 : "100%" }}
      />
      {!svgContent && (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
          Panel {label} — no SVG
        </div>
      )}
    </div>
  );
}

// Image mode: renders DALL-E or Gemini URL — full figure, no crop
function ImagePanel({
  imageUrl,
  description,
  fullSize,
  preview,
  single,
  panelId,
}: {
  imageUrl: string;
  description: string;
  fullSize?: boolean;
  preview?: boolean;
  single?: boolean;
  panelId?: string;
}) {
  const maxH = preview ? (single ? 520 : 420) : fullSize ? 560 : 320;
  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: preview && single ? 480 : undefined }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={description}
        data-figure-image={panelId || "main"}
        className="rounded max-w-full w-auto h-auto object-contain"
        style={{ maxHeight: maxH }}
        onError={(e) => {
          const t = e.target as HTMLImageElement;
          t.style.display = "none";
        }}
      />
    </div>
  );
}

// Assembly mode: renders AI-assembled SVG from pre-built assets
function AssemblyPanel({ panel, color, preview }: { panel: PanelSpec; color: string; preview?: boolean }) {
  const svg = assemblePanelSVG({
    label: panel.label,
    title: panel.assemblyTitle || panel.description.slice(0, 45),
    elements: panel.assemblyElements || [],
    color: panel.color || color,
    width: 500,
    height: 360,
  });
  return (
    <div className={`w-full flex justify-center ${preview ? "p-1" : ""}`}>
      <div
        className="[&>svg]:max-w-full [&>svg]:h-auto [&>svg]:block"
        dangerouslySetInnerHTML={{ __html: svg }}
        style={{ lineHeight: 0, maxWidth: preview ? 420 : 500 }}
      />
    </div>
  );
}

// Loading skeleton for async panels
function PanelLoadingSkeleton({ label, color, preview, single }: { label: string; color: string; preview?: boolean; single?: boolean }) {
  const minH = single ? 480 : preview ? 360 : 180;
  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 py-8" style={{ minHeight: minH }}>
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: color + "40", borderTopColor: color }} />
      <p className="text-sm text-gray-700">Generating panel {label}…</p>
    </div>
  );
}

function CuratedPanel({ panel, color, compact, index }: {
  panel: PanelSpec;
  color: string;
  compact: boolean;
  index: number;
}) {
  const title = panel.description.slice(0, 55);
  const { component, variant } = detectPanelVariant(panel, index);
  if (component === "chart") {
    return <ChartPanel variant={variant as never} title={title} color={color} height={compact ? 140 : 180} />;
  }
  if (component === "pathway") {
    return <PathwayPanel variant={variant as never} color={color} title={title} />;
  }
  return <CellPanel variant={variant as never} color={color} title={title} />;
}

function SmartPanel({ panel, color, compact, index, fullSize, preview, enriching, single }: {
  panel: PanelSpec;
  color: string;
  compact: boolean;
  index: number;
  fullSize?: boolean;
  preview?: boolean;
  enriching?: boolean;
  single?: boolean;
}) {
  if (panel.imageUrl) {
    return <ImagePanel imageUrl={panel.imageUrl} description={panel.description} fullSize={fullSize} preview={preview} single={single} panelId={panel.id || panel.label || "main"} />;
  }

  if (enriching) {
    return <PanelLoadingSkeleton label={panel.label} color={color} preview={preview} single={single} />;
  }

  // Data panels → high-quality charts/blots/microscopy
  if (isDataChartType(panel.chartType)) {
    return <CuratedPanel panel={panel} color={color} compact={compact} index={index} />;
  }

  // Schematic panels → template assembly (BioRender-style)
  if (panel.assemblyElements?.length) {
    return <AssemblyPanel panel={panel} color={color} preview={preview} />;
  }

  const scene = getPanelScene(panel.chartType, panel.description, panel.dataContext);
  const svg = assemblePanelSVG({
    label: panel.label,
    title: scene.title,
    elements: scene.elements,
    color: panel.color || color,
    width: 500,
    height: 360,
    background: "#ffffff",
  });
  return (
    <div className="w-full flex justify-center">
      <div
        className="[&>svg]:max-w-full [&>svg]:h-auto [&>svg]:block"
        dangerouslySetInnerHTML={{ __html: svg }}
        style={{ lineHeight: 0, maxWidth: preview ? 420 : 500 }}
      />
    </div>
  );
}

function PanelContent({ panel, color, compact, index, mode, fullSize, preview, enriching, single }: {
  panel: PanelSpec;
  color: string;
  compact: boolean;
  index: number;
  mode: GenerationMode;
  fullSize?: boolean;
  preview?: boolean;
  enriching?: boolean;
  single?: boolean;
}) {
  if (mode === "smart") {
    return <SmartPanel panel={panel} color={color} compact={compact} index={index} fullSize={fullSize} preview={preview} enriching={enriching} single={single} />;
  }

  if (mode === "svg") {
    if (!panel.svgContent) return <PanelLoadingSkeleton label={panel.label} color={color} preview={preview} single={single} />;
    return <SvgPanel svgContent={panel.svgContent} label={panel.label} preview={preview} />;
  }

  if (mode === "image") {
    if (panel.imageUrl) {
      return <ImagePanel imageUrl={panel.imageUrl} description={panel.description} fullSize={fullSize} preview={preview} single={single} panelId={panel.id || panel.label || "main"} />;
    }
    if (panel.assemblyElements?.length) {
      return <AssemblyPanel panel={panel} color={color} preview={preview} />;
    }
    if (enriching) {
      return <PanelLoadingSkeleton label={panel.label} color={color} preview={preview} single={single} />;
    }
    return <PanelLoadingSkeleton label={panel.label} color={color} preview={preview} single={single} />;
  }

  if (mode === "assembly") {
    if (!panel.assemblyElements?.length) return <PanelLoadingSkeleton label={panel.label} color={color} preview={preview} single={single} />;
    return <AssemblyPanel panel={panel} color={color} preview={preview} />;
  }

  return <CuratedPanel panel={panel} color={color} compact={compact} index={index} />;
}

// Mode label badge
const modeBadge: Record<GenerationMode, { label: string; icon: string; color: string }> = {
  smart: { label: "Smart", icon: "⚡", color: "#F59E0B" },
  charts: { label: "Charts", icon: "📊", color: "#6366F1" },
  svg: { label: "Illustration", icon: "✦", color: "#06B6D4" },
  image: { label: "AI Image", icon: "🎨", color: "#8B5CF6" },
  assembly: { label: "Assembly", icon: "🔬", color: "#10B981" },
};

function imageBadgeLabel(panels: PanelSpec[]): string {
  const pending = panels.filter((p) => !p.imageUrl).length;
  if (pending === 0) return "AI Image";
  if (pending === panels.length) return "AI Image · upgrading…";
  return `AI Image · ${panels.length - pending}/${panels.length}`;
}

export default function FigureRenderer({
  plan,
  compact = false,
  whiteBackground = false,
  fullSize = false,
  hideBadge = false,
  preview = false,
  enriching = false,
}: FigureRendererProps) {
  const panels = plan.panels || [];
  const palette = plan.colorPalette?.length ? plan.colorPalette : PALETTE;
  const mode: GenerationMode = plan.mode || "smart";
  const badge = modeBadge[mode];
  const badgeLabel = mode === "image" ? imageBadgeLabel(panels) : badge.label;

  const isImageMode = mode === "image";
  const awaitingImages = enriching || (isImageMode && panels.some((p) => !p.imageUrl));

  if (panels.length === 0) return null;

  const isSingle = panels.length === 1;
  const singleImage =
    isSingle && !!panels[0].imageUrl && (mode === "image" || mode === "smart");
  const cols = panels.length <= 2 ? panels.length : panels.length <= 4 ? 2 : panels.length <= 6 ? 3 : 4;

  const bg = whiteBackground ? "bg-white" : "bg-[#080C1C]";
  const titleColor = whiteBackground ? "text-gray-900" : "text-white";
  const titleSize = preview ? "text-base" : "text-sm";
  const legendBg = whiteBackground ? "bg-gray-50 border-gray-200" : "bg-white/[0.02] border-white/8";
  const legendText = whiteBackground ? "text-gray-800" : "text-zinc-400";
  const legendSize = preview ? "text-sm leading-relaxed" : "text-[10px]";
  const panelBg = whiteBackground ? "bg-white" : "bg-[#080C1C]";
  const panelInnerBg = whiteBackground ? "bg-white" : "bg-[#050810]";
  const descText = whiteBackground ? "text-gray-700" : "text-zinc-500";
  const descSize = preview ? "text-sm" : "text-[9px]";
  const labelSize = preview ? "text-sm" : "text-xs";
  const outerClass = preview
    ? "w-full mx-auto"
    : "w-full";

  // Single panel — full-width layout (loading or image), avoids crushed side-by-side grid
  if (isSingle && (preview || whiteBackground || fullSize)) {
    const panel = panels[0];
    const color = panel.color || palette[0];
    return (
      <div className={`${outerClass} ${bg} rounded-lg`}>
        <div className="flex items-start justify-between gap-2 mb-3 px-1">
          {plan.title && (
            <h3
              className={`${titleSize} font-bold leading-snug ${titleColor}`}
              data-editable-id="title"
            >
              {plan.title}
            </h3>
          )}
          {!hideBadge && (
            <span
              className="export-exclude flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={{ background: badge.color + "20", color: badge.color, border: `1px solid ${badge.color}30` }}
            >
              {badge.icon} {badgeLabel}
            </span>
          )}
        </div>
        <div className={`rounded-xl overflow-hidden border border-gray-200 ${panelInnerBg}`}>
          <PanelContent
            panel={panel}
            color={color}
            compact={compact}
            index={0}
            mode={mode}
            fullSize={fullSize}
            preview={preview}
            enriching={awaitingImages}
            single
          />
        </div>
        {panel.description && (
          <p
            className={`mt-3 ${descSize} leading-relaxed px-1 ${descText}`}
            data-editable="caption"
            data-editable-id="caption"
          >
            {panel.description}
          </p>
        )}
        {plan.legend && (
          <div className={`mt-4 p-4 rounded-xl border ${legendBg}`} data-editable="legend" data-editable-id="legend">
            <p className={`${legendSize} italic ${legendText}`}>{plan.legend}</p>
          </div>
        )}
      </div>
    );
  }

  // Legacy single-image path (non-preview)
  if (singleImage && (fullSize || whiteBackground)) {
    const panel = panels[0];
    return (
      <div className={`${outerClass} ${bg} rounded-lg`}>
        <div className="flex items-start justify-between gap-2 mb-3 px-1">
          {plan.title && (
            <h3
              className={`${titleSize} font-bold leading-snug ${titleColor}`}
              data-editable-id="title"
            >
              {plan.title}
            </h3>
          )}
          {!hideBadge && (
            <span
              className="export-exclude flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={{ background: badge.color + "20", color: badge.color, border: `1px solid ${badge.color}30` }}
            >
              {badge.icon} {badgeLabel}
            </span>
          )}
        </div>
        <div className={`rounded-xl overflow-hidden border border-gray-200 ${panelInnerBg}`}>
          <ImagePanel imageUrl={panel.imageUrl!} description={panel.description} fullSize preview={preview} panelId={panel.id} />
        </div>
        {panel.description && (
          <p
            className={`mt-2 ${descSize} leading-relaxed px-1 ${descText}`}
            data-editable="caption"
            data-editable-id="caption"
          >
            {panel.description}
          </p>
        )}
        {plan.legend && (
          <div className={`mt-3 p-3.5 rounded-xl border ${legendBg}`} data-editable="legend" data-editable-id="legend">
            <p className={`${legendSize} leading-relaxed italic ${legendText}`}>{plan.legend}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${outerClass} ${bg} rounded-lg`}>
      {/* Figure title + mode badge */}
      <div className="flex items-start justify-between gap-2 mb-3 px-1">
        {plan.title && (
          <h3 className={`${titleSize} font-bold leading-snug ${titleColor}`}>{plan.title}</h3>
        )}
        {!hideBadge && (
          <span
            className="export-exclude flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
            style={{ background: badge.color + "20", color: badge.color, border: `1px solid ${badge.color}30` }}
          >
            {badge.icon} {badgeLabel}
          </span>
        )}
      </div>

      {/* Panels grid — preview stacks vertically so panels are never crushed side-by-side */}
      <div
        className={preview ? "grid gap-5 grid-cols-1" : "grid gap-3"}
        style={preview ? undefined : { gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {panels.map((panel, i) => {
          const color = panel.color || palette[i % palette.length];
          return (
            <div
              key={panel.id || i}
              className={`rounded-xl overflow-hidden border ${panelBg}`}
              style={{ borderColor: whiteBackground ? "#e5e7eb" : color + "30" }}
            >
              {/* Panel label bar */}
              <div
                className="flex items-center justify-between px-2.5 py-1.5 border-b"
                style={{
                  borderColor: whiteBackground ? "#e5e7eb" : color + "20",
                  backgroundColor: whiteBackground ? "#f9fafb" : color + "12",
                }}
              >
                <span className={`${labelSize} font-bold`} style={{ color: whiteBackground ? "#374151" : color }}>
                  {panel.label}
                </span>
                <span className={`${preview ? "text-[11px]" : "text-[9px]"} truncate ml-2 max-w-[80%] ${whiteBackground ? "text-gray-600" : "text-zinc-600"}`}>
                  {panel.type}
                </span>
              </div>

              {/* Visual panel */}
              <div
                className={`${compact ? "p-1.5" : "p-2"} ${panelInnerBg} flex items-center justify-center`}
                style={{ minHeight: preview ? 360 : compact ? 160 : fullSize ? undefined : 210 }}
              >
                <PanelContent
                  panel={panel}
                  color={color}
                  compact={compact}
                  index={i}
                  mode={mode}
                  fullSize={fullSize}
                  preview={preview}
                  enriching={awaitingImages}
                />
              </div>

              {/* Description */}
              <div className="px-2.5 py-1.5 border-t" style={{ borderColor: whiteBackground ? "#e5e7eb" : color + "15" }}>
                <p className={`${descSize} leading-relaxed line-clamp-3 ${descText}`}>{panel.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Figure legend */}
      {plan.legend && (
        <div className={`mt-4 p-3.5 rounded-xl border ${legendBg}`}>
          <p className={`${legendSize} leading-relaxed italic ${legendText}`}>{plan.legend}</p>
        </div>
      )}
    </div>
  );
}
