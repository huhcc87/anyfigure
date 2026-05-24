export type ElementType =
  | "shape"
  | "text"
  | "image"
  | "biomedical"
  | "chart"
  | "arrow"
  | "pathway";

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  label?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  content?: string;
  assetId?: string;
  chartData?: ChartData;
  zIndex: number;
  /** Helps style & identify title, legend, caption layers in workspace */
  textRole?: "title" | "legend" | "caption" | "label";
  /** rect | ellipse | marker (epigenetic dot) | nucleosome */
  shapeKind?: "rect" | "ellipse" | "marker" | "nucleosome";
  /** reference = legacy hidden AI layer; figure = visible AI panel; part = diagram piece */
  partRole?: "reference" | "part" | "figure" | "detected";
  /** Diagonal arrow / regulatory edge endpoints (canvas coords) */
  lineFrom?: { x: number; y: number };
  lineTo?: { x: number; y: number };
  arrowKind?: "activate" | "inhibit";
  /** SVG path d attribute for freehand pen strokes */
  pathData?: string;
  /** Biomedical asset metadata */
  scientificName?: string;
  assetDescription?: string;
  biomedicalCategory?: string;
  assetEmoji?: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  elements: string[];
}

export interface ChartData {
  type: "bar" | "line" | "scatter" | "pie" | "heatmap";
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface EditorState {
  elements: CanvasElement[];
  layers: Layer[];
  selectedIds: string[];
  zoom: number;
  panX: number;
  panY: number;
  tool: EditorTool;
  history: HistoryEntry[];
  historyIndex: number;
  canvasWidth: number;
  canvasHeight: number;
}

export type EditorTool =
  | "select"
  | "pan"
  | "shape"
  | "text"
  | "arrow"
  | "pen";

export interface HistoryEntry {
  elements: CanvasElement[];
  timestamp: number;
}

export interface BiomedicalAsset {
  id: string;
  name: string;
  category: BiomedicalCategory;
  svgPath: string;
  tags: string[];
  description?: string;
}

export type BiomedicalCategory =
  | "dna-rna"
  | "proteins"
  | "cells"
  | "bacteria"
  | "immune-cells"
  | "tumor-cells"
  | "organs"
  | "crispr"
  | "sequencing"
  | "pathways"
  | "microbiome"
  | "lab-equipment";

export interface FigureTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnailUrl?: string;
  elements: Partial<CanvasElement>[];
}

export interface AIGenerationRequest {
  prompt: string;
  figureType: FigureType;
  scientificField: ScientificField;
  journalStyle: JournalStyle;
  colorScheme?: string;
  numPanels?: number;
}

export type FigureType =
  | "graphical-abstract"
  | "pathway-diagram"
  | "cell-biology"
  | "mechanism-of-action"
  | "clinical-trial"
  | "data-visualization"
  | "workflow-diagram"
  | "molecular-structure";

export type ScientificField =
  | "cancer-biology"
  | "immunology"
  | "genomics"
  | "microbiome"
  | "neuroscience"
  | "cardiology"
  | "drug-discovery"
  | "cell-biology"
  | "biochemistry";

export type JournalStyle =
  | "nature"
  | "science"
  | "cell"
  | "nejm"
  | "lancet"
  | "generic";

export interface ExportOptions {
  format: "png" | "svg" | "pdf" | "pptx";
  resolution: 72 | 150 | 300;
  transparentBackground: boolean;
  quality?: number;
  width?: number;
  height?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl?: string;
  elements: CanvasElement[];
  layers: Layer[];
  canvasWidth: number;
  canvasHeight: number;
}
