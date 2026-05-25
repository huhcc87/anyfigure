"use client";

import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

interface Tier {
  name: string;
  tagline: string;
  price: string;
  cadence?: string;
  cta: { label: string; href: string };
  highlight?: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: "Free",
    tagline: "For grad students kicking the tyres.",
    price: "$0",
    cadence: "forever",
    cta: { label: "Start free", href: "/sign-up" },
    features: [
      "20 generated figures / month",
      "15-day figure retention",
      "Vector scene-graph generation",
      "PNG export",
      "Community templates",
    ],
  },
  {
    name: "Pro",
    tagline: "For working biologists shipping papers.",
    price: "$24",
    cadence: "/ month",
    highlight: true,
    cta: { label: "Start 14-day trial", href: "/sign-up?plan=pro" },
    features: [
      "Unlimited generations",
      "Unlimited retention",
      "SVG / PNG / PDF / PPTX export with editable text preserved",
      "Manual region-add tool for missed OCR labels",
      "Color-blind-safe presets (Okabe-Ito, Viridis, Wong)",
      "Journal templates (Nature, Cell, Science)",
      "Priority generation queue",
      "Email support, 1 business day",
    ],
  },
  {
    name: "Team",
    tagline: "For labs and biotech teams.",
    price: "$18",
    cadence: "/ seat / month",
    cta: { label: "Talk to us", href: "/contact?team=1" },
    features: [
      "Everything in Pro",
      "Shared library + folders with role-based access",
      "Real-time collaborative editing",
      "Workspace audit log",
      "SSO (Google, Microsoft, SAML)",
      "Centralised billing",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For pharma, biotech, large institutions.",
    price: "Custom",
    cta: { label: "Contact sales", href: "mailto:enterprise@anyfigure.dev" },
    features: [
      "Everything in Team",
      "Self-hosted deployment (Docker / Helm)",
      "Bring-your-own LLM endpoint (Azure OpenAI, vLLM, Together)",
      "Bring-your-own encryption keys (AWS / GCP KMS)",
      "Business Associate Agreement (HIPAA)",
      "Custom retention &amp; data residency (US / EU / APAC)",
      "Dedicated CSM + 99.95% SLA",
      "Custom security review &amp; pentest report sharing",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <p className="text-[11px] uppercase tracking-wider text-indigo-600 font-semibold mb-2">
            Pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            Plans that scale with your lab.
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Generate as many editable figures as your grant cycle demands. Start free, upgrade
            when you ship.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border bg-white p-6 flex flex-col ${
                tier.highlight
                  ? "border-indigo-300 ring-2 ring-indigo-200 shadow-lg"
                  : "border-slate-200"
              }`}
            >
              {tier.highlight && (
                <span className="inline-block self-start px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold mb-3">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">{tier.tagline}</p>
              <div className="mb-5">
                <span className="text-3xl font-bold text-slate-900">{tier.price}</span>
                {tier.cadence && (
                  <span className="text-xs text-slate-500 ml-1">{tier.cadence}</span>
                )}
              </div>
              <Link
                href={tier.cta.href}
                className={`block text-center px-3 py-2 rounded-full text-xs font-semibold transition-colors mb-5 ${
                  tier.highlight
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {tier.cta.label}
              </Link>
              <ul className="space-y-2 text-xs text-slate-700 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span dangerouslySetInnerHTML={{ __html: f }} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── FAQ ─── */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently asked</h2>
          <div className="space-y-4">
            {[
              {
                q: "Are generated figures truly editable, or just clickable text overlays?",
                a: "Truly editable. Our vector-first pipeline composes a scene graph (proteins, arrows, labels, biomedical assets) BEFORE rendering. Every element is a real SVG primitive in the canvas — you can drag it, resize it, recolor it, retype the label, replace the asset. No OCR roundtrip, no alignment issues.",
              },
              {
                q: "Will my prompts be used to train AI models?",
                a: "No. Our model providers (Gemini, DeepSeek, OpenAI) operate under enterprise DPAs that prohibit training on customer inputs. We never use your prompts to fine-tune our own models either.",
              },
              {
                q: "Can I export to PowerPoint with editable text?",
                a: "Yes. PPTX export preserves text as native PowerPoint text boxes, shapes as native shapes, arrows as native connectors. You can re-edit everything in PowerPoint after export.",
              },
              {
                q: "What if my institution requires self-hosting?",
                a: "The Enterprise plan ships a Docker / Helm deployment of the full stack with bring-your-own-LLM endpoints. Your data never leaves your infrastructure.",
              },
              {
                q: "How do I cancel?",
                a: "Settings → Billing → Cancel. Your subscription remains active until the end of the billing period. No phone calls.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-slate-200 bg-white p-5 open:shadow-sm"
              >
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-900 list-none">
                  {item.q}
                  <svg
                    className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
