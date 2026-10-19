import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Rocket, Smartphone, ShoppingCart, PenTool, RefreshCw, Users, HelpCircle,
  ArrowRight, ArrowLeft, Check, Loader2, PartyPopper, ShieldCheck, Clock, BookOpen
} from 'lucide-react';

/**
 * LeadCaptureForm — 3-step "Start your project free" flow.
 * Step 1: What would you like to build? (multi-select, at least one)
 * Step 2: Tell us about it (optional) + budget + timeline
 * Step 3: Contact details + preferred contact method + consent
 * Submits to /api/leads -> saved in the admin panel with a reference number.
 */

const PROJECT_OPTIONS = [
  { value: 'website', label: 'Website or landing page', icon: Globe },
  { value: 'web-app-saas', label: 'Web app or SaaS product', icon: Rocket },
  { value: 'mobile-app', label: 'Mobile app (iOS / Android)', icon: Smartphone },
  { value: 'ecommerce', label: 'E-commerce store', icon: ShoppingCart },
  { value: 'ui-ux', label: 'UI/UX design', icon: PenTool },
  { value: 'redesign', label: 'Redesign or fix an existing site/app', icon: RefreshCw },
  { value: 'hire-developers', label: 'Hire a developer or dev team', icon: Users },
  { value: 'other', label: 'Something else / not sure yet', icon: HelpCircle }
];

const SERVICE_LABELS: Record<string, string> = Object.fromEntries(PROJECT_OPTIONS.map((o) => [o.value, o.label]));

const BUDGET_OPTIONS = ['Under $1,000', '$1,000 - $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000+', 'Not sure yet'];
const TIMELINE_OPTIONS = ['As soon as possible', 'Within 1 month', '1 - 3 months', '3+ months', 'Flexible / just exploring'];
const CONTACT_METHODS = ['Email', 'Phone call', 'WhatsApp'] as const;

interface LeadCaptureFormProps {
  source?: string;
}

