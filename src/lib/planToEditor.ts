import type { FigurePlan, PanelSpec } from "@/components/figures/FigureRenderer";
import type { TextRegionManifest } from "@/types/detectedText";
import type { AssemblyElement } from "@/components/figures/assembly/BioAssets";
import { getPanelScene } from "@/lib/panelScenes";
import { getPanelTextManifest, mapPixelBboxToLayout, sanitizeBbox } from "@/lib/makeEditable/imageRegionUtils";
import type { CanvasElement } from "@/types";
import { generateId } from "@/lib/utils";

const CANVAS_W = 1600;
const MARGIN = 48;
const TITLE_H = 52;
const GAP = 20;
const SCENE_W = 500;
const SCENE_H = 360;

function estimateTextHeight(text: string, width: number, lineHeight = 16): number {
  const charsPerLine = Math.max(40, Math.floor(width / 6.5));
  const lines = Math.ceil(text.length / charsPerLine);
  return Math.max(48, lines * lineHeight + 16);
}

function gridCols(count: number): number {
  if (count <= 1) return 1;
  if (count <= 2) return 2;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

function panelLayout(panels: PanelSpec[], startY: number, areaH: number) {
  const cols = gridCols(panels.length);
  const rows = Math.ceil(panels.length / cols);
  const innerW = CANVAS_W - MARGIN * 2;
  const cellW = (innerW - GAP * (cols - 1)) / cols;
  const cellH = (areaH - GAP * (rows - 1)) / rows;

  return panels.map((panel, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      panel,
      x: MARGIN + col * (cellW + GAP),
      y: startY + row * (cellH + GAP),
      width: cellW,
      height: cellH,
    };
  });
}

function assemblyToCanvas(
  elements: AssemblyElement[],
  offsetX: number,
  offsetY: number,
  scale: number,
  zStart: number,
  partsVisible = true
): { items: CanvasElement[]; nextZ: number } {
  const items: CanvasElement[] = [];
  let z = zStart;

  for (const el of elements) {
    switch (el.type) {
      case "label":
        items.push({
          id: generateId("lbl"),
          type: "text",
          x: offsetX + el.x * scale - 50,
          y: offsetY + el.y * scale - 12,
          width: Math.max(100, (el.text.length * 7) * scale),
          height: Math.max(20, (el.size || 9) + 10),
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: partsVisible,
          content: el.text,
          fill: el.color,
          textRole: "label",
          partRole: "part",
          zIndex: z++,
        });
        break;
      case "protein":
      case "box":
        items.push({
          id: generateId("prt"),
          type: "shape",
          shapeKind: "rect",
          partRole: "part",
          x: offsetX + (el.type === "protein" ? el.x - el.w / 2 : el.x) * scale,
          y: offsetY + (el.type === "protein" ? el.y - el.h / 2 : el.y) * scale,
          width: el.w * scale,
          height: el.h * scale,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: partsVisible,
          label: el.type === "protein" ? el.label : el.label || "Box",
          content: el.type === "protein" ? el.label : el.label,
          fill: (el.color || "#6366f1") + "25",
          stroke: el.color || "#6366f1",
          strokeWidth: 1.5,
          zIndex: z++,
        });
        break;
      case "cell":
      case "tcell":
      case "tumor":
      case "macrophage":
      case "organoid": {
        const r = "r" in el ? el.r : 24;
        items.push({
          id: generateId("cell"),
          type: "shape",
          shapeKind: "ellipse",
          partRole: "part",
          x: offsetX + (el.x - r) * scale,
          y: offsetY + (el.y - r) * scale,
          width: r * 2 * scale,
          height: r * 2 * scale,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: partsVisible,
          label: el.type === "cell" ? el.label : el.type.replace("tcell", "T cell"),
          fill: ("color" in el ? el.color : "#6366f1") + "25",
          stroke: "color" in el ? el.color : "#6366f1",
          strokeWidth: 1.5,
          zIndex: z++,
        });
        break;
      }
      case "arrow":
      case "inhibit": {
        const x1 = offsetX + el.x1 * scale;
        const y1 = offsetY + el.y1 * scale;
        const x2 = offsetX + el.x2 * scale;
        const y2 = offsetY + el.y2 * scale;
        const pad = 12;
        items.push({
          id: generateId("arr"),
          type: "arrow",
          partRole: "part",
          x: Math.min(x1, x2) - pad,
          y: Math.min(y1, y2) - pad,
          width: Math.max(Math.abs(x2 - x1) + pad * 2, 24),
          height: Math.max(Math.abs(y2 - y1) + pad * 2, 24),
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: partsVisible,
          label: el.type === "inhibit" ? (el.label || "⊣ inhibit") : (el.label || ""),
          stroke: el.type === "arrow" ? el.color : "#EF4444",
          arrowKind: el.type === "inhibit" ? "inhibit" : "activate",
          lineFrom: { x: x1, y: y1 },
          lineTo: { x: x2, y: y2 },
          zIndex: z++,
        });
        break;
      }
      case "marker": {
        const r = el.r * scale;
        items.push({
          id: generateId("mrk"),
          type: "shape",
          shapeKind: "marker",
          partRole: "part",
          x: offsetX + el.x * scale - r,
          y: offsetY + el.y * scale - r,
          width: r * 2,
          height: r * 2,
          rotation: 0,
          opacity: el.dashed ? 0.45 : 1,
          locked: false,
          visible: partsVisible,
          label: el.label || "",
          content: el.label || "",
          fill: el.color,
          stroke: el.color,
          strokeWidth: el.dashed ? 1 : 2,
          zIndex: z++,
        });
        break;
      }
      case "nucleosome":
        items.push({
          id: generateId("nuc"),
          type: "shape",
          shapeKind: "nucleosome",
          partRole: "part",
          x: offsetX + el.x * scale,
          y: offsetY + el.y * scale,
          width: el.w * scale,
          height: el.h * scale,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: partsVisible,
          label: "Nucleosome",
          fill: (el.color || "#3B82F6") + "40",
          stroke: el.color || "#3B82F6",
          strokeWidth: 1.5,
          zIndex: z++,
        });
        break;
      case "dna":
        items.push({
          id: generateId("dna"),
          type: "shape",
          shapeKind: "rect",
          partRole: "part",
          x: offsetX + (el.x - 20) * scale,
          y: offsetY + el.y * scale,
          width: 40 * scale,
          height: el.height * scale,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: partsVisible,
          label: "DNA",
          fill: (el.color || "#6366f1") + "15",
          stroke: el.color || "#6366f1",
          strokeWidth: 1.5,
          zIndex: z++,
        });
        break;
      default:
        break;
    }
  }

  return { items, nextZ: z };
}

