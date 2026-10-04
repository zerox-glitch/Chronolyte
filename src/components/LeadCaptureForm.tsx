import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Rocket, Bot, Smartphone, Sparkles, HelpCircle,
  ArrowRight, ArrowLeft, Check, Loader2, PartyPopper, ShieldCheck, Clock
} from 'lucide-react';

/**
 * LeadCaptureForm — 3-step project starter.
 * Step 1: What do you want? (required choice)
 * Step 2: Tell us about it (optional)
 * Step 3: Contact details -> saved to the admin panel as a lead.
 */

const PROJECT_OPTIONS = [
  { value: 'website', label: 'Business Website', hint: 'Design & development that converts', icon: Globe },
  { value: 'saas', label: 'SaaS Product', hint: 'MVP to full platform', icon: Rocket },
  { value: 'automation', label: 'AI Automation', hint: 'Chatbots, agents & workflows', icon: Bot },
  { value: 'app', label: 'App / MVP', hint: 'Web & mobile apps, fast launches', icon: Smartphone },
  { value: 'ai-tools', label: 'Custom AI Tool', hint: 'Built around your data', icon: Sparkles },
  { value: 'other', label: 'Something Else', hint: 'Branding, e-commerce, consulting…', icon: HelpCircle }
];

const SERVICE_LABELS: Record<string, string> = {
  website: 'Business Website',
  saas: 'SaaS Product',
  automation: 'AI Automation',
  app: 'App / MVP',
  'ai-tools': 'Custom AI Tool',
  other: 'Something Else'
};

export function LeadCaptureForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [service, setService] = useState<string | null>(null);
  const [projectBrief, setProjectBrief] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  const canContinueStep1 = !!service;
  const canSubmit = name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const goNext = () => { setDirection(1); setStep((s) => Math.min(2, s + 1)); };
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(0, s - 1)); };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please add your name and a valid email so we can reach you.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const notes = projectBrief.trim()
        ? `Project brief: ${projectBrief.trim()}`
        : 'No project brief provided';
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          company: company.trim() || null,
          service_interested: SERVICE_LABELS[service || 'other'],
          budget: budget.trim() || 'Not specified',
          notes,
          source: 'homepage-cta',
          website: honeypot,
          meta: { flow: 'lead-capture-v2', step_service: service }
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || 'Something went wrong. Please try again.');
      }
      setReference(data.data?.reference_number || 'LD');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-10 max-w-3xl mx-auto rounded-[28px] border border-emerald-500/30 bg-[#0c1220]/85 p-8 md:p-10 text-center shadow-[0_0_60px_rgba(16,185,129,0.15)] backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
          className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        >
          <Check className="w-8 h-8 text-black" strokeWidth={3} />
        </motion.div>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          You&apos;re in! <PartyPopper className="w-6 h-6 text-emerald-400" />
        </h3>
        <p className="mt-3 text-white/70 max-w-md mx-auto">
          Your project request <span className="text-cyan-400 font-mono font-semibold">{reference}</span> is saved and
          a senior developer will reach out to <span className="text-white font-medium">{email}</span> within 24 hours.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" /> Reply within 24 hours</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400" /> Free quote, no obligation</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mt-10 max-w-4xl mx-auto rounded-[28px] border border-white/10 bg-[#0c1220]/80 p-5 md:p-8 shadow-[0_0_50px_rgba(34,210,255,0.12)] backdrop-blur-xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Start your project free</p>
          <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold text-white">
            {step === 0 && 'What do you want to build?'}
            {step === 1 && 'Tell us about it'}
            {step === 2 && 'Where can we reach you?'}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-gradient-to-r from-cyan-400 to-blue-500' : i < step ? 'w-4 bg-cyan-500/50' : 'w-4 bg-white/15'}`}
            />
          ))}
          <span className="ml-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
            Step {step + 1} / 3
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* STEP 1 — What do you want */}
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = service === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setService(opt.value); setTimeout(goNext, 180); }}
                    className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                      active
                        ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-[0_0_30px_rgba(34,211,238,0.2)]'
                        : 'border-white/10 bg-white/[0.03] text-white/75 hover:border-cyan-400/40 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center transition-colors ${active ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-black' : 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-xs text-white/45 mt-0.5">{opt.hint}</div>
                    {active && (
                      <Check className="absolute top-3 right-3 w-4 h-4 text-cyan-400" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2 — Tell us about it (optional) */}
          {step === 1 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/60" htmlFor="lead-brief">
                Describe your project <span className="text-white/35">(optional — skip if you prefer)</span>
              </label>
              <textarea
                id="lead-brief"
                value={projectBrief}
                onChange={(e) => setProjectBrief(e.target.value)}
                rows={5}
                maxLength={4000}
                placeholder="Example: I need a SaaS platform with subscriptions and a dashboard. Or: my restaurant website is slow and I want online bookings…"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
              />
              <div className="flex items-center justify-between text-xs text-white/35">
                <span>The more you share, the sharper your quote.</span>
                <span>{projectBrief.length}/4000</span>
              </div>
            </div>
          )}

          {/* STEP 3 — Contact details */}
          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="lead-name" className="block text-sm font-medium text-white/60">Full name <span className="text-cyan-400">*</span></label>
                <input
                  id="lead-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Alex Founder"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lead-email" className="block text-sm font-medium text-white/60">Email <span className="text-cyan-400">*</span></label>
                <input
                  id="lead-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lead-phone" className="block text-sm font-medium text-white/60">Phone / WhatsApp <span className="text-white/35">(optional)</span></label>
                <input
                  id="lead-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lead-company" className="block text-sm font-medium text-white/60">Company <span className="text-white/35">(optional)</span></label>
                <input
                  id="lead-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  placeholder="Acme Inc."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="lead-budget" className="block text-sm font-medium text-white/60">Budget range <span className="text-white/35">(optional — helps us tailor the quote)</span></label>
                <div className="flex flex-wrap gap-2">
                  {['< $2k', '$2k – $10k', '$10k – $25k', '$25k – $50k', '$50k+', 'Not sure yet'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget(budget === b ? '' : b)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        budget === b
                          ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                          : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-cyan-400/40 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-white/80 hover:bg-white/10 transition ${step === 0 ? 'invisible' : ''}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step === 0 && (
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinueStep1}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-3 font-semibold text-black transition hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {step === 1 && (
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={goNext}
              className="rounded-full border border-white/15 px-5 py-3 font-medium text-white/70 hover:bg-white/5 transition text-sm"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-3 font-semibold text-black transition hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 font-semibold text-black transition hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            ) : (
              <>Get My Free Quote <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-white/30">
        No spam, ever. We reply within 24 hours — usually much faster.
      </p>
    </div>
  );
}
