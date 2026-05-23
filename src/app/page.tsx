import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-indigo-400">
        <path d="M11 2L13.5 8H20L14.75 11.5L17 18L11 14.5L5 18L7.25 11.5L2 8H8.5L11 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
    title: "AI Figure Generation",
    description: "Describe your experiment in plain language. AnyFigure AI generates publication-ready scientific figures in seconds.",
    color: "from-indigo-500/10 to-violet-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-cyan-400">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M11 4v2M11 16v2M4 11h2M16 11h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: "Biomedical Asset Library",
    description: "500+ pre-drawn scientific assets: DNA helices, cell types, organelles, antibodies, pathways, lab equipment, and more.",
    color: "from-cyan-500/10 to-teal-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-emerald-400">
        <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M7 15l3-4 2.5 3 2-2.5L18 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
    title: "Figma-Style Workspace",
    description: "Infinite canvas with layers, precise controls, real-time collaboration, and a polished UI that researchers actually enjoy.",
    color: "from-emerald-500/10 to-green-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-violet-400">
        <path d="M4 16V6l7-3 7 3v10l-7 3-7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M11 3v16M4 6l7 3 7-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    title: "Multi-Panel Layouts",
    description: "Create complex multi-panel figures with automatic alignment, numbered labels, and journal-style formatting.",
    color: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-amber-400">
        <path d="M11 2v4M11 16v4M2 11h4M16 11h4M4.93 4.93l2.83 2.83M14.24 14.24l2.83 2.83M4.93 17.07l2.83-2.83M14.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Journal Style Presets",
    description: "One-click formatting for Nature, Science, Cell, NEJM, and Lancet. Match any journal's guidelines automatically.",
    color: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-rose-400">
        <path d="M4 17V8l7-5 7 5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 17v-5h4v5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
    title: "300 DPI Export",
    description: "Export as print-ready PNG, vector SVG, PDF, or PowerPoint at 300 DPI with optional transparent background.",
    color: "from-rose-500/10 to-pink-500/10",
    border: "border-rose-500/20",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Describe Your Figure",
    description: "Type a natural language prompt describing your experiment, hypothesis, or pathway. AnyFigure AI understands scientific context.",
    icon: "✏️",
  },
  {
    step: "02",
    title: "AI Generates a Plan",
    description: "Our AI creates a multi-panel layout plan with appropriate figure types, color palettes, and suggested annotations.",
    icon: "🤖",
  },
  {
    step: "03",
    title: "Edit in Workspace",
    description: "Refine every element in our Figma-like editor. Add biomedical assets, adjust colors, and perfect your figure.",
    icon: "🎨",
  },
  {
    step: "04",
    title: "Export & Publish",
    description: "Export publication-ready figures at 300 DPI in PNG, SVG, PDF, or PPTX format — ready for any journal submission.",
    icon: "📤",
  },
];

const templates = [
  { name: "CRISPR Editing Workflow", field: "Genomics", panels: 4, gradient: "from-teal-500 to-cyan-600" },
  { name: "RNA-seq Pipeline", field: "Genomics", panels: 6, gradient: "from-violet-500 to-indigo-600" },
  { name: "Tumor Microenvironment", field: "Oncology", panels: 4, gradient: "from-rose-500 to-red-600" },
  { name: "Microbiome Interaction", field: "Microbiology", panels: 3, gradient: "from-emerald-500 to-green-600" },
  { name: "Immunotherapy Pathway", field: "Immunology", panels: 5, gradient: "from-amber-500 to-orange-600" },
  { name: "Cell Signaling Cascade", field: "Cell Biology", panels: 4, gradient: "from-blue-500 to-indigo-600" },
];

