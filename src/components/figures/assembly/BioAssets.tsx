"use client";

// Pre-built scientific SVG asset primitives
export const BioAssets = {
  // Cells
  cell: (x: number, y: number, r: number, color: string, label: string) => `
    <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="${color}15" stroke="${color}" stroke-width="1.5"/>
    <ellipse cx="${x}" cy="${y}" rx="${r * 0.4}" ry="${r * 0.35}" fill="${color}40" stroke="${color}" stroke-width="1" opacity="0.7"/>
    <text x="${x}" y="${y + r * 0.8 + 12}" text-anchor="middle" font-size="9" fill="#94A3B8" font-family="system-ui">${label}</text>
  `,
  tumorCell: (x: number, y: number, r: number) => `
    <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.9}" fill="#EF444418" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="4 2"/>
    <ellipse cx="${x}" cy="${y}" rx="${r * 0.45}" ry="${r * 0.4}" fill="#EF444440" stroke="#EF4444" stroke-width="1"/>
    <text x="${x}" y="${y - r - 6}" text-anchor="middle" font-size="8" fill="#EF4444" font-family="system-ui">Tumor cell</text>
  `,
  tCell: (x: number, y: number, r: number, active = false) => `
    <circle cx="${x}" cy="${y}" r="${r}" fill="${active ? "#6366F130" : "#6366F110"}" stroke="#6366F1" stroke-width="1.5"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.4}" fill="#6366F160"/>
    <text x="${x}" y="${y + r + 12}" text-anchor="middle" font-size="8" fill="#818CF8" font-family="system-ui">${active ? "Active T cell" : "T cell"}</text>
  `,
  macrophage: (x: number, y: number, r: number) => `
    <path d="M${x},${y - r} Q${x + r},${y - r * 0.5} ${x + r},${y} Q${x + r * 0.8},${y + r} ${x},${y + r * 0.9} Q${x - r},${y + r} ${x - r * 0.8},${y} Q${x - r},${y - r * 0.5} ${x},${y - r}Z" fill="#F59E0B18" stroke="#F59E0B" stroke-width="1.3"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="#F59E0B50"/>
    <text x="${x}" y="${y + r + 12}" text-anchor="middle" font-size="8" fill="#FCD34D" font-family="system-ui">Macrophage</text>
  `,
  // DNA / RNA
  dnaHelix: (x: number, y: number, height: number, color: string) => {
    const steps = 8;
    const stepH = height / steps;
    let path1 = "", path2 = "", rungs = "";
    for (let i = 0; i <= steps; i++) {
      const cy = y + i * stepH;
      const cx1 = x + Math.sin(i * Math.PI * 0.75) * 14;
      const cx2 = x - Math.sin(i * Math.PI * 0.75) * 14;
      if (i === 0) { path1 += `M${cx1},${cy}`; path2 += `M${cx2},${cy}`; }
      else { path1 += ` L${cx1},${cy}`; path2 += ` L${cx2},${cy}`; }
      if (i % 2 === 0 && i < steps) rungs += `<line x1="${cx1}" y1="${cy}" x2="${cx2}" y2="${cy}" stroke="${color}" stroke-width="1" opacity="0.4"/>`;
    }
    return `<path d="${path1}" fill="none" stroke="${color}" stroke-width="2"/><path d="${path2}" fill="none" stroke="${color}" stroke-width="2" opacity="0.7"/>${rungs}`;
  },
  rnaStrand: (x: number, y: number, width: number, color: string) => `
    <path d="M${x},${y} Q${x + width * 0.25},${y - 8} ${x + width * 0.5},${y} Q${x + width * 0.75},${y + 8} ${x + width},${y}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="6 2"/>
    <text x="${x + width * 0.5}" y="${y - 12}" text-anchor="middle" font-size="8" fill="${color}" font-family="system-ui">mRNA</text>
  `,
  // Proteins
  protein: (x: number, y: number, w: number, h: number, label: string, color: string) => `
    <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="6" fill="${color}20" stroke="${color}" stroke-width="1.3"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="9" fill="#E2E8F0" font-family="system-ui" font-weight="600">${label}</text>
  `,
  antibody: (x: number, y: number, color: string) => `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y + 20}" stroke="${color}" stroke-width="2"/>
    <line x1="${x}" y1="${y + 8}" x2="${x - 14}" y2="${y + 8}" stroke="${color}" stroke-width="2"/>
    <line x1="${x}" y1="${y + 8}" x2="${x + 14}" y2="${y + 8}" stroke="${color}" stroke-width="2"/>
    <circle cx="${x - 14}" cy="${y + 8}" r="3.5" fill="${color}"/>
    <circle cx="${x + 14}" cy="${y + 8}" r="3.5" fill="${color}"/>
    <circle cx="${x}" cy="${y + 20}" r="3" fill="${color}40" stroke="${color}" stroke-width="1"/>
    <text x="${x}" y="${y - 6}" text-anchor="middle" font-size="7" fill="${color}" font-family="system-ui">Ab</text>
  `,
  // Arrows
  arrow: (x1: number, y1: number, x2: number, y2: number, color: string, label?: string) => {
    const id = `arr${Math.floor(Math.random() * 9999)}`;
    const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
    return `<defs><marker id="${id}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="${color}"/></marker></defs>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" marker-end="url(#${id})" opacity="0.8"/>
    ${label ? `<text x="${midX}" y="${midY - 5}" text-anchor="middle" font-size="8" fill="${color}" font-family="system-ui">${label}</text>` : ""}`;
  },
  inhibitArrow: (x1: number, y1: number, x2: number, y2: number) => `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="5 2" opacity="0.8"/>
    <line x1="${x2 - 5}" y1="${y2}" x2="${x2 + 5}" y2="${y2}" stroke="#EF4444" stroke-width="2.5"/>
  `,
  // Labels / boxes
  labelBox: (x: number, y: number, text: string, color: string, w = 70, h = 22) => `
    <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="5" fill="${color}20" stroke="${color}" stroke-width="1.2" opacity="0.9"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="9" fill="#E2E8F0" font-family="system-ui" font-weight="600">${text}</text>
  `,
  // Organs/structures
  nucleus: (x: number, y: number, rx: number, ry: number) => `
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#6366F110" stroke="#6366F1" stroke-width="1.2" stroke-dasharray="4 2"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="8" fill="#818CF8" font-family="system-ui">Nucleus</text>
  `,
  organoid: (cx: number, cy: number, r: number) => `
    <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.75}" fill="#06B6D410" stroke="#06B6D4" stroke-width="1.5" stroke-dasharray="5 3"/>
    <text x="${cx}" y="${cy - r * 0.75 - 8}" text-anchor="middle" font-size="8" fill="#67E8F9" font-family="system-ui">PDAC Organoid</text>
  `,
};

