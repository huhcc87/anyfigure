import LegalShell from "@/components/layout/LegalShell";

export const metadata = {
  title: "Terms of Service · AnyFigure",
  description: "The legal terms under which you use AnyFigure.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated="May 25, 2026"
      tagline="The rules of the road. We have kept this short and human-readable on purpose."
    >
      <h2>1. Who this applies to</h2>
      <p>
        These Terms govern your use of the AnyFigure website, application, and APIs (the
        &ldquo;Service&rdquo;). By using the Service you agree to these Terms.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be at least 16 years old, or have parental consent.</li>
        <li>You are responsible for the security of your sign-in credentials.</li>
        <li>One person per account, except for organisational accounts on the Team and Enterprise plans.</li>
      </ul>

      <h2>3. Your content, your rights</h2>
      <p>
        You retain all rights to the prompts you write and the figures you create. You grant us a
        limited licence to host, process, and display your content solely to provide the Service.
        That licence ends the moment you delete the content or your account.
      </p>
      <p>
        Generated scene graphs and exported figures are yours to use commercially, including in
        peer-reviewed publications, grant submissions, conference posters, and patent filings.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Generate figures that misrepresent experimental data or are intended to deceive.</li>
        <li>Reverse-engineer, scrape, or circumvent rate limits.</li>
        <li>Upload content you do not have the right to use.</li>
        <li>Build a competing AI scientific-figure service using our outputs to train a model.</li>
        <li>Process protected health information without an executed Business Associate Agreement.</li>
      </ul>

      <h2>5. AI output disclaimers</h2>
      <p>
        AI-generated figures are starting points. You are the scientist; you are responsible for
        verifying that any figure you publish accurately represents your experimental design,
        statistics, and conclusions. We make no warranty that generated content is free of errors,
        omissions, or hallucinations.
      </p>

      <h2>6. Subscriptions and billing</h2>
      <ul>
        <li>Subscriptions auto-renew. Cancel at any time from Settings → Billing.</li>
        <li>Refunds: unused annual prepayment is refunded pro-rata within 30 days of purchase.</li>
        <li>Price changes are notified ≥ 30 days in advance.</li>
      </ul>

      <h2>7. Service availability</h2>
      <p>
        We target 99.9% monthly uptime for paying customers. The full SLA, including credits for
        downtime, is at <a href="/sla">/sla</a>.
      </p>

      <h2>8. Termination</h2>
      <p>
        Either party may terminate the agreement at any time. We may suspend accounts for
        violations of the Acceptable Use policy or non-payment, with reasonable notice where
        possible.
      </p>

      <h2>9. Liability</h2>
      <p>
        To the maximum extent permitted by law, our aggregate liability is capped at the greater of
        (i) USD 100, or (ii) the fees you paid us in the 12 months preceding the claim. We are not
        liable for indirect, incidental, or consequential damages.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Delaware, USA (or, for EU customers,
        the laws of Ireland), excluding conflict-of-law rules.
      </p>

      <h2>11. Contact</h2>
      <p>
        Legal: <a href="mailto:legal@anyfigure.dev">legal@anyfigure.dev</a>.
      </p>
    </LegalShell>
  );
}