function getSceneElements(panel: PanelSpec, planTitle?: string): AssemblyElement[] {
  if (panel.assemblyElements?.length) return panel.assemblyElements;
  const desc = [planTitle, panel.description].filter(Boolean).join(" ");
  return getPanelScene(panel.chartType, desc, panel.dataContext).elements;
}

function addDiagramParts(
  elements: CanvasElement[],
  panel: PanelSpec,
  x: number,
  y: number,
  width: number,
  height: number,
  zStart: number,
  planTitle?: string,
  partsVisible = true
): number {
  const scene = getSceneElements(panel, planTitle);
  if (!scene.length) return zStart;
  const scale = Math.min(width / SCENE_W, height / SCENE_H);
  const { items, nextZ } = assemblyToCanvas(scene, x, y, scale, zStart, partsVisible);
  elements.push(...items);
  return nextZ;
}

/** Add vision-detected labels as editable text on top of the figure image (pixel manifest).
 *  IMPORTANT: Imports ALL detected labels so every label is independently editable in the canvas
 *  (FigureLabs-style). The renderer auto-masks detected labels with a white background so the
 *  baked-in raster text underneath is hidden — click any label to edit, drag, resize, recolor. */
function addDetectedLabelsFromManifest(
  elements: CanvasElement[],
  manifest: TextRegionManifest,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number,
  zStart: number
): number {
  let z = zStart;
  for (const r of manifest.regions) {
    if (!r.text || !r.text.trim()) continue;
    const bbox = sanitizeBbox(r.bbox, r.text, manifest.imageWidth, manifest.imageHeight);
    const layout = mapPixelBboxToLayout(bbox, manifest.imageWidth, manifest.imageHeight, imgW, imgH, imgX, imgY);
    // AGGRESSIVE expansion — Gemini Vision bboxes hug glyph centers in a
    // small (~10-12 pt) box, but the actual rendered raster text in the
    // image is often 16-32 pt with anti-aliased halos. To fully OBLITERATE
    // the original baked-in text, we grow the element by ~85% width and
    // ~110% height, centered on the bbox center (symmetric growth).
    //
    // Yes the elements will overlap each other in dense diagrams. That is
    // the right trade-off — the user sees ONE clean label per region
    // instead of a duplicate (original-baked + small-edited).
    const estimatedW = r.text.length * Math.max(10, layout.h * 1.05) * 0.6 + 16;
    const baseW = Math.max(layout.w, estimatedW);
    const baseH = Math.max(layout.h, Math.max(10, layout.h * 1.05) * 1.6);
    const padX = Math.max(36, baseW * 0.85);
    const padY = Math.max(24, baseH * 1.1);
    const cx = layout.x + layout.w / 2;
    const cy = layout.y + layout.h / 2;
    const finalW = baseW + padX * 2;
    const finalH = baseH + padY * 2;
    elements.push({
      id: r.id,
      type: "text",
      // NOTE: do NOT set textRole: "label" — that branch in textStyles forces fixed 13px
      // font and wraps text in narrow bboxes. partRole "detected" gives proportional sizing.
      partRole: "detected",
      x: Math.max(0, cx - finalW / 2),
      y: Math.max(0, cy - finalH / 2),
      width: finalW,
      height: finalH,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: r.text,
      // Sentinel for "no edit applied yet" — InfiniteCanvas uses this to
      // decide whether to show a transparent click target (FigureLabs style)
      // or a white mask with new text (only after user edits).
      originalContent: r.text,
      fill: "#111827",
      zIndex: z++,
    });
  }
  return Math.max(z, zStart + 1);
}

