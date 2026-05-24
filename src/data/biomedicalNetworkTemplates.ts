export interface NetworkTemplate {
  id: string;
  name: string;
  description: string;
  nodes: { id: string; label: string }[];
  edges: { source: string; target: string; label?: string }[];
}

export const BIOMEDICAL_NETWORK_TEMPLATES: NetworkTemplate[] = [
  {
    id: "msh2-msh3",
    name: "MSH2-MSH3 mismatch repair network",
    description: "Core MMR protein interaction network",
    nodes: [
      { id: "MSH2", label: "MSH2" },
      { id: "MSH3", label: "MSH3" },
      { id: "MSH6", label: "MSH6" },
      { id: "MLH1", label: "MLH1" },
      { id: "PMS2", label: "PMS2" },
      { id: "PCNA", label: "PCNA" },
    ],
    edges: [
      { source: "MSH2", target: "MSH3", label: "heterodimer" },
      { source: "MSH2", target: "MSH6", label: "heterodimer" },
      { source: "MLH1", target: "PMS2", label: "MutLα" },
      { source: "MSH2", target: "MLH1", label: "recruit" },
      { source: "PCNA", target: "MSH2", label: "clamp" },
    ],
  },
  {
    id: "fn-crc",
    name: "Fusobacterium-CRC inflammatory network",
    description: "Microbe-driven colorectal inflammation",
    nodes: [
      { id: "Fn", label: "F. nucleatum" },
      { id: "TLR4", label: "TLR4" },
      { id: "NFkB", label: "NF-κB" },
      { id: "IL6", label: "IL-6" },
      { id: "CRC", label: "CRC cell" },
    ],
    edges: [
      { source: "Fn", target: "TLR4" },
      { source: "TLR4", target: "NFkB" },
      { source: "NFkB", target: "IL6" },
      { source: "IL6", target: "CRC" },
    ],
  },
  {
    id: "pks-ecoli",
    name: "pks+ E. coli DNA damage network",
    description: "Colibactin genotoxic pathway",
    nodes: [
      { id: "Ecoli", label: "pks+ E. coli" },
      { id: "Colibactin", label: "Colibactin" },
      { id: "DSB", label: "DNA DSB" },
      { id: "p53", label: "p53" },
    ],
    edges: [
      { source: "Ecoli", target: "Colibactin" },
      { source: "Colibactin", target: "DSB" },
      { source: "DSB", target: "p53" },
    ],
  },
  {
    id: "tme-network",
    name: "Tumor immune microenvironment network",
    description: "Immune checkpoint and stromal interactions",
    nodes: [
      { id: "CD8", label: "CD8+ T" },
      { id: "PD1", label: "PD-1" },
      { id: "PDL1", label: "PD-L1" },
      { id: "Tumor", label: "Tumor" },
      { id: "CAF", label: "CAF" },
    ],
    edges: [
      { source: "CD8", target: "PD1" },
      { source: "PD1", target: "PDL1", label: "block" },
      { source: "Tumor", target: "PDL1" },
      { source: "CAF", target: "Tumor", label: "support" },
    ],
  },
  {
    id: "crispr-outcomes",
    name: "CRISPR editing outcome network",
    description: "HDR vs NHEJ editing fates",
    nodes: [
      { id: "Cas9", label: "Cas9" },
      { id: "DSB", label: "DSB" },
      { id: "HDR", label: "HDR" },
      { id: "NHEJ", label: "NHEJ" },
      { id: "Edit", label: "Edited clone" },
    ],
    edges: [
      { source: "Cas9", target: "DSB" },
      { source: "DSB", target: "HDR" },
      { source: "DSB", target: "NHEJ" },
      { source: "HDR", target: "Edit" },
    ],
  },
  {
    id: "microbiome-metabolite",
    name: "Microbiome-metabolite-host signaling",
    description: "SCFA and bile acid signaling axis",
    nodes: [
      { id: "Microbiome", label: "Microbiome" },
      { id: "SCFA", label: "SCFA" },
      { id: "GPR", label: "GPR43" },
      { id: "Epithelium", label: "Epithelium" },
    ],
    edges: [
      { source: "Microbiome", target: "SCFA" },
      { source: "SCFA", target: "GPR" },
      { source: "GPR", target: "Epithelium" },
    ],
  },
];