export function LeadCaptureForm({ source = 'homepage-cta' }: LeadCaptureFormProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [services, setServices] = useState<string[]>([]);
  const [projectBrief, setProjectBrief] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [contactMethod, setContactMethod] = useState<string>('Email');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  const canContinueStep1 = services.length > 0;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const canSubmit = name.trim().length > 1 && emailValid && consent;

  const toggleService = (value: string) => {
    setServices((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const goNext = () => { setDirection(1); setStep((s) => Math.min(2, s + 1)); };
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(0, s - 1)); };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please add your name, a valid email, and accept the contact consent so we can reply.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const selectedLabels = services.map((s) => SERVICE_LABELS[s] || s);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          company: company.trim() || null,
          service_interested: selectedLabels.join(', '),
          budget: budget || 'Not specified',
          timeline: timeline || 'Flexible / just exploring',
          notes: projectBrief.trim() ? `What they're trying to achieve: ${projectBrief.trim()}` : 'No project brief provided',
          source,
          website: honeypot,
          meta: {
            flow: 'free-project-plan-v2',
            services: selectedLabels,
            contact_preference: contactMethod,
            consent_given: consent
          }
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
          You&apos;re all set, {name.split(' ')[0]}! <PartyPopper className="w-6 h-6 text-emerald-400" />
        </h3>
        <p className="mt-3 text-white/70">
          Your request <span className="text-cyan-400 font-mono font-semibold">{reference}</span> has been received.
        </p>
        <div className="mt-6 max-w-md mx-auto text-left space-y-3">
          {[
            'We review what you shared.',
            `We contact you by ${contactMethod === 'Phone call' ? 'phone' : contactMethod === 'WhatsApp' ? 'WhatsApp' : 'email'} within one business day.`,
            'You get a free plan, timeline and quote — no obligation.'
          ].map((line, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
              <p className="text-white/70 text-sm">{line}</p>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-sm">
          <a href="/blog/how-much-does-a-website-cost" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-cyan-300 hover:border-cyan-400/40 transition">
            <BookOpen className="w-4 h-4" /> Website cost guide
          </a>
          <a href="/blog/saas-mvp-development-guide" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-cyan-300 hover:border-cyan-400/40 transition">
            <BookOpen className="w-4 h-4" /> SaaS MVP guide
          </a>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40">
          <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-cyan-400" /> Reply within one business day</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> 100% free, no obligation</span>
        </div>
      </motion.div>
    );
  }

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition';

  return (
    <div className="mt-10 max-w-4xl mx-auto rounded-[28px] border border-white/10 bg-[#0c1220]/80 p-5 md:p-8 shadow-[0_0_50px_rgba(34,210,255,0.12)] backdrop-blur-xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Free project plan</p>
          <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold text-white">
            {step === 0 && 'What would you like to build?'}
            {step === 1 && 'Tell us about it (optional)'}
            {step === 2 && 'Where should we send your free plan?'}
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
          {/* STEP 1 — What would you like to build? (pick one or more) */}
          {step === 0 && (
            <div>
              <p className="text-sm text-white/50 mb-4">Pick one or more — you can change this later.</p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {PROJECT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = services.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleService(opt.value)}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                        active
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_25px_rgba(34,211,238,0.18)]'
                          : 'border-white/10 bg-white/[0.03] hover:border-cyan-400/40 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-xl transition-colors ${active ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-black' : 'bg-cyan-500/10 text-cyan-400'}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className={`flex-1 text-sm font-semibold leading-snug ${active ? 'text-white' : 'text-white/75'}`}>{opt.label}</span>
                      <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${active ? 'bg-cyan-400 border-cyan-400' : 'border-white/25'}`}>
                        {active && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3.5} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Tell us about it (optional) + budget + timeline */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="lead-brief" className="block text-sm font-medium text-white/60">
                  What are you trying to achieve?{' '}
                  <span className="text-white/35">A few lines is plenty — skip it if you would rather talk it through.</span>
                </label>
                <textarea
                  id="lead-brief"
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  rows={4}
                  maxLength={4000}
                  placeholder="Example: I run a restaurant and need online bookings. Or: I have a SaaS idea and need an MVP to validate it…"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="lead-budget" className="block text-sm font-medium text-white/60">Budget <span className="text-white/35">(optional)</span></label>
                  <select
                    id="lead-budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer [&>option]:bg-[#0c1220]`}
                  >
                    <option value="">Select a range (optional)</option>
                    {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lead-timeline" className="block text-sm font-medium text-white/60">Timeline <span className="text-white/35">(optional)</span></label>
                  <select
                    id="lead-timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer [&>option]:bg-[#0c1220]`}
                  >
                    <option value="">Select a timeline (optional)</option>
                    {TIMELINE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Contact details */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-white/50">We reply within one business day. No spam, no obligation.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="lead-name" className="block text-sm font-medium text-white/60">Your name <span className="text-cyan-400">*</span></label>
                  <input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Alex Founder" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lead-email" className="block text-sm font-medium text-white/60">Email <span className="text-cyan-400">*</span></label>
                  <input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lead-phone" className="block text-sm font-medium text-white/60">Phone <span className="text-white/35">(optional)</span></label>
                  <input id="lead-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+1 (555) 123-4567" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lead-company" className="block text-sm font-medium text-white/60">Company <span className="text-white/35">(optional)</span></label>
                  <input id="lead-company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" placeholder="Acme Inc." className={inputClass} />
                </div>
              </div>
              <div className="space-y-2">
                <span className="block text-sm font-medium text-white/60">Best way to reach you</span>
                <div className="flex flex-wrap gap-2">
                  {CONTACT_METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setContactMethod(m)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${contactMethod === m ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-cyan-400/40 hover:text-white'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-cyan-500"
                />
                <span className="text-sm text-white/55">
                  I agree that Chronolyte may contact me about my project. See our{' '}
                  <a href="/privacy" className="text-cyan-400 hover:underline">privacy policy</a>.
                </span>
              </label>
              {/* Honeypot — bots fill this, humans never see it */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
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
              Skip
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
              <>Get my free plan <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