const testimonials = [
  {
    quote: "AnyFigure AI cut our figure preparation time from days to hours. The biomedical asset library alone is worth it.",
    author: "Dr. Sarah Chen",
    role: "Cancer Biology Lab, MIT",
    avatar: "SC",
  },
  {
    quote: "We used it for our Nature submission graphical abstract. The AI-generated plan was surprisingly accurate.",
    author: "Prof. James Okonkwo",
    role: "Genomics Institute, Stanford",
    avatar: "JO",
  },
  {
    quote: "Finally a tool built specifically for biomedical researchers. The journal presets save us hours of reformatting.",
    author: "Dr. Yuki Tanaka",
    role: "Microbiome Research Center",
    avatar: "YT",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["5 AI generations/month", "Basic asset library", "PNG export", "3 projects"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For active researchers",
    features: ["Unlimited AI generations", "Full asset library (500+)", "PNG, SVG, PDF, PPTX export", "300 DPI export", "Unlimited projects", "Journal presets", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "$79",
    period: "/month",
    description: "For research labs & teams",
    features: ["Everything in Pro", "Up to 10 team members", "Shared workspace", "Custom brand assets", "API access", "Dedicated support", "Training session"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080C1C] text-white">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-radial from-indigo-500/15 via-violet-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse inline-block" />
            Now with DeepSeek-powered figure intelligence
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            <span className="text-white">AI Scientific Figures</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Built for Researchers
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Generate publication-ready biomedical figures from plain language prompts.
            Full workspace editor, 500+ scientific assets, and journal-style presets —
            all in one platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/ai-figure-studio"
              className="px-7 py-3.5 rounded-full text-base font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Start Generating Figures
            </Link>
            <Link
              href="/workspace"
              className="px-7 py-3.5 rounded-full text-base font-medium border border-white/15 text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Open Workspace →
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {["#6366F1", "#8B5CF6", "#06B6D4", "#10B981"].map((color, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#080C1C]" style={{ backgroundColor: color + "60" }} />
                ))}
              </div>
              <span>Trusted by 1,200+ researchers</span>
            </div>
            <span className="hidden sm:block text-zinc-700">•</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#F59E0B">
                  <path d="M7 1L8.5 5H13L9.5 7.5L11 12L7 9.5L3 12L4.5 7.5L1 5H5.5L7 1Z"/>
                </svg>
              ))}
              <span className="ml-1">4.9/5 from 340+ reviews</span>
            </div>
          </div>

          {/* Hero preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080C1C] pointer-events-none z-10" style={{ top: "60%" }} />
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-[#0F1629]">
              <div className="h-8 bg-[#0A0E1F] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  {["#EF4444", "#F59E0B", "#10B981"].map((c) => (
                    <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c + "80" }} />
                  ))}
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-48 h-3 rounded-sm bg-white/5" />
                </div>
              </div>
              {/* Mock workspace */}
              <div className="h-72 flex">
                <div className="w-12 bg-[#0A0E1F] border-r border-white/5 flex flex-col items-center gap-2 py-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-md bg-white/5" />
                  ))}
                </div>
                <div className="flex-1 relative overflow-hidden"
                  style={{
                    backgroundImage: "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                >
                  <div className="absolute top-8 left-8 w-48 h-32 rounded-lg border-2 border-indigo-500/40 bg-indigo-500/5 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🧬</div>
                      <div className="text-xs text-indigo-400/70">CRISPR Pathway</div>
                    </div>
                  </div>
                  <div className="absolute top-8 left-64 w-36 h-28 rounded-lg border-2 border-violet-500/40 bg-violet-500/5 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl mb-1">📊</div>
                      <div className="text-xs text-violet-400/70">Efficacy Chart</div>
                    </div>
                  </div>
                  <div className="absolute top-48 left-8 w-36 h-16 rounded border border-cyan-500/30 bg-cyan-500/5 flex items-center px-3">
                    <div className="text-xs text-cyan-400/60">Figure 1A. CRISPR-Cas9 targeting efficiency...</div>
                  </div>
                  <div className="absolute top-6 right-6 px-2.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-300 font-medium">
                    ✦ AI Generated
                  </div>
                </div>
                <div className="w-56 bg-[#0A0E1F] border-l border-white/5 p-3">
                  <div className="space-y-2">
                    {["Layers", "Properties", "AI Suggest"].map((t, i) => (
                      <div key={t} className={`h-7 rounded text-xs flex items-center px-2 ${i === 0 ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-zinc-600"}`}>
                        {t}
                      </div>
                    ))}
                    <div className="h-px bg-white/5 my-2" />
                    {["Panel A", "Panel B", "Legend"].map((l) => (
                      <div key={l} className="flex items-center gap-2 px-2 py-1">
                        <div className="w-2 h-2 rounded-sm bg-white/20" />
                        <span className="text-xs text-zinc-500">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Everything you need to publish
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Built specifically for biomedical researchers, with every tool you need to create, refine, and export world-class scientific figures.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`p-6 rounded-2xl bg-gradient-to-br ${feature.color} border ${feature.border} hover:scale-[1.02] transition-transform`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW ===== */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-[#0A0E1C]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-3">Workflow</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">From prompt to publication</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Four simple steps from your research idea to a journal-ready figure.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-indigo-500/30 to-transparent z-0 -translate-y-1/2" />
                )}
                <div className="relative bg-[#0F1629] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-colors">
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <div className="text-xs font-mono font-bold text-indigo-400 mb-1">{step.step}</div>
                  <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEMPLATES SHOWCASE ===== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-3">Templates</p>
              <h2 className="text-4xl font-bold tracking-tight">Start with a template</h2>
              <p className="text-zinc-400 mt-2">Professionally designed scientific figure templates for every research area.</p>
            </div>
            <Link href="/templates" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex-shrink-0">
              Browse all templates →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Link
                key={template.name}
                href="/workspace"
                className="group block rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all hover:shadow-lg hover:shadow-black/20"
              >
                <div
                  className={`h-40 bg-gradient-to-br ${template.gradient} relative flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}
                >
                  <div className="grid grid-cols-2 gap-2 w-28">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-md bg-white/15 border border-white/20 flex items-center justify-center text-white/60 text-xs font-bold">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-[#0F1629]">
                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                    {template.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{template.field}</span>
                    <span className="text-xs text-zinc-600">{template.panels} panels</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0A0E1C] to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl font-bold tracking-tight">Loved by researchers worldwide</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-[#0F1629] border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors">
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 13 13" fill="#F59E0B">
                      <path d="M6.5 1L8 5H12L8.75 7.5L10 11.5L6.5 9L3 11.5L4.25 7.5L1 5H5L6.5 1Z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.author}</div>
                    <div className="text-xs text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-bold tracking-tight mb-3">Simple, transparent pricing</h2>
            <p className="text-zinc-400">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 ${
                  plan.highlight
                    ? "bg-gradient-to-br from-indigo-500/15 to-violet-500/10 border-2 border-indigo-500/40"
                    : "bg-[#0F1629] border border-white/10"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-base font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{plan.description}</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-shrink-0 text-emerald-400">
                        <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/ai-figure-studio"
                  className={`block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/20"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-cyan-500/10 border border-indigo-500/20 p-12">
            <div className="absolute inset-0 bg-gradient-radial from-indigo-500/10 to-transparent" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to publish faster?
              </h2>
              <p className="text-zinc-400 text-lg mb-8">
                Join 1,200+ biomedical researchers creating publication-ready figures with AnyFigure AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/ai-figure-studio"
                  className="px-8 py-3.5 rounded-full text-base font-semibold bg-white text-black hover:bg-zinc-100 transition-all shadow-lg"
                >
                  Start for Free
                </Link>
                <Link
                  href="/workspace"
                  className="px-8 py-3.5 rounded-full text-base font-medium border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                  Explore Workspace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
