import type { CanvasElement } from "@/types";

// ponytail: hex8 → fill + fill-opacity; no external dep
function parseFill(color?: string): { fill: string; opacity: number } {
  if (!color) return { fill: "none", opacity: 1 };
  const h = color.replace("#", "");
  if (h.length === 8) {
    const alpha = parseInt(h.slice(6, 8), 16) / 255;
    return { fill: `#${h.slice(0, 6)}`, opacity: Math.round(alpha * 100) / 100 };
  }
  return { fill: color, opacity: 1 };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function attrs(el: CanvasElement): string {
  return `id="el-${esc(el.id)}" data-object-id="${esc(el.id)}" data-object-type="${esc(el.type)}" data-object-name="${esc(el.label ?? "")}"`
}

function wrapTspan(text: string, x: number, lineHeight: number): string {
  const words = text.split(/\s+/);
  // ponytail: approximate 10px per char; good enough for most labels
  const maxChars = 40;
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length > maxChars && line) { lines.push(line); line = w; }
    else line = candidate;
  }
  if (line) lines.push(line);
  return lines
    .map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${esc(l)}</tspan>`)
    .join("");
}

function renderText(el: CanvasElement): string {
  const role = el.textRole;
  let fontSize = 12, fontWeight = "normal", fontStyle = "normal", color = "#111827", lineH = 14;
  if (role === "title")   { fontSize = 18; fontWeight = "700"; lineH = 22; }
  else if (role === "legend") { fontSize = 11; fontStyle = "italic"; color = "#374151"; lineH = 15; }
  else if (role === "caption") { fontSize = 11; color = "#4B5563"; }
  else if (role === "label")   { fontSize = 13; fontWeight = "700"; color = el.fill || "#6366f1"; }

  const text = el.content || el.label || "";
  const x = el.x + 4;
  const y = el.y + fontSize;

  if (el.partRole === "detected") {
    // white mask + relabeled text
    const pad = 4;
    return `<g ${attrs(el)} opacity="${el.opacity}">
  <rect x="${el.x - pad}" y="${el.y - pad}" width="${el.width + pad * 2}" height="${el.height + pad * 2}" fill="#ffffff"/>
  <text x="${el.x + 2}" y="${el.y + el.height / 2 + fontSize / 3}" font-size="${fontSize}" font-weight="600" font-family="system-ui,sans-serif" fill="${esc(el.fill || "#111827")}">${esc(text)}</text>
</g>`;
  }

  return `<text ${attrs(el)} x="${x}" y="${y}" font-size="${fontSize}" font-weight="${fontWeight}" font-style="${fontStyle}" font-family="system-ui,sans-serif" fill="${esc(color)}" opacity="${el.opacity}">${wrapTspan(text, x, lineH)}</text>`;
}

function renderShape(el: CanvasElement): string {
  const { fill, opacity: fillOpacity } = parseFill(el.fill || "#6366f125");
  const stroke = el.stroke || "#6366f1";
  const sw = el.strokeWidth ?? 1.5;
  const dash = el.opacity < 1 ? ' stroke-dasharray="3 2"' : "";
  const label = el.label || el.content || "";
  const kind = el.shapeKind;

  let shape: string;
  if (kind === "ellipse" || kind === "marker" || kind === "nucleosome") {
    const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
    const rx = el.width / 2, ry = el.height / 2;
    shape = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${esc(fill)}" fill-opacity="${fillOpacity}" stroke="${esc(stroke)}" stroke-width="${sw}"${dash}/>`;
    if (label && kind === "marker") {
      shape += `\n  <text x="${cx}" y="${el.y - 2}" text-anchor="middle" font-size="8" font-family="system-ui,sans-serif" fill="${esc(stroke)}">${esc(label)}</text>`;
    }
  } else {
    // rect / roundedRect — default rounded
    const rx = kind === "rect" ? 0 : 4;
    shape = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" fill="${esc(fill)}" fill-opacity="${fillOpacity}" stroke="${esc(stroke)}" stroke-width="${sw}"${dash}/>`;
    if (label) {
      shape += `\n  <text x="${el.x + el.width / 2}" y="${el.y + el.height / 2 + 4}" text-anchor="middle" font-size="10" font-family="system-ui,sans-serif" fill="#374151">${esc(label.slice(0, 40))}</text>`;
    }
  }

  return `<g ${attrs(el)} opacity="${el.opacity}">\n  ${shape}\n</g>`;
}

