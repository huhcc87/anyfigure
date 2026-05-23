# ANYFIGURE AI — MASTER CURSOR IMPLEMENTATION PROMPT

You are an elite full-stack engineer, AI product architect, biomedical visualization designer, and Next.js expert.

Project Path:
```bash
/Users/mudasirrashid/Documents/app/anyfigure
```

IMPORTANT:
- The Next.js project already exists.
- The project builds successfully.
- DO NOT recreate the app.
- DO NOT remove existing code unless necessary.
- EXTEND the current architecture.
- USE already installed packages.
- FIX imports/types/build issues automatically.
- Keep architecture modular and production-ready.

====================================================
PROJECT OVERVIEW
====================================================

Build a world-class AI scientific figure generation platform called:

# AnyFigure AI

The platform should surpass:
- FigureLabs.ai
- BioRender
- GraphPad style workflows
- AI graphical abstract generators

Primary users:
- biomedical researchers
- cancer biologists
- microbiome researchers
- genomics scientists
- clinicians
- pharmaceutical companies
- academic journals

====================================================
TECH STACK
====================================================

Use existing installed stack:
- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion
- Konva + Fabric.js
- React Flow
- Recharts + Plotly
- OpenAI SDK compatible APIs
- DeepSeek-compatible architecture
- shadcn/radix-style UI
- pdf-lib
- pptxgenjs
- react-rnd
- dnd-kit
- Three.js
- React Three Fiber

====================================================
PHASE 1 — CREATE CORE ARCHITECTURE
====================================================

Create or connect folders:

src/
  app/
  components/
  components/editor/
  components/canvas/
  components/workspace/
  components/biomedical/
  components/charts/
  components/templates/
  components/layout/
  components/sidebar/
  components/topbar/
  components/layers/
  components/properties/
  components/ai/
  components/export/

  store/
  services/
  services/ai/
  services/export/
  hooks/
  lib/
  types/
  utils/

====================================================
PHASE 2 — BUILD LANDING PAGE
====================================================

Replace default Next.js landing page with premium SaaS homepage.

Style:
- Apple/Figma/Notion/Vercel quality
- clean scientific aesthetic
- modern typography
- soft gradients
- responsive
- dark/light support
- smooth animations

Sections:
1. HERO
2. FEATURES GRID
3. WORKFLOW SECTION
4. SHOWCASE SECTION
5. TESTIMONIAL PLACEHOLDER
6. PRICING PREVIEW
7. FOOTER

====================================================
PHASE 3 — CREATE DASHBOARD
====================================================

Route:
/dashboard

Features:
- recent projects
- create project button
- AI credits card
- export history
- recent prompts
- recent templates
- team workspace card

====================================================
PHASE 4 — CREATE WORKSPACE EDITOR
====================================================

Route:
/workspace

Build a Figma/BioRender-style editor layout.

TOPBAR:
- logo
- project name
- undo/redo
- zoom controls
- AI generate button
- export button
- share button

LEFT SIDEBAR:
- select tool
- shape tool
- text tool
- biomedical assets
- pathways
- charts
- templates
- uploads
- AI tools

CENTER:
- infinite canvas placeholder
- grid background
- zoom/pan support
- draggable demo objects

RIGHT SIDEBAR:
- layers
- object properties
- colors
- typography
- export settings
- AI suggestions

====================================================
PHASE 5 — BIOMEDICAL ASSET LIBRARY
====================================================

Create searchable biomedical asset categories:
- DNA/RNA
- proteins
- cells
- bacteria
- immune cells
- tumor cells
- organs
- CRISPR
- sequencing
- pathways
- microbiome
- lab equipment

====================================================
PHASE 6 — AI FIGURE STUDIO
====================================================

Route:
/ai-figure-studio

Features:
- prompt textarea
- figure type dropdown
- scientific field dropdown
- journal style dropdown
- generate button
- generated figure cards

====================================================
PHASE 7 — TEMPLATES PAGE
====================================================

Route:
/templates

Add template cards:
- CRISPR Editing Workflow
- RNA-seq Pipeline
- Tumor Microenvironment
- Microbiome Interaction
- Immunotherapy Pathway
- Cell Signaling Cascade

====================================================
PHASE 8 — CREATE EDITOR STATE
====================================================

Create Zustand store:
src/store/editorStore.ts

====================================================
PHASE 9 — CREATE AI SERVICE PLACEHOLDERS
====================================================

Create:
- src/services/ai/figurePlanner.ts
- src/services/ai/legendWriter.ts
- src/services/ai/promptEnhancer.ts

Use:
DEEPSEEK_API_KEY=
OPENAI_API_KEY=

====================================================
PHASE 10 — EXPORT SYSTEM PLACEHOLDERS
====================================================

Create:
src/services/export/exportFigure.ts

Add placeholder support for:
- PNG
- SVG
- PDF
- PPTX
- transparent background
- 300 DPI export

====================================================
FINAL OBJECTIVE
====================================================

Create a fully functional UI skeleton and architecture for AnyFigure AI:
- landing page
- dashboard
- workspace editor
- AI figure studio
- biomedical assets
- templates
- Zustand editor store
- AI service placeholders
- export placeholders

After implementation:
1. run build
2. fix all errors
3. ensure routes work
4. ensure responsive design
5. ensure imports are correct
6. ensure project compiles successfully
