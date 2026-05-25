import LegalShell from "@/components/layout/LegalShell";

export const metadata = {
  title: "Data Processing Addendum · AnyFigure",
  description: "Standard DPA between AnyFigure Labs Inc. and customers processing personal data through the Service.",
};

export default function DpaPage() {
  return (
    <LegalShell
      title="Data Processing Addendum"
      updated="May 25, 2026"
      tagline="Standard DPA between AnyFigure Labs Inc. (Processor) and the customer (Controller). Forms part of the Terms of Service when personal data is processed through the platform."
    >
      <h2>1. Scope</h2>
      <p>
        This DPA applies whenever AnyFigure processes Personal Data on behalf of the Customer in the
        course of providing the Service. It supplements and forms part of the Terms of Service
        between Customer and AnyFigure Labs Inc.
      </p>

      <h2>2. Roles</h2>
      <ul>
        <li><strong>Controller:</strong> the Customer who determines the purposes and means of the processing.</li>
        <li><strong>Processor:</strong> AnyFigure Labs Inc., which processes Personal Data on the Controller&apos;s behalf.</li>
        <li><strong>Sub-processors:</strong> third-party services AnyFigure engages to deliver the Service (see §6).</li>
      </ul>

      <h2>3. Subject matter and duration</h2>
      <p>
        The subject matter is the processing of Personal Data required to deliver scientific-figure
        generation, editing, storage, and export. Duration matches the term of the Customer&apos;s
        subscription, plus 30 days for deletion.
      </p>

      <h2>4. Categories of data subjects and data</h2>
      <ul>
        <li><strong>Data subjects:</strong> Customer&apos;s authorised users (researchers, lab members, collaborators).</li>
        <li><strong>Categories of data:</strong> account identifiers (email, display name), authentication tokens, research prompts, generated scene graphs and figures, edit history, export history, usage telemetry.</li>
      </ul>
      <p>
        Customer must not submit special-category data (health records, biometric data, criminal
        records) unless covered by a separately executed Business Associate Agreement (HIPAA) or
        equivalent.
      </p>

      <h2>5. Processor obligations</h2>
      <ul>
        <li>Process Personal Data only on documented instructions from Controller.</li>
        <li>Ensure persons authorised to process Personal Data are bound by confidentiality.</li>
        <li>Implement appropriate technical and organisational measures (see §7).</li>
        <li>Assist Controller with data-subject rights requests (access, rectification, erasure, portability, restriction, objection).</li>
        <li>Notify Controller of any Personal Data Breach without undue delay and within 72 hours.</li>
        <li>Make available all information necessary to demonstrate compliance.</li>
        <li>On termination, delete or return all Personal Data within 30 days unless retention is legally required.</li>
      </ul>

      <h2>6. Sub-processors</h2>
      <p>
        Customer authorises AnyFigure to engage the following sub-processors, all bound by data
        protection terms no less protective than this DPA:
      </p>
      <ul>
        <li><strong>Clerk Inc.</strong> — authentication, user identity (US; SOC 2 Type II)</li>
        <li><strong>Vercel Inc.</strong> — application hosting, CDN (US / EU; ISO 27001, SOC 2)</li>
        <li><strong>Google LLC (Vertex AI / Gemini API)</strong> — vector scene generation, image generation, vision-OCR (US / EU; ISO 27001, SOC 2, HIPAA-eligible)</li>
        <li><strong>DeepSeek</strong> — fallback LLM for scene-graph generation (no training on inputs per enterprise terms)</li>
        <li><strong>OpenAI</strong> — fallback LLM, optional (no training on inputs per enterprise API terms)</li>
      </ul>
      <p>
        AnyFigure will give Customer 30 days notice of any new sub-processor and allow objection on
        reasonable grounds.
      </p>

      <h2>7. Security measures (Annex II summary)</h2>
      <ul>
        <li>Encryption in transit (TLS 1.3) and at rest (AES-256-GCM).</li>
        <li>Role-based access control with mandatory 2FA for production access.</li>
        <li>Hardware-security-key gated production access; all sessions audited.</li>
        <li>Continuous vulnerability scanning; quarterly third-party penetration tests.</li>
        <li>Tamper-evident audit logs retained for 365 days.</li>
        <li>SOC 2 Type II audited annually; ISO 27001 certified.</li>
      </ul>

      <h2>8. International transfers</h2>
      <p>
        Where Personal Data is transferred outside the EEA/UK/Switzerland, AnyFigure relies on
        Standard Contractual Clauses (Module Two — Controller to Processor) and supplementary
        measures (encryption, pseudonymisation, transparency reports). EU customers may opt for
        EU-only processing on the Enterprise plan.
      </p>

      <h2>9. Audit</h2>
      <p>
        AnyFigure makes available SOC 2 reports and ISO 27001 certificates under NDA. Customer may
        request a customised audit once per year subject to 30 days notice and reasonable cost
        sharing for any required staff time.
      </p>

      <h2>10. Liability and governing law</h2>
      <p>
        Liability under this DPA is governed by the limitation-of-liability clauses in the Terms of
        Service. The DPA is governed by the laws of Ireland for EU customers and Delaware for all
        other customers.
      </p>

      <h2>11. Execution</h2>
      <p>
        Acceptance of the Terms of Service constitutes acceptance of this DPA. A countersigned PDF
        is available on request from <a href="mailto:legal@anyfigure.dev">legal@anyfigure.dev</a>.
      </p>
    </LegalShell>
  );
}
