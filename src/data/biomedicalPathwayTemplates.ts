export interface PathwayTemplate {
  id: string;
  name: string;
  description: string;
  nodes: { id: string; label: string; emoji?: string }[];
  edges: { source: string; target: string; label?: string }[];
}

export const BIOMEDICAL_PATHWAY_TEMPLATES: PathwayTemplate[] = [
  {
    id: "mmr",
    name: "Mismatch repair pathway",
    description: "MSH2-MSH3-MLH1-PMS2 DNA mismatch repair cascade",
    nodes: [
      { id: "damage", label: "DNA mismatch", emoji: "⚠️" },
      { id: "msh2", label: "MSH2", emoji: "🛡️" },
      { id: "msh3", label: "MSH3", emoji: "🛡️" },
      { id: "mlh1", label: "MLH1", emoji: "🔗" },
      { id: "pms2", label: "PMS2", emoji: "🔗" },
      { id: "repair", label: "Repair complete", emoji: "✅" },
    ],
    edges: [
      { source: "damage", target: "msh2" },
      { source: "msh2", target: "msh3" },
      { source: "msh3", target: "mlh1" },
      { source: "mlh1", target: "pms2" },
      { source: "pms2", target: "repair" },
    ],
  },
  {
    id: "wnt",
    name: "Wnt signaling",
    description: "Beta-catenin activation pathway",
    nodes: [
      { id: "wnt", label: "Wnt ligand", emoji: "📡" },
      { id: "frizzled", label: "Frizzled", emoji: "⊢" },
      { id: "beta", label: "β-catenin", emoji: "⬆️" },
      { id: "target", label: "Target genes", emoji: "📜" },
    ],
    edges: [
      { source: "wnt", target: "frizzled", label: "bind" },
      { source: "frizzled", target: "beta", label: "stabilize" },
      { source: "beta", target: "target", label: "activate" },
    ],
  },
  {
    id: "p53",
    name: "p53 signaling",
    description: "DNA damage → p53 → cell cycle arrest / apoptosis",
    nodes: [
      { id: "dsb", label: "DNA DSB", emoji: "💥" },
      { id: "atm", label: "ATM/ATR", emoji: "⚡" },
      { id: "p53", label: "p53", emoji: "🛡️" },
      { id: "p21", label: "p21", emoji: "⏸️" },
      { id: "apoptosis", label: "Apoptosis", emoji: "☠️" },
    ],
    edges: [
      { source: "dsb", target: "atm" },
      { source: "atm", target: "p53" },
      { source: "p53", target: "p21", label: "arrest" },
      { source: "p53", target: "apoptosis", label: "kill" },
    ],
  },
  {
    id: "microbiome-host",
    name: "Microbiome-host interaction",
    description: "Gut bacteria influencing colonic epithelium",
    nodes: [
      { id: "bacteria", label: "F. nucleatum", emoji: "🦠" },
      { id: "toxin", label: "Bacterial toxin", emoji: "💀" },
      { id: "epithelium", label: "Colonocyte", emoji: "🟩" },
      { id: "inflammation", label: "Inflammation", emoji: "🔥" },
    ],
    edges: [
      { source: "bacteria", target: "toxin" },
      { source: "toxin", target: "epithelium" },
      { source: "epithelium", target: "inflammation" },
    ],
  },
  {
    id: "crispr-workflow",
    name: "CRISPR editing workflow",
    description: "sgRNA + Cas9 → DSB → HDR/NHEJ",
    nodes: [
      { id: "sgrna", label: "sgRNA", emoji: "📎" },
      { id: "cas9", label: "Cas9", emoji: "✂️" },
      { id: "dsb", label: "DSB", emoji: "💥" },
      { id: "hdr", label: "HDR", emoji: "🔧" },
      { id: "nhej", label: "NHEJ", emoji: "⚡" },
    ],
    edges: [
      { source: "sgrna", target: "cas9" },
      { source: "cas9", target: "dsb" },
      { source: "dsb", target: "hdr" },
      { source: "dsb", target: "nhej" },
    ],
  },
  {
    id: "rnaseq",
    name: "RNA-seq workflow",
    description: "Sample → library → sequencing → analysis",
    nodes: [
      { id: "sample", label: "RNA sample", emoji: "🧪" },
      { id: "library", label: "Library prep", emoji: "📚" },
      { id: "seq", label: "Sequencing", emoji: "🧬" },
      { id: "align", label: "Alignment", emoji: "📊" },
      { id: "de", label: "DEG analysis", emoji: "🌋" },
    ],
    edges: [
      { source: "sample", target: "library" },
      { source: "library", target: "seq" },
      { source: "seq", target: "align" },
      { source: "align", target: "de" },
    ],
  },
  {
    id: "tme",
    name: "Tumor immune microenvironment",
    description: "T cells, macrophages, and tumor cells in TME",
    nodes: [
      { id: "tcell", label: "CD8+ T cell", emoji: "🔵" },
      { id: "macro", label: "Macrophage", emoji: "🟤" },
      { id: "tumor", label: "Tumor cell", emoji: "🔴" },
      { id: "pdl1", label: "PD-L1", emoji: "🚦" },
    ],
    edges: [
      { source: "tcell", target: "tumor", label: "kill" },
      { source: "tumor", target: "pdl1", label: "express" },
      { source: "pdl1", target: "tcell", label: "inhibit" },
      { source: "macro", target: "tumor", label: "support" },
    ],
  },
];
