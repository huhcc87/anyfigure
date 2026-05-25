"use client";

import { useState } from "react";
import { toast } from "sonner";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

const REASONS = [
  { label: "Sales (Team / Enterprise plan)", email: "sales@anyfigure.dev" },
  { label: "Support (something is broken)", email: "support@anyfigure.dev" },
  { label: "Security disclosure", email: "security@anyfigure.dev" },
  { label: "Privacy / GDPR request", email: "privacy@anyfigure.dev" },
  { label: "Press & media", email: "press@anyfigure.dev" },
  { label: "General hello", email: "hello@anyfigure.dev" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(REASONS[0].label);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      toast.error("Email and message are required");
      return;
    }
    setSubmitting(true);
    // Demo build — no contact API wired yet. In production this hits /api/contact.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast.success("Message received. We reply within one business day.");
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-14">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-wider text-teal-700 font-semibold mb-2">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Talk to a human.</h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            One business day reply for support and sales. 24-hour acknowledgement for security
            disclosures. Pick the right inbox below or use the form.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Direct emails */}
          <aside className="md:col-span-2">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Direct email</h2>
            <ul className="space-y-2">
              {REASONS.map((r) => (
                <li key={r.email}>
                  <a href={`mailto:${r.email}`} className="block p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors">
                    <p className="text-xs font-semibold text-slate-900">{r.label}</p>
                    <p className="text-[11px] text-teal-700 font-mono mt-0.5">{r.email}</p>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 mb-2">Office</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                AnyFigure Labs Inc.<br />
                541 Jefferson Ave, Suite 100<br />
                Redwood City, CA 94063<br />
                United States
              </p>
            </div>
          </aside>

          {/* Form */}
          <form onSubmit={submit} className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Send us a message</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {REASONS.map((r) => <option key={r.email}>{r.label}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Message *</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 resize-y"
                placeholder="Tell us what you need…"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40"
            >
              {submitting ? "Sending…" : "Send message"}
            </button>
            <p className="text-[10px] text-slate-500 mt-3">
              By submitting you agree to our <a href="/privacy" className="underline">privacy policy</a>.
              We never share your details.
            </p>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
