import type { BiomedicalAsset, BiomedicalAssetCategory } from "@/types/biomedicalAssets";

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function make(
  name: string,
  category: BiomedicalAssetCategory,
  emoji: string,
  tags: string[],
  opts: Partial<BiomedicalAsset> = {}
): BiomedicalAsset {
  const id = opts.id ?? `${category}-${slug(name)}`;
  return {
    id,
    name,
    category,
    emoji,
    tags: [category.replace(/-/g, " "), ...tags],
    assetType: opts.assetType ?? "icon",
    source: opts.source ?? "local",
    license: opts.license ?? "AnyFigure internal",
    defaultSize: opts.defaultSize ?? { width: 100, height: 100 },
    ...opts,
  };
}

const DNA_RNA: BiomedicalAsset[] = [
  make("DNA double helix", "dna-rna", "🧬", ["genome", "nucleic acid"], { scientificName: "Deoxyribonucleic acid" }),
  make("RNA strand", "dna-rna", "〰️", ["transcript"], { assetType: "svg" }),
  make("mRNA", "dna-rna", "📜", ["messenger", "translation"]),
  make("tRNA", "dna-rna", "↺", ["transfer", "translation"]),
  make("miRNA", "dna-rna", "🧩", ["microRNA", "regulation"]),
  make("Primer pair", "dna-rna", "↔️", ["PCR", "amplification"]),
  make("Promoter", "dna-rna", "▶️", ["transcription", "regulatory"]),
  make("Enhancer", "dna-rna", "⬆️", ["cis-regulatory"]),
  make("Exon", "dna-rna", "▭", ["splicing"]),
  make("Intron", "dna-rna", "⋯", ["splicing"]),
  make("Telomere", "dna-rna", "🔚", ["chromosome end"]),
  make("Chromosome", "dna-rna", "🧵", ["karyotype"]),
  make("Plasmid", "dna-rna", "⭕", ["vector", "cloning"]),
  make("CRISPR guide RNA", "dna-rna", "✂️", ["crispr", "grna"]),
  make("DNA repair site", "dna-rna", "🔧", ["MMR", "damage"]),
];

const PROTEINS: BiomedicalAsset[] = [
  make("Generic protein", "proteins", "⬡", ["enzyme"]),
  make("Enzyme", "proteins", "⚙️", ["catalysis"]),
  make("Antibody", "proteins", "Y", ["immunoglobulin", "IgG"], { assetType: "svg" }),
  make("Receptor", "proteins", "⊢", ["membrane", "signaling"]),
  make("Kinase", "proteins", "⚡", ["phosphorylation"]),
  make("Transcription factor", "proteins", "★", ["gene regulation"]),
  make("MSH2", "proteins", "🛡️", ["MMR", "DNA repair"], { assetType: "molecule", metadata: { pdbId: "3THY" } }),
  make("MSH3", "proteins", "🛡️", ["MMR"], { assetType: "molecule", metadata: { pdbId: "3THX" } }),
  make("MLH1", "proteins", "🔗", ["MMR"], { assetType: "molecule", metadata: { pdbId: "3THR" } }),
  make("PMS2", "proteins", "🔗", ["MMR"], { assetType: "molecule" }),
  make("Cas9", "proteins", "✂️", ["CRISPR", "nuclease"], { assetType: "molecule", metadata: { pdbId: "4OO8" } }),
  make("dCas9", "proteins", "🔒", ["CRISPR", "dead"]),
  make("Polymerase", "proteins", "🔩", ["replication"]),
  make("Histone", "proteins", "🔵", ["chromatin", "nucleosome"]),
  make("Cytokine", "proteins", "✦", ["signaling", "immune"]),
  make("Growth factor", "proteins", "📈", ["proliferation"]),
];