function renderArrow(el: CanvasElement): string {
  const from = el.lineFrom || { x: el.x, y: el.y + el.height / 2 };
  const to = el.lineTo || { x: el.x + el.width, y: el.y + el.height / 2 };
  const color = el.stroke || "#6366f1";
  const inhibit = el.arrowKind === "inhibit";
  const dash = inhibit ? ' stroke-dasharray="5 3"' : "";
  const marker = inhibit ? "" : ` marker-end="url(#arrowhead-activate)"`;

  let line = `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${esc(color)}" stroke-width="2.5"${dash}${marker}/>`;

  if (inhibit) {
    // T-bar at tip
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const px = -Math.sin(angle) * 6, py = Math.cos(angle) * 6;
    line += `\n  <line x1="${to.x + px}" y1="${to.y + py}" x2="${to.x - px}" y2="${to.y - py}" stroke="${esc(color)}" stroke-width="2.5"/>`;
  }

  const labelEl = el.label
    ? `\n  <text x="${(from.x + to.x) / 2}" y="${Math.min(from.y, to.y) - 4}" text-anchor="middle" font-size="9" font-family="system-ui,sans-serif" fill="${esc(color)}">${esc(el.label)}</text>`
    : "";

  return `<g ${attrs(el)} opacity="${el.opacity}">\n  ${line}${labelEl}\n</g>`;
}

function renderImage(el: CanvasElement): string {
  if (!el.content) return "";
  return `<image ${attrs(el)} href="${esc(el.content)}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" opacity="${el.opacity}" preserveAspectRatio="xMidYMid meet"/>`;
}

function renderBiomedical(el: CanvasElement): string {
  const label = el.label || el.scientificName || el.assetId || "biomedical";
  return `<g ${attrs(el)} opacity="${el.opacity}">
  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1" rx="4"/>
  <text x="${el.x + el.width / 2}" y="${el.y + el.height / 2 + 4}" text-anchor="middle" font-size="11" font-family="system-ui,sans-serif" fill="#374151">${esc(label)}</text>
</g>`;
}

function renderElement(el: CanvasElement): string {
  if (!el.visible && el.partRole !== "reference") return "";
  switch (el.type) {
    case "text":       return renderText(el);
    case "shape":      return renderShape(el);
    case "arrow":      return renderArrow(el);
    case "image":      return renderImage(el);
    case "biomedical": return renderBiomedical(el);
    default:           return "";
  }
}

const DEFS = `<defs>
  <marker id="arrowhead-activate" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L8,3 z" fill="currentColor"/>
  </marker>
  <marker id="arrowhead-inhibit" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
    <line x1="4" y1="0" x2="4" y2="6" stroke="currentColor" stroke-width="2"/>
  </marker>
</defs>`;

export function exportElementsToSvg(
  elements: CanvasElement[],
  width: number,
  height: number,
  options?: { title?: string; transparent?: boolean }
): string {
  const { title = "", transparent = false } = options ?? {};
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const meta = `<metadata>{"version":"1.0","generator":"AnyFigure","exportedAt":"${new Date().toISOString()}"}</metadata>`;
  const bg = transparent ? "" : `<rect width="${width}" height="${height}" fill="#ffffff"/>`;
  const body = sorted.map(renderElement).filter(Boolean).join("\n");

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img"${title ? ` aria-label="${esc(title)}"` : ""}>\n${meta}\n${DEFS}\n${bg}\n${body}\n</svg>`;
}

export function downloadEditableSvg(
  elements: CanvasElement[],
  width: number,
  height: number,
  filename = "figure.svg",
  options?: { title?: string; transparent?: boolean }
): void {
  const svg = exportElementsToSvg(elements, width, height, options);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
