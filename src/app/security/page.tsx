import LegalShell from "@/components/layout/LegalShell";

export const metadata = {
  title: "Security · AnyFigure",
  description:
    "Encryption, access control, sub-processors, audit, and compliance posture at AnyFigure.",
};

export default function SecurityPage() {
  return (
    <LegalShell
      title="Security"
      updated="May 25, 2026"
      tagline="Encryption, access control, audit, compliance. Built for biomedical teams who need to ship without surprising their security review."
    >
      <h2>Encryption</h2>
      <ul>
        <li><strong>In transit.</strong> TLS 1.3 with strict HSTS. HTTP/2 only — no fallback to plaintext.</li>
        <li><strong>At rest.</strong> AES-256-GCM for figure plans, scene graphs, and exports stored in object storage and IndexedDB.</li>
        <li><strong>Field-level.</strong> API keys and tokens are wrapped in envelope encryption with per-tenant data-encryption keys, rotated automatically every 90 days.</li>
      </ul>

      <h2>Authentication &amp; Access</h2>
      <ul>
        <li>SSO via Clerk: passkeys, Google, GitHub, SAML 2.0 (enterprise), magic links.</li>
        <li>Optional enforced 2FA per workspace.</li>
        <li>Role-based access control: Owner / Admin / Editor / Viewer with granular scoping per project.</li>
        <li>Short-lived JWT session tokens (15 min) with rotating refresh tokens.</li>
      </ul>

      <h2>Infrastructure</h2>
      <ul>
        <li>Hosted on Vercel (US &amp; EU edge regions) — ISO 27001 / SOC 2 Type II.</li>
        <li>Database isolation per region. EU customer data never leaves EU regions.</li>
        <li>Immutable, signed deployments. Every release tied to a git commit + reviewed PR.</li>
        <li>Production access is gated behind hardware security keys and audited via session recording.</li>
      </ul>

      <h2>AI provider posture</h2>
      <p>
        We route generation through enterprise-tier accounts at Google (Gemini), DeepSeek, and
        OpenAI under Data Processing Addenda that explicitly forbid training on customer inputs.
        Prompt content is not retained by providers beyond the request lifetime (typically &lt; 30 days
        for abuse-monitoring, with zero-retention mode available on enterprise plans).
      </p>

      <h2>Compliance</h2>
      <ul>
        <li><strong>SOC 2 Type II</strong> — audited annually by an independent CPA firm; report available under NDA.</li>
        <li><strong>GDPR</strong> — full DPA available, DPO appointed, EU-hosted region offered.</li>
        <li><strong>HIPAA-ready</strong> — Business Associate Agreement available for healthcare customers on the Enterprise plan.</li>
        <li><strong>ISO 27001</strong> — certified information security management system.</li>
        <li><strong>CCPA</strong> — California consumer rights honoured for all users.</li>
      </ul>

      <h2>Audit &amp; logging</h2>
      <ul>
        <li>Tamper-evident audit logs for every authentication event, project access, edit, export, and admin action.</li>
        <li>Logs exported to your SIEM via webhook on the Enterprise plan.</li>
        <li>365-day retention by default.</li>
      </ul>

      <h2>Vulnerability management</h2>
      <ul>
        <li>Continuous dependency scanning (Dependabot + Snyk).</li>
        <li>Quarterly third-party penetration tests; latest report available under NDA.</li>
        <li>Public security.txt and a coordinated disclosure program at <a href="mailto:security@anyfigure.dev">security@anyfigure.dev</a>.</li>
        <li>Critical patches deployed within 24 hours of disclosure.</li>
      </ul>

      <h2>Bring-your-own-key (enterprise)</h2>
      <p>
        Enterprise customers can supply their own AWS KMS or GCP Cloud KMS keys so that no
        AnyFigure operator ever holds the decryption key for your figures. Revoking your key
        renders the data irrecoverable within minutes.
      </p>

      <h2>Self-hosted option</h2>
      <p>
        For teams whose data may never leave their infrastructure, we ship a Docker / Helm
        deployment of the full stack with bring-your-own-LLM endpoints (Azure OpenAI, vLLM,
        Together AI). Contact <a href="mailto:enterprise@anyfigure.dev">enterprise@anyfigure.dev</a>.
      </p>

      <h2>Report a vulnerability</h2>
      <p>
        Email <a href="mailto:security@anyfigure.dev">security@anyfigure.dev</a>. We commit to:
      </p>
      <ul>
        <li>Acknowledge within 24 hours.</li>
        <li>Triage within 72 hours.</li>
        <li>Patch critical issues within 7 days.</li>
        <li>Public credit (with your consent) on our security advisories page.</li>
      </ul>
    </LegalShell>
  );
}
