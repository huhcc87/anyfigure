import LegalShell from "@/components/layout/LegalShell";

export const metadata = {
  title: "Privacy Policy · AnyFigure",
  description:
    "How AnyFigure collects, uses, and protects your data when you generate scientific figures with our AI tools.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="May 25, 2026"
      tagline="Your research prompts and figures are yours. This policy explains exactly what we collect, why, and how to control it."
    >
      <h2>1. The short version</h2>
      <ul>
        <li>We never sell your data.</li>
        <li>Your prompts and generated figures are stored encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
        <li>You can export everything you have created and permanently delete your account at any time.</li>
        <li>We do not use your prompts to train foundation models. Period.</li>
        <li>Generation requests are forwarded to vetted model providers (Google Gemini, DeepSeek, OpenAI) under data-processing agreements that forbid training on your inputs.</li>
      </ul>

      <h2>2. What we collect</h2>
      <h3>Account data</h3>
      <p>
        Email address, display name, and authentication identifier from your sign-in provider (Clerk).
        We do not store passwords directly.
      </p>
      <h3>Prompt &amp; figure data</h3>
      <p>
        Research prompts you type, scene graphs we generate from them, your edits in the canvas
        editor, and the resulting exports. Stored only for the duration of your retention setting
        (default: 15 days for free tier, configurable on paid plans).
      </p>
      <h3>Usage telemetry</h3>
      <p>
        Aggregated, non-identifying counts: how many figures were generated, average composition
        time, error rates. Used solely to improve quality. No prompt content is included.
      </p>

      <h2>3. What we do NOT collect</h2>
      <ul>
        <li>Sensitive personal data unless you explicitly type it into a prompt (we recommend you don&apos;t — and our prompt guardrails will warn you if we detect PII or PHI patterns).</li>
        <li>Cross-site tracking pixels. We do not run third-party trackers or ad networks.</li>
        <li>Your biological or clinical patient data. The platform is designed for schematic figure work, not patient record processing.</li>
      </ul>

      <h2>4. How long we keep things</h2>
      <p>
        Free tier figures auto-delete after 15 days. On paid tiers you choose: 30 days, 90 days,
        1 year, or indefinite. Account metadata is removed within 30 days of account closure
        (some accounting records retained per legal obligation, anonymised).
      </p>

      <h2>5. Sub-processors</h2>
      <p>
        We rely on a small list of vetted vendors. All sub-processors are bound by a Data Processing
        Addendum prohibiting use of your data for any purpose other than serving your requests.
      </p>
      <ul>
        <li><strong>Clerk</strong> — authentication (US, SOC 2 Type II)</li>
        <li><strong>Vercel</strong> — application hosting (US/EU, ISO 27001)</li>
        <li><strong>Google Gemini API</strong> — vector scene generation (no training on inputs per enterprise terms)</li>
        <li><strong>DeepSeek / OpenAI</strong> — fallback LLM providers (no training on inputs)</li>
      </ul>

      <h2>6. Your rights under GDPR / CCPA</h2>
      <ul>
        <li>Right to access — request a JSON export of everything we hold on you.</li>
        <li>Right to rectification — edit any field directly in the app.</li>
        <li>Right to erasure — delete your account and all associated data in one click.</li>
        <li>Right to data portability — exports are open formats (SVG, PNG, PPTX, JSON scene graphs).</li>
        <li>Right to object — opt out of telemetry from Settings → Privacy.</li>
      </ul>

      <h2>7. Cookies</h2>
      <p>
        Strictly necessary cookies only — session token, theme preference. No third-party
        advertising cookies. We do not show a cookie consent banner because we have nothing
        to consent to that is not essential.
      </p>

      <h2>8. Contact</h2>
      <p>
        Privacy questions or data requests: <a href="mailto:privacy@anyfigure.dev">privacy@anyfigure.dev</a>.
        We respond within 5 business days. EU residents may also contact our DPO at the same address.
      </p>
    </LegalShell>
  );
}
