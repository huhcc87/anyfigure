export type BiomedicalAssetCategory =
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
  | "lab-equipment"
  | "molecules"
  | "viruses"
  | "tissues"
  | "clinical"
  | "charts"
  | "networks";

export type BiomedicalAssetType =
  | "svg"
  | "icon"
  | "image"
  | "3d"
  | "node"
  | "pathway"
  | "molecule";

export type BiomedicalAssetSource =
  | "local"
  | "bioicons"
  | "custom"
  | "molstar"
  | "3dmol";

export interface BiomedicalAsset {
  id: string;
  name: string;
  scientificName?: string;
  category: BiomedicalAssetCategory;
  subcategory?: string;
  description?: string;
  tags: string[];
  icon?: string;
  emoji?: string;
  svgPath?: string;
  imagePath?: string;
  modelPath?: string;
  assetType: BiomedicalAssetType;
  source?: BiomedicalAssetSource;
  license?: string;
  defaultSize?: { width: number; height: number };
  metadata?: Record<string, unknown>;
}

export const BIOMEDICAL_CATEGORY_LABELS: Record<BiomedicalAssetCategory, string> = {
  "dna-rna": "DNA / RNA",
  proteins: "Proteins",
  cells: "Cells",
  bacteria: "Bacteria",
  "immune-cells": "Immune Cells",
  "tumor-cells": "Tumor Cells",
  organs: "Organs",
  crispr: "CRISPR",
  sequencing: "Sequencing",
  pathways: "Pathways",
  microbiome: "Microbiome",
  "lab-equipment": "Lab Equipment",
  molecules: "Molecules",
  viruses: "Viruses",
  tissues: "Tissues",
  clinical: "Clinical",
  charts: "Charts",
  networks: "Networks",
};

export const BIOMEDICAL_CATEGORY_COLORS: Record<BiomedicalAssetCategory, string> = {
  "dna-rna": "#06B6D4",
  proteins: "#8B5CF6",
  cells: "#10B981",
  bacteria: "#F59E0B",
  "immune-cells": "#6366F1",
  "tumor-cells": "#EF4444",
  organs: "#EC4899",
  crispr: "#14B8A6",
  sequencing: "#F97316",
  pathways: "#A855F7",
  microbiome: "#84CC16",
  "lab-equipment": "#64748B",
  molecules: "#0EA5E9",
  viruses: "#DC2626",
  tissues: "#D946EF",
  clinical: "#2563EB",
  charts: "#0891B2",
  networks: "#7C3AED",
};