/** Add panel content — AI image panels show the raster + detected text labels. */
function addPanelContent(
  elements: CanvasElement[],
  panel: PanelSpec,
  x: number,
  y: number,
  width: number,
  height: number,
  zStart: number,
  planTitle?: string
): number {
  if (panel.imageUrl) {
    elements.push({
      id: generateId("fig"),
      type: "image",
      partRole: "figure",
      x,
      y,
      width,
      height,
      rotation: 0,
      opacity: 1,
      locked: true,
      visible: true,
      content: panel.imageUrl,
      label: panel.label ? `Panel ${panel.label}` : "Figure",
      zIndex: zStart,
    });
    const manifest = getPanelTextManifest(panel);
    if (manifest?.regions.length) {
      return addDetectedLabelsFromManifest(elements, manifest, x, y, width, height, zStart + 200);
    }
    return zStart + 1;
  }

  return addDiagramParts(elements, panel, x, y, width, height, zStart, planTitle, true);
}

const AI_PANEL_H = 600;
const AI_LABEL_H = 32;

/** Import multi/single panel AI image figures — matches studio preview layout. */
function importAiImagePlan(plan: FigurePlan, panels: PanelSpec[]) {
  const elements: CanvasElement[] = [];
  const diagramW = CANVAS_W - MARGIN * 2;
  let y = MARGIN;

  if (plan.title) {
    elements.push({
      id: generateId("title"),
      type: "text",
      textRole: "title",
      x: MARGIN,
      y,
      width: diagramW,
      height: TITLE_H,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: plan.title,
      zIndex: 300,
    });
    y += TITLE_H + GAP;
  }

  const cols = gridCols(panels.length);
  const rows = Math.ceil(panels.length / cols);
  const cellW = (diagramW - GAP * (cols - 1)) / cols;
  const panelH = panels.length === 1 ? 900 : AI_PANEL_H;
  let z = 10;

  panels.forEach((panel, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = MARGIN + col * (cellW + GAP);
    const py = y + row * (panelH + GAP);

    if (panels.length > 1) {
      elements.push({
        id: generateId("label"),
        type: "text",
        textRole: "label",
        x,
        y: py,
        width: cellW,
        height: AI_LABEL_H,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        content: panel.label,
        zIndex: 150,
      });
    }

    const contentY = panels.length > 1 ? py + AI_LABEL_H : py;
    const contentH = panels.length > 1 ? panelH - AI_LABEL_H : panelH;

    z = addPanelContent(elements, panel, x, contentY, cellW, contentH, z, plan.title);

    if (panel.description?.trim() && !plan.legend?.trim()) {
      const capH = estimateTextHeight(panel.description, cellW, 12);
      elements.push({
        id: generateId("caption"),
        type: "text",
        textRole: "caption",
        x,
        y: py + panelH + 4,
        width: cellW,
        height: capH,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        content: panel.description,
        zIndex: 310,
      });
    }
  });

  y += rows * (panelH + GAP);

  const legendText = plan.legend?.trim() || "";
  if (legendText) {
    const legendH = estimateTextHeight(legendText, diagramW, 14);
    elements.push({
      id: generateId("legend"),
      type: "text",
      textRole: "legend",
      x: MARGIN,
      y,
      width: diagramW,
      height: legendH,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: legendText,
      zIndex: 320,
    });
    y += legendH + GAP;
  }

  const canvasHeight = Math.max(900, y + MARGIN);
  return { elements, canvasWidth: CANVAS_W, canvasHeight };
}