const BACTERIA: BiomedicalAsset[] = [
  make("E. coli", "bacteria", "🦠", ["gram-negative"]),
  make("pks+ E. coli", "bacteria", "☣️", ["colibactin", "CRC"]),
  make("Fusobacterium nucleatum", "bacteria", "🔴", ["oral", "CRC"]),
  make("Bacteroides fragilis", "bacteria", "🟢", ["gut"]),
  make("Lactobacillus", "bacteria", "🟡", ["probiotic"]),
  make("Streptococcus", "bacteria", "⚪", ["gram-positive"]),
  make("Enterococcus", "bacteria", "🟤", ["gut"]),
  make("Akkermansia", "bacteria", "🔷", ["mucin"]),
  make("Biofilm", "bacteria", "🫧", ["community"]),
  make("Microbiome community", "bacteria", "🌐", ["diversity"]),
  make("Bacterial toxin", "bacteria", "💀", ["virulence"]),
  make("Bacterial flagella", "bacteria", "🌀", ["motility"]),
];

const CELLS: BiomedicalAsset[] = [
  make("Epithelial cell", "cells", "⬢", ["barrier"]),
  make("Stem cell", "cells", "⭐", ["pluripotent"]),
  make("Fibroblast", "cells", "🔶", ["stroma"]),
  make("Neuron", "cells", "🌟", ["nervous"]),
  make("Endothelial cell", "cells", "🔷", ["vascular"]),
  make("Colonocyte", "cells", "🟩", ["colon"]),
  make("Gastric epithelial cell", "cells", "🟧", ["stomach"]),
  make("Organoid", "cells", "🫧", ["3D culture"]),
  make("Spheroid", "cells", "⚫", ["tumor model"]),
  make("Necrotic cell", "cells", "💀", ["death"]),
  make("Apoptotic cell", "cells", "☠️", ["programmed death"]),
];

const IMMUNE: BiomedicalAsset[] = [
  make("T cell", "immune-cells", "🔵", ["adaptive"]),
  make("B cell", "immune-cells", "🟣", ["antibody"]),
  make("Macrophage", "immune-cells", "🟤", ["phagocyte"]),
  make("Dendritic cell", "immune-cells", "✴", ["antigen presentation"]),
  make("NK cell", "immune-cells", "⬡", ["innate"]),
  make("Neutrophil", "immune-cells", "◎", ["granulocyte"]),
  make("Plasma cell", "immune-cells", "💜", ["antibody secreting"]),
  make("Treg", "immune-cells", "🛡️", ["regulatory"]),
  make("MDSC", "immune-cells", "⛔", ["suppressor"]),
  make("CD8+ T cell", "immune-cells", "🔵", ["cytotoxic"]),
  make("CD4+ T cell", "immune-cells", "🟦", ["helper"]),
  make("Mast cell", "immune-cells", "🟠", ["allergy"]),
];

const TUMOR: BiomedicalAsset[] = [
  make("Colorectal cancer cell", "tumor-cells", "🔴", ["CRC"]),
  make("Gastric cancer cell", "tumor-cells", "🟥", ["GC"]),
  make("Metastatic tumor cell", "tumor-cells", "💢", ["invasion"]),
  make("MSI-H tumor cell", "tumor-cells", "🧬", ["microsatellite"]),
  make("MSS tumor cell", "tumor-cells", "⬛", ["stable"]),
  make("EMAST tumor cell", "tumor-cells", "📊", ["instability"]),
  make("Cancer stem cell", "tumor-cells", "⭐", ["CSC"]),
  make("Circulating tumor cell", "tumor-cells", "🔄", ["CTC"]),
  make("Invasive tumor front", "tumor-cells", "➡️", ["leading edge"]),
];

const ORGANS: BiomedicalAsset[] = [
  make("Colon", "organs", "🌀", ["GI"], { subcategory: "GI" }),
  make("Stomach", "organs", "🫃", ["GI"]),
  make("Liver", "organs", "🫀", ["hepatic"]),
  make("Pancreas", "organs", "🟡", ["endocrine"]),
  make("Intestine", "organs", "〰️", ["GI"]),
  make("Brain", "organs", "🧠", ["CNS"]),
  make("Lung", "organs", "🫁", ["respiratory"]),
  make("Kidney", "organs", "🫘", ["renal"]),
  make("Tumor tissue", "tissues", "🔴", ["malignant"], { category: "tissues" as BiomedicalAssetCategory }),
  make("Normal tissue", "tissues", "🟢", ["healthy"], { category: "tissues" as BiomedicalAssetCategory }),
  make("FFPE block", "tissues", "▦", ["histology"], { category: "tissues" as BiomedicalAssetCategory }),
  make("Biopsy section", "tissues", "🔬", ["pathology"], { category: "tissues" as BiomedicalAssetCategory }),
  make("Tissue microarray", "tissues", "▤", ["TMA"], { category: "tissues" as BiomedicalAssetCategory }),
];

