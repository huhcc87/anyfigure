import LegalShell from "@/components/layout/LegalShell";

export const metadata = {
  title: "Compliance · AnyFigure",
  description: "SOC 2, GDPR, HIPAA, ISO 27001, CCPA — full compliance posture.",
};

const FRAMEWORKS = [
  {
    name: "SOC 2 Type II",
    status: "Audited annually",
    body: "Independent CPA audit covering the five Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy. Full report available under NDA — request from compliance@anyfigure.dev.",
  },
  {
    name: "GDPR",
    status: "Fully aligned",
    body: "Data Protection Officer appointed. Standard Contractual Clauses (Module Two) in place for any cross-border transfer. EU-only data residency available on the Enterprise plan. Right to access, rectification, erasure, portability, restriction, and objection are honoured for every data subject regardless of plan.",
  },
  {
    name: "HIPAA",
    status: "Business Associate Agreement available",
    body: "Enterprise customers processing Protected Health Information can execute a BAA with AnyFigure Labs Inc. Self-hosted deployment is recommended for clinical workflows so PHI never traverses our infrastructure.",
  },
  {
    name: "ISO 27001",
    status: "Certified",
    body: "Information Security Management System certified by an accredited body. Annual surveillance audits. Certificate available under NDA.",
  },
  {
    name: "CCPA / CPRA",
    status: "Honoured for all users",
    body: "California consumer rights (access, deletion, opt-out of sale, opt-out of profiling) are honoured for every user, not only California residents. AnyFigure never sells personal information.",
  },
  {
    name: "PIPEDA (Canada)",
    status: "Aligned",
    body: "Canadian privacy principles followed for all Canadian users. EU-aligned consent and breach notification standards apply.",
  },
];

export default function CompliancePage() {
  return (
    <LegalShell
      title="Compliance"
      updated="May 25, 2026"
      tagline="The certifications, attestations, and posture documents your security review team is going to ask for. All available."
    >
      <h2>Framework status</h2>
      <p>
        AnyFigure was designed from day one for biomedical and clinical research workflows.
        That meant adopting the strictest applicable framework for each control area and
        independently auditing against all of them annually.
      </p>

      {FRAMEWORKS.map((f) => (
        <div key={f.name} className="not-prose my-5 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-base font-semibold text-slate-900">{f.name}</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {f.status}
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{f.body}</p>
        </div>
      ))}

      <h2>Document requests</h2>
      <p>
        Email <a href="mailto:compliance@anyfigure.dev">compliance@anyfigure.dev</a> with your
        organisation name and the specific document you need. We share the following under a
        mutual NDA:
      </p>
      <ul>
        <li>SOC 2 Type II report (annual)</li>
        <li>ISO 27001 certificate (current cycle)</li>
        <li>Latest penetration-test executive summary (quarterly)</li>
        <li>Architecture &amp; data-flow diagram</li>
        <li>Incident-response playbook</li>
        <li>Business-continuity &amp; disaster-recovery plan</li>
        <li>Sub-processor list with DPAs</li>
        <li>Bring-your-own-key (BYOK) deployment architecture (Enterprise)</li>
      </ul>

      <h2>Security questionnaires</h2>
      <p>
        We complete CAIQ, SIG Lite, HECVAT, and custom security questionnaires for Enterprise
        prospects. Typical turnaround: 5 business days. For pre-sales engagements, our security
        engineer will join a call with your security team to walk through the answers.
      </p>

      <h2>Vulnerability disclosure</h2>
      <p>
        Report security issues to <a href="mailto:security@anyfigure.dev">security@anyfigure.dev</a>.
        We commit to acknowledgement within 24 hours, triage within 72 hours, and patch of critical
        issues within 7 days. Public credit (with consent) on our security advisories page.
      </p>
    </LegalShell>
  );
}