/** Convert an AI Studio figure plan into editable canvas elements (white paper). */
export function importFigurePlan(plan: FigurePlan): {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
} {
  const panels = plan.panels || [];
  const panelsWithImages = panels.filter((p) => p.imageUrl);
  const isAiImageFigure =
    plan.mode === "image" ||
    (panelsWithImages.length > 0 && panelsWithImages.length === panels.length);

  if (isAiImageFigure && panelsWithImages.length > 0) {
    return importAiImagePlan(plan, panels);
  }

  const elements: CanvasElement[] = [];
  let z = 10;

  const legendText = plan.legend?.trim() || "";
  const hasLegend = legendText.length > 0;
  const legendH = hasLegend ? estimateTextHeight(legendText, CANVAS_W - MARGIN * 2, 14) : 0;

  const singlePanel = panels.length === 1 ? panels[0] : null;
  const singleHasImage = !!singlePanel?.imageUrl;
  const hasCaption = !!singlePanel?.description?.trim();
  const captionH = hasCaption ? estimateTextHeight(singlePanel!.description, CANVAS_W - MARGIN * 2, 14) : 0;

  const showTitleText = !!plan.title && !singleHasImage;
  const contentTop = MARGIN + (showTitleText ? TITLE_H + GAP : 0);
  const contentBottom = (hasLegend ? legendH + GAP : 0) + (hasCaption ? captionH + GAP : 0) + MARGIN;
  const contentH = Math.max(420, 900 - contentTop - contentBottom);
  const diagramX = MARGIN;
  const diagramW = CANVAS_W - MARGIN * 2;

  if (showTitleText && plan.title) {
    elements.push({
      id: generateId("title"),
      type: "text",
      textRole: "title",
      x: MARGIN,
      y: MARGIN,
      width: diagramW,
      height: TITLE_H,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: plan.title,
      zIndex: 300,
    });
  }

  if (singlePanel) {
    if (singleHasImage) {
      z = addPanelContent(elements, singlePanel, diagramX, contentTop, diagramW, contentH, 10, plan.title);
    } else {
      z = addDiagramParts(elements, singlePanel, diagramX, contentTop, diagramW, contentH, 50, plan.title, true);
    }
  } else {
    const layouts = panelLayout(panels, contentTop, contentH);
    for (const { panel, x, y, width, height } of layouts) {
      elements.push({
        id: generateId("label"),
        type: "text",
        textRole: "label",
        partRole: "part",
        x, y,
        width: 48,
        height: 28,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        content: panel.label,
        zIndex: 150,
      });
      z = addPanelContent(elements, panel, x, y + 32, width, height - 32, z, plan.title);
    }
  }

  let footerY = contentTop + contentH + GAP;

  if (hasCaption && singlePanel) {
    elements.push({
      id: generateId("caption"),
      type: "text",
      textRole: "caption",
      x: MARGIN,
      y: footerY,
      width: diagramW,
      height: captionH,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: singlePanel.description,
      zIndex: 310,
    });
    footerY += captionH + GAP;
  }

  if (hasLegend) {
    elements.push({
      id: generateId("legend"),
      type: "text",
      textRole: "legend",
      x: MARGIN,
      y: footerY,
      width: diagramW,
      height: legendH,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: legendText,
      zIndex: 320,
    });
    footerY += legendH;
  }

  const canvasHeight = Math.max(900, footerY + MARGIN);

  return { elements, canvasWidth: CANVAS_W, canvasHeight };
}