const CRISPR: BiomedicalAsset[] = [
  make("Cas9 nuclease", "crispr", "✂️", ["genome editing"], { id: "crispr-cas9" }),
  make("dCas9", "crispr", "🔒", ["CRISPRa/i"]),
  make("sgRNA", "crispr", "📎", ["guide"]),
  make("Donor template", "crispr", "📋", ["HDR"]),
  make("HDR repair", "crispr", "🔧", ["homology"]),
  make("NHEJ repair", "crispr", "⚡", ["indels"]),
  make("CRISPR cut site", "crispr", "✂️", ["DSB"]),
  make("Base editor", "crispr", "🔤", ["CBE", "ABE"]),
  make("Prime editor", "crispr", "✏️", ["PE"]),
  make("PAM sequence", "crispr", "NGG", ["recognition"]),
  make("Edited clone", "crispr", "✅", ["isogenic"]),
];

const SEQUENCING: BiomedicalAsset[] = [
  make("FASTQ", "sequencing", "📁", ["raw reads"]),
  make("BAM", "sequencing", "📦", ["aligned"]),
  make("VCF", "sequencing", "🧬", ["variants"]),
  make("RNA-seq", "sequencing", "📊", ["transcriptome"]),
  make("ChIP-seq", "sequencing", "🎯", ["epigenome"]),
  make("ATAC-seq", "sequencing", "🔓", ["chromatin"]),
  make("WGS", "sequencing", "🌐", ["whole genome"]),
  make("WES", "sequencing", "🎯", ["exome"]),
  make("Nanopore read", "sequencing", "〰️", ["long read"]),
  make("Illumina flow cell", "sequencing", "▦", ["short read"]),
  make("Heatmap", "charts", "🟥", ["expression"], { category: "charts" as BiomedicalAssetCategory, assetType: "svg" }),
  make("Volcano plot", "charts", "🌋", ["differential"], { category: "charts" as BiomedicalAssetCategory }),
  make("PCA plot", "charts", "📉", ["dimensionality"], { category: "charts" as BiomedicalAssetCategory }),
  make("Genome browser track", "sequencing", "📈", ["IGV"]),
];

const PATHWAYS: BiomedicalAsset[] = [
  make("MAPK pathway", "pathways", "⟹", ["ERK", "signaling"], { assetType: "pathway" }),
  make("Wnt signaling", "pathways", "⟶", ["beta-catenin"], { assetType: "pathway" }),
  make("PI3K/AKT", "pathways", "➡️", ["survival"], { assetType: "pathway" }),
  make("p53 pathway", "pathways", "🛡️", ["tumor suppressor"], { assetType: "pathway" }),
  make("Mismatch repair", "pathways", "🔧", ["MMR", "Lynch"], { assetType: "pathway" }),
  make("Immune checkpoint", "pathways", "🚦", ["PD-1", "CTLA-4"], { assetType: "pathway" }),
  make("Microbiome-host interaction", "pathways", "🦠", ["gut-axis"], { assetType: "pathway" }),
  make("Cytokine network", "pathways", "🕸️", ["immune"], { assetType: "pathway" }),
  make("DNA damage response", "pathways", "⚠️", ["DDR"], { assetType: "pathway" }),
  make("Epithelial barrier", "pathways", "🧱", ["tight junction"], { assetType: "pathway" }),
];

const MICROBIOME: BiomedicalAsset[] = [
  make("Gut flora", "microbiome", "🦠", ["microbiota"]),
  make("Microbiome diversity", "microbiome", "◉", ["alpha diversity"]),
  make("Metabolite", "microbiome", "◈", ["SCFA"]),
  make("Biofilm cluster", "microbiome", "🫧", ["community"]),
  make("Dysbiosis", "microbiome", "⚠️", ["imbalance"]),
  make("Probiotic consortium", "microbiome", "🌿", ["therapy"]),
];

