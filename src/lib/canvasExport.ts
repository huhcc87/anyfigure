import type { CanvasElement } from "@/types";
import { fitLabelFontSize } from "@/lib/makeEditable/imageRegionUtils";

const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const SLIDE_MARGIN = 0.2;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function toSlideRect(
  x: number, y: number, w: number, h: number,
  canvasW: number, canvasH: number
) {
  const usableW = SLIDE_W - SLIDE_MARGIN * 2;
  const usableH = SLIDE_H - SLIDE_MARGIN * 2;
  const scale = Math.min(usableW / canvasW, usableH / canvasH);
  return {
    x: SLIDE_MARGIN + x * scale,
    y: SLIDE_MARGIN + y * scale,
    w: Math.max(w * scale, 0.08),
    h: Math.max(h * scale, 0.08),
  };
}

function hexRgb(c?: string): string {
  if (!c) return "6366F1";
  const h = c.replace("#", "");
  return h.length >= 6 ? h.slice(0, 6) : "6366F1";
}

function fillStyle(c?: string): { color: string; transparency: number } {
  if (!c) return { color: "6366F1", transparency: 80 };
  const h = c.replace("#", "");
  if (h.length === 8) {
    const alpha = parseInt(h.slice(6, 8), 16);
    return { color: h.slice(0, 6), transparency: Math.round((1 - alpha / 255) * 100) };
  }
  if (h.length === 6 && h.endsWith("25")) {
    return { color: h.slice(0, 6), transparency: 85 };
  }
  return { color: h.slice(0, 6), transparency: 75 };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

function applyTextStyle(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  const role = el.textRole;
  if (role === "title") {
    ctx.font = "700 18px system-ui, sans-serif";
    ctx.fillStyle = "#111827";
  } else if (role === "legend") {
    ctx.font = "italic 11px system-ui, sans-serif";
    ctx.fillStyle = "#374151";
  } else if (role === "caption") {
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "#4B5563";
  } else if (role === "label") {
    ctx.font = "700 13px system-ui, sans-serif";
    ctx.fillStyle = el.fill || "#6366f1";
  } else {
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "#111827";
  }
}

async function drawElement(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  flatExport: boolean
): Promise<void> {
  const drawRef = flatExport && el.partRole === "reference";
  if (!el.visible && !drawRef) return;

  ctx.save();
  ctx.globalAlpha = drawRef ? 1 : el.opacity;

  if (el.type === "image" && el.content) {
    try {
      const img = await loadImage(el.content);
      ctx.drawImage(img, el.x, el.y, el.width, el.height);
    } catch {
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(el.x, el.y, el.width, el.height);
    }
  } else if (el.type === "text") {
    if (el.partRole === "detected") {
      const pad = 4;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(el.x - pad, el.y - pad, el.width + pad * 2, el.height + pad * 2);
      const text = el.content || el.label || "";
      const fontSize = fitLabelFontSize(text, el.width, el.height);
      ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = el.fill || "#111827";
      ctx.textBaseline = "middle";
      ctx.fillText(text, el.x + 2, el.y + el.height / 2);
      ctx.textBaseline = "alphabetic";
    } else {
      applyTextStyle(ctx, el);
      const lines = wrapText(ctx, el.content || el.label || "", el.width - 8);
      const lineHeight = el.textRole === "title" ? 22 : el.textRole === "legend" ? 15 : 14;
      lines.forEach((line, i) => {
        ctx.fillText(line, el.x + 4, el.y + 16 + i * lineHeight);
      });
    }
  } else if (el.type === "shape") {
    ctx.fillStyle = el.fill || "#6366f125";
    ctx.strokeStyle = el.stroke || "#6366f1";
    ctx.lineWidth = el.strokeWidth || 1.5;
    if (el.shapeKind === "ellipse" || el.shapeKind === "marker") {
      ctx.beginPath();
      ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      if (el.opacity < 1) ctx.setLineDash([3, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
      if (el.label && el.shapeKind === "marker") {
        ctx.font = "8px system-ui, sans-serif";
        ctx.fillStyle = el.stroke || el.fill || "#374151";
        ctx.textAlign = "center";
        ctx.fillText(el.label, el.x + el.width / 2, el.y - 2);
        ctx.textAlign = "start";
      }
    } else if (el.shapeKind === "nucleosome") {
      const rx = el.width / 2;
      const ry = el.height / 2;
      ctx.beginPath();
      ctx.ellipse(el.x + rx, el.y + ry, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(el.x, el.y, el.width, el.height);
      ctx.strokeRect(el.x, el.y, el.width, el.height);
      if (el.label || el.content) {
        ctx.font = "10px system-ui, sans-serif";
        ctx.fillStyle = "#374151";
        ctx.textAlign = "center";
        ctx.fillText((el.label || el.content || "").slice(0, 40), el.x + el.width / 2, el.y + el.height / 2 + 4);
        ctx.textAlign = "start";
      }
    }
  } else if (el.type === "arrow") {
    ctx.strokeStyle = el.stroke || "#6366f1";
    ctx.fillStyle = el.stroke || "#6366f1";
    ctx.lineWidth = 2.5;
    const from = el.lineFrom || { x: el.x, y: el.y + el.height / 2 };
    const to = el.lineTo || { x: el.x + el.width, y: el.y + el.height / 2 };
    if (el.arrowKind === "inhibit") ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
    if (el.arrowKind === "inhibit") {
      ctx.beginPath();
      ctx.moveTo(to.x - 6, to.y - 6);
      ctx.lineTo(to.x + 6, to.y + 6);
      ctx.stroke();
    } else {
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - 10 * Math.cos(angle - 0.4), to.y - 10 * Math.sin(angle - 0.4));
      ctx.lineTo(to.x - 10 * Math.cos(angle + 0.4), to.y - 10 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
    }
    if (el.label) {
      ctx.font = "9px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(el.label, (from.x + to.x) / 2, Math.min(from.y, to.y) - 4);
      ctx.textAlign = "start";
    }
  }

  ctx.restore();
}

/** Render editor elements to PNG — flatExport draws hidden AI reference at full opacity. */
export async function exportElementsToPng(
  elements: CanvasElement[],
  width: number,
  height: number,
  pixelRatio = 2,
  flatExport = true
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.scale(pixelRatio, pixelRatio);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  if (flatExport) {
    for (const el of sorted.filter((e) => e.partRole === "reference" && e.content)) {
      await drawElement(ctx, el, true);
    }
  }

  for (const el of sorted.filter((e) => e.partRole !== "reference" || !flatExport)) {
    await drawElement(ctx, el, flatExport);
  }

  return canvas.toDataURL("image/png");
}

export async function exportElementsToJpeg(
  elements: CanvasElement[],
  width: number,
  height: number,
  pixelRatio = 2,
  quality = 0.92
): Promise<string> {
  const png = await exportElementsToPng(elements, width, height, pixelRatio, true);
  const img = await loadImage(png);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function exportElementsToPdf(
  elements: CanvasElement[],
  width: number,
  height: number,
  pixelRatio = 2
): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const dataUrl = await exportElementsToPng(elements, width, height, pixelRatio, true);
  const imgBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
  const pdf = await PDFDocument.create();
  const img = await pdf.embedPng(imgBytes);
  const page = pdf.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  return pdf.save();
}

/** Export editable PPTX — each text box, shape, arrow, and image is a separate PowerPoint object. */
export async function exportElementsToPptx(
  elements: CanvasElement[],
  width: number,
  height: number
): Promise<Blob> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "FIGURE", width: SLIDE_W, height: SLIDE_H });
  pptx.layout = "FIGURE";
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // If this is a RASTER figure (a full-figure background image), the image
  // already has crisp baked-in text from the generator. Overlaying the
  // OCR-detected labels on top doubles the text and (with imperfect bboxes)
  // scatters it — so for raster figures we export the clean image + the
  // structured title/legend only, and DROP the detected overlays. Vector
  // figures (no background image) keep every element, since those are real
  // editable primitives, not OCR guesses.
  const hasRasterFigure = sorted.some((e) => e.type === "image" && e.partRole === "figure");
  const exportList = sorted.filter((e) => {
    if (hasRasterFigure && e.partRole === "detected") return false;
    return e.visible || (e.partRole === "reference" && !!e.content);
  });

  for (const el of exportList) {
    const rect = toSlideRect(el.x, el.y, el.width, el.height, width, height);

    if (el.type === "text") {
      const fontSize = el.textRole === "title" ? 16 : el.textRole === "legend" ? 9 : el.textRole === "label" ? 11 : 10;
      slide.addText(el.content || el.label || "", {
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: Math.max(rect.h, 0.25),
        fontSize,
        bold: el.textRole === "title" || el.textRole === "label",
        italic: el.textRole === "legend",
        color: hexRgb(el.fill || "111827"),
        valign: "top",
        margin: 0,
      });
    } else if (el.type === "image" && el.content) {
      slide.addImage({
        data: el.content,
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: rect.h,
      });
    } else if (el.type === "shape") {
      const fill = fillStyle(el.fill || el.stroke);
      const isRound = el.shapeKind === "ellipse" || el.shapeKind === "marker" || el.shapeKind === "nucleosome";
      slide.addShape(isRound ? pptx.ShapeType.ellipse : pptx.ShapeType.roundRect, {
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: rect.h,
        fill: { color: fill.color, transparency: el.shapeKind === "marker" ? 10 : fill.transparency },
        line: { color: hexRgb(el.stroke || "6366F1"), width: 1, dashType: el.opacity < 1 ? "dash" : "solid" },
        rectRadius: 0.05,
      });
      const label = el.label || el.content;
      if (label && el.shapeKind !== "nucleosome") {
        slide.addText(label, {
          x: rect.x,
          y: el.shapeKind === "marker" ? rect.y - 0.15 : rect.y + rect.h / 2 - 0.12,
          w: rect.w,
          h: 0.24,
          fontSize: el.shapeKind === "marker" ? 6 : 8,
          align: "center",
          color: hexRgb(el.stroke || el.fill || "374151"),
        });
      }
    } else if (el.type === "arrow") {
      const from = el.lineFrom || { x: el.x, y: el.y + el.height / 2 };
      const to = el.lineTo || { x: el.x + el.width, y: el.y + el.height / 2 };
      const rFrom = toSlideRect(from.x, from.y, 1, 1, width, height);
      const rTo = toSlideRect(to.x, to.y, 1, 1, width, height);
      slide.addShape(pptx.ShapeType.line, {
        x: rFrom.x,
        y: rFrom.y,
        w: rTo.x - rFrom.x,
        h: rTo.y - rFrom.y,
        line: {
          color: hexRgb(el.stroke || "6366F1"),
          width: 1.5,
          dashType: el.arrowKind === "inhibit" ? "dash" : "solid",
          endArrowType: el.arrowKind === "inhibit" ? "none" : "triangle",
        },
      });
      if (el.label) {
        slide.addText(el.label, {
          x: rect.x,
          y: Math.max(rect.y - 0.2, 0.05),
          w: rect.w,
          h: 0.2,
          fontSize: 7,
          align: "center",
          color: hexRgb(el.stroke || "6366F1"),
        });
      }
    } else if (el.type === "biomedical" || el.type === "pathway" || el.type === "chart") {
      // Vector biomedical assets render on-canvas as a rounded box with an
      // emoji glyph + label. Export the SAME as native PPT objects so the
      // figure is complete AND every piece stays editable: a rounded rect,
      // the emoji as text, and the label as a separate editable text box.
      const f = fillStyle(el.fill || "EEF2FF");
      slide.addShape(pptx.ShapeType.roundRect, {
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: rect.h,
        fill: { color: f.color, transparency: Math.max(f.transparency, 85) },
        line: { color: hexRgb(el.stroke || "6366F1"), width: 1 },
        rectRadius: 0.05,
      });
      if (el.assetEmoji) {
        slide.addText(el.assetEmoji, {
          x: rect.x,
          y: rect.y + rect.h * 0.12,
          w: rect.w,
          h: rect.h * 0.5,
          fontSize: Math.min(28, Math.max(12, Math.round(rect.h * 40))),
          align: "center",
          valign: "middle",
        });
      }
      const bioLabel = el.label || el.scientificName;
      if (bioLabel) {
        slide.addText(bioLabel, {
          x: rect.x,
          y: rect.y + rect.h * 0.62,
          w: rect.w,
          h: rect.h * 0.32,
          fontSize: 9,
          bold: true,
          align: "center",
          valign: "middle",
          color: hexRgb(el.stroke || "374151"),
        });
      }
    }
  }

  return (await pptx.write({ outputType: "blob" })) as Blob;
}

/** Fallback: capture DOM node (must contain all figure children). */
export async function exportDomToPng(
  element: HTMLElement,
  pixelRatio = 2,
  backgroundColor = "#ffffff"
): Promise<string> {
  const { toPng } = await import("html-to-image");
  return toPng(element, {
    pixelRatio,
    backgroundColor,
    cacheBust: true,
    filter: (node) => {
      if (node instanceof Element && node.classList.contains("export-exclude")) return false;
      return true;
    },
  });
}