// Assembles a panel SVG from asset descriptions returned by AI
export function assemblePanelSVG(
  panelSpec: {
    label: string;
    title: string;
    elements: AssemblyElement[];
    color?: string;
    width?: number;
    height?: number;
    background?: string;
  }
): string {
  const W = panelSpec.width || 500;
  const H = panelSpec.height || 360;
  const color = panelSpec.color || "#6366F1";
  const bg = panelSpec.background ?? "#ffffff";
  const titleFill = bg === "#ffffff" || bg === "white" ? "#111827" : "#E2E8F0";

  const arrowDef = `<defs>
    <marker id="arrow-main" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="${color}"/>
    </marker>
    <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#EF4444"/>
    </marker>
    <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#10B981"/>
    </marker>
  </defs>`;

  const elements = (panelSpec.elements || []).map(renderElement).join("\n");

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  ${arrowDef}
  <text x="${W / 2}" y="18" text-anchor="middle" font-size="10" font-weight="700" fill="${titleFill}" font-family="system-ui">${panelSpec.title || ""}</text>
  <text x="12" y="18" font-size="12" font-weight="800" fill="${color}" font-family="system-ui">${panelSpec.label}</text>
  ${elements}
</svg>`;
}

export type AssemblyElement =
  | { type: "cell"; x: number; y: number; r: number; color: string; label: string }
  | { type: "protein"; x: number; y: number; w: number; h: number; label: string; color: string }
  | { type: "arrow"; x1: number; y1: number; x2: number; y2: number; color: string; label?: string }
  | { type: "inhibit"; x1: number; y1: number; x2: number; y2: number; label?: string }
  | { type: "label"; x: number; y: number; text: string; color: string; size?: number }
  | { type: "dna"; x: number; y: number; height: number; color: string }
  | { type: "marker"; x: number; y: number; r: number; color: string; label?: string; dashed?: boolean }
  | { type: "nucleosome"; x: number; y: number; w: number; h: number; color: string }
  | { type: "rna"; x: number; y: number; width: number; color: string }
  | { type: "nucleus"; x: number; y: number; rx: number; ry: number }
  | { type: "antibody"; x: number; y: number; color: string }
  | { type: "organoid"; x: number; y: number; r: number }
  | { type: "tcell"; x: number; y: number; r: number; active?: boolean }
  | { type: "tumor"; x: number; y: number; r: number }
  | { type: "macrophage"; x: number; y: number; r: number }
  | { type: "box"; x: number; y: number; w: number; h: number; color: string; fill?: string; label?: string; dashed?: boolean };

function renderElement(el: AssemblyElement): string {
  switch (el.type) {
    case "cell": return BioAssets.cell(el.x, el.y, el.r, el.color, el.label);
    case "protein": return BioAssets.protein(el.x, el.y, el.w, el.h, el.label, el.color);
    case "arrow": return BioAssets.arrow(el.x1, el.y1, el.x2, el.y2, el.color, el.label);
    case "inhibit": return BioAssets.inhibitArrow(el.x1, el.y1, el.x2, el.y2);
    case "marker": return `
      <circle cx="${el.x}" cy="${el.y}" r="${el.r}" fill="${el.color}" stroke="${el.color}" stroke-width="1.5" ${el.dashed ? 'stroke-dasharray="3 2" opacity="0.5"' : ""}/>
      ${el.label ? `<text x="${el.x}" y="${el.y - el.r - 4}" text-anchor="middle" font-size="7" fill="${el.color}" font-family="system-ui">${el.label}</text>` : ""}
    `;
    case "nucleosome": return `
      <ellipse cx="${el.x + el.w / 2}" cy="${el.y + el.h / 2}" rx="${el.w / 2}" ry="${el.h / 2}" fill="${el.color}30" stroke="${el.color}" stroke-width="1.5"/>
    `;
    case "dna": return BioAssets.dnaHelix(el.x, el.y, el.height, el.color);
    case "rna": return BioAssets.rnaStrand(el.x, el.y, el.width, el.color);
    case "nucleus": return BioAssets.nucleus(el.x, el.y, el.rx, el.ry);
    case "antibody": return BioAssets.antibody(el.x, el.y, el.color);
    case "organoid": return BioAssets.organoid(el.x, el.y, el.r);
    case "tcell": return BioAssets.tCell(el.x, el.y, el.r, el.active);
    case "tumor": return BioAssets.tumorCell(el.x, el.y, el.r);
    case "macrophage": return BioAssets.macrophage(el.x, el.y, el.r);
    case "label": return `<text x="${el.x}" y="${el.y}" text-anchor="middle" font-size="${el.size || 9}" fill="${el.color}" font-family="system-ui">${el.text}</text>`;
    case "box": return `
      <rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" rx="5"
        fill="${el.fill || el.color + "15"}" stroke="${el.color}" stroke-width="1.3" ${el.dashed ? 'stroke-dasharray="4 2"' : ""}/>
      ${el.label ? `<text x="${el.x + el.w / 2}" y="${el.y + el.h / 2 + 4}" text-anchor="middle" font-size="9" fill="#E2E8F0" font-family="system-ui">${el.label}</text>` : ""}
    `;
    default: return "";
  }
}