const LAB: BiomedicalAsset[] = [
  make("Pipette", "lab-equipment", "⬇", ["liquid handling"]),
  make("Centrifuge", "lab-equipment", "🔄", ["spin"]),
  make("PCR machine", "lab-equipment", "🔥", ["thermocycler"]),
  make("ddPCR droplet reader", "lab-equipment", "💧", ["digital PCR"]),
  make("qPCR machine", "lab-equipment", "📈", ["quantitative"]),
  make("Microscope", "lab-equipment", "🔬", ["imaging"]),
  make("Incubator", "lab-equipment", "🌡️", ["culture"]),
  make("Biosafety cabinet", "lab-equipment", "🧫", ["BSL"]),
  make("Gel electrophoresis", "lab-equipment", "▥", ["DNA"]),
  make("Western blot membrane", "lab-equipment", "▤", ["protein"]),
  make("Flow cytometer", "lab-equipment", "◫", ["FACS"]),
  make("Sequencer", "lab-equipment", "🧬", ["NGS"]),
];

const MOLECULES: BiomedicalAsset[] = [
  make("ATP", "molecules", "⚡", ["energy"], { assetType: "molecule" }),
  make("NAD+", "molecules", "🔋", ["redox"], { assetType: "molecule" }),
  make("Glucose", "molecules", "🍬", ["metabolism"], { assetType: "molecule" }),
  make("Lipid nanoparticle", "molecules", "🔵", ["LNP", "delivery"], { assetType: "molecule" }),
  make("Small molecule drug", "molecules", "💊", ["inhibitor"], { assetType: "molecule" }),
  make("siRNA", "molecules", "🧬", ["knockdown"], { assetType: "molecule" }),
];

const VIRUSES: BiomedicalAsset[] = [
  make("Lentivirus", "viruses", "🦠", ["vector"]),
  make("AAV", "viruses", "🔵", ["gene therapy"]),
  make("Phage", "viruses", "👾", ["bacteriophage"]),
  make("Retrovirus", "viruses", "🔄", ["integration"]),
  make("Coronavirus", "viruses", "☣️", ["spike"]),
];

const CLINICAL: BiomedicalAsset[] = [
  make("Patient cohort", "clinical", "👥", ["study"]),
  make("IV infusion", "clinical", "💉", ["delivery"]),
  make("Biopsy needle", "clinical", "📍", ["sampling"]),
  make("Clinical trial phase", "clinical", "📋", ["Phase I-III"]),
  make("Survival curve", "clinical", "📉", ["Kaplan-Meier"], { assetType: "svg" }),
  make("Forest plot", "clinical", "🌲", ["meta-analysis"], { assetType: "svg" }),
];

const NETWORKS: BiomedicalAsset[] = [
  make("Protein interaction network", "networks", "🕸️", ["PPI"], { assetType: "node" }),
  make("Gene regulatory network", "networks", "🔗", ["GRN"], { assetType: "node" }),
  make("Signaling cascade", "networks", "➡️", ["pathway"], { assetType: "node" }),
  make("Co-expression module", "networks", "📊", ["WGCNA"], { assetType: "node" }),
  make("Microbiome network", "networks", "🦠", ["co-abundance"], { assetType: "node" }),
  make("Immune cell network", "networks", "🔵", ["cell-cell"], { assetType: "node" }),
];

export const BIOMEDICAL_ASSETS: BiomedicalAsset[] = [
  ...DNA_RNA,
  ...PROTEINS,
  ...BACTERIA,
  ...CELLS,
  ...IMMUNE,
  ...TUMOR,
  ...ORGANS,
  ...CRISPR,
  ...SEQUENCING,
  ...PATHWAYS,
  ...MICROBIOME,
  ...LAB,
  ...MOLECULES,
  ...VIRUSES,
  ...CLINICAL,
  ...NETWORKS,
];

export function getAssetsByCategory(category: BiomedicalAssetCategory | "all"): BiomedicalAsset[] {
  if (category === "all") return BIOMEDICAL_ASSETS;
  return BIOMEDICAL_ASSETS.filter((a) => a.category === category);
}

export function getAssetById(id: string): BiomedicalAsset | undefined {
  return BIOMEDICAL_ASSETS.find((a) => a.id === id);
}
