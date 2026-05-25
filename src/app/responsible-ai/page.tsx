import LegalShell from "@/components/layout/LegalShell";

export const metadata = {
  title: "Responsible AI · AnyFigure",
  description: "How AnyFigure uses AI models responsibly: scope, guardrails, transparency, and what we will not do.",
};

export default function ResponsibleAiPage() {
  return (
    <LegalShell
      title="Responsible AI"
      updated="May 25, 2026"
      tagline="The AI models inside AnyFigure are powerful tools. This is how we use them carefully — and what we promise never to do."
    >
      <h2>Our scope</h2>
      <p>
        AnyFigure uses large language models and vision models to help researchers compose
        scientific figures. We do <strong>not</strong> use AI to diagnose patients, interpret
        clinical results, generate medical advice, or replace expert review of experimental
        designs or claims.
      </p>

      <h2>What models we use, and why</h2>
      <ul>
        <li><strong>Vector AI scene generation</strong> — DeepSeek / OpenAI for structured JSON output. These are strong at constrained schema generation and let us keep figures fully editable.</li>
        <li><strong>Nano Banana Pro raster generation</strong> — Google Gemini 3 Pro Image. Best-in-class for richly illustrated scientific figures.</li>
        <li><strong>Vision OCR (label detection)</strong> — Google Gemini 2.5 Pro with automatic fallback to Flash. Strong spatial accuracy on dense diagrams.</li>
      </ul>

      <h2>Guardrails</h2>
      <ul>
        <li>System prompts forbid generation of patient identifiers, prescriptions, clinical recommendations, or content that could be passed off as primary experimental data.</li>
        <li>Output reviewed against blocklists for known fabricated study designs.</li>
        <li>Users see a clear &ldquo;AI-generated&rdquo; watermark in every export by default (removable on Pro and above, with an attestation that the user is responsible for accuracy).</li>
        <li>Rate limits prevent bulk extraction of generated content.</li>
      </ul>

      <h2>What we will not do</h2>
      <ul>
        <li><strong>We do not train foundation models on your prompts.</strong> Our enterprise contracts with Google, DeepSeek and OpenAI explicitly forbid this. We do not run any internal training pipeline on customer data either.</li>
        <li><strong>We do not generate fake experimental data.</strong> If a user asks for &ldquo;a Western blot of a knockout you ran&rdquo;, the system refuses and offers to compose a labelled schematic instead.</li>
        <li><strong>We do not generate human faces, identifiable individuals, or content that could be used to impersonate real researchers.</strong></li>
        <li><strong>We do not generate biothreat-relevant content.</strong> Prompts requesting synthesis routes, weaponisation pathways, or evasion of biosecurity controls are refused and logged for review.</li>
      </ul>

      <h2>Transparency for downstream readers</h2>
      <ul>
        <li>Every export carries SVG / PNG metadata declaring the model and version used (unless the user opts out on Pro).</li>
        <li>The Showcase gallery requires authors to disclose AnyFigure use under CC-BY.</li>
        <li>We support figure-provenance manifests aligned with the emerging C2PA standard.</li>
      </ul>

      <h2>The human stays in the loop</h2>
      <p>
        AnyFigure is a drafting tool, not an authoring tool. Every figure should be reviewed by a
        domain expert before publication. The user is responsible for verifying that the figure
        accurately represents their experimental design, statistics, and conclusions. We make no
        warranty that generated content is free of errors, omissions, or hallucinations.
      </p>

      <h2>Reporting concerns</h2>
      <p>
        If you see output that appears unsafe, inaccurate, or misleading, please email
        <a href="mailto:ai-safety@anyfigure.dev"> ai-safety@anyfigure.dev</a>. We triage every
        report within one business day. Confirmed safety issues are addressed via prompt updates
        within 7 days and published in the <a href="/changelog">changelog</a>.
      </p>
    </LegalShell>
  );
}
