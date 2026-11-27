import { useEffect, useState } from 'react';
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
  eyebrow?: string;
  suggestion?: { value: string; id: number } | null;
}

export function LeadCaptureForm({ source = 'homepage-cta', eyebrow = 'Free project plan', suggestion }: LeadCaptureFormProps) {
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

  useEffect(() => {
    if (!suggestion || !PROJECT_OPTIONS.some(option => option.value === suggestion.value)) return;
    setServices(previous => previous.includes(suggestion.value) ? previous : [...previous, suggestion.value]);
  }, [suggestion]);

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
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ed-card lead-success" role="status"
        style={{ maxWidth: '46rem', margin: '0 auto', textAlign: 'center', padding: 'clamp(24px, 4vw, 44px)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
          style={{ width: 62, height: 62, margin: '0 auto 1.1rem', borderRadius: '50%', background: 'var(--signal-light)', border: '2px solid var(--accent-ink)', display: 'grid', placeItems: 'center' }}
        >
          <Check className="h-7 w-7" strokeWidth={3} style={{ color: 'var(--accent-ink)' }} />
        </motion.div>
        <p className="ed-rubric" style={{ justifyContent: 'center' }}>Request received</p>
        <h3 className="ed-title ed-title--xs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          You&apos;re all set, {name.split(' ')[0]}! <PartyPopper className="h-5 w-5" style={{ color: 'var(--accent-ink)' }} />
        </h3>
        <p className="ed-copy" style={{ marginTop: '0.6rem' }}>
          Your request <strong style={{ color: 'var(--accent-ink)', fontFamily: 'monospace' }}>{reference}</strong> has been received.
        </p>
        <div style={{ marginTop: '1.4rem', textAlign: 'left', display: 'grid', gap: '0.7rem' }}>
          {[
            'We review what you shared.',
            `We contact you by ${contactMethod === 'Phone call' ? 'phone' : contactMethod === 'WhatsApp' ? 'WhatsApp' : 'email'} within one business day.`,
            'You get a free plan, timeline and quote — no obligation.'
          ].map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
              <span style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', background: 'var(--signal-wash)', border: '1px solid var(--accent-ink)', color: 'var(--accent-ink)', fontSize: '0.7rem', fontWeight: 700, display: 'grid', placeItems: 'center' }}>{i + 1}</span>
              <p className="ed-copy" style={{ margin: 0, fontSize: '0.9rem' }}>{line}</p>
            </div>
          ))}
        </div>
        <div className="ed-btn-row" style={{ justifyContent: 'center', marginTop: '1.4rem' }}>
          <a href="/blog/how-much-does-a-website-cost" className="ed-btn ed-btn--ghost ed-btn--sm"><BookOpen className="h-4 w-4" /> Website cost guide</a>
          <a href="/blog/saas-mvp-development-guide" className="ed-btn ed-btn--ghost ed-btn--sm"><BookOpen className="h-4 w-4" /> SaaS MVP guide</a>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.4rem', justifyContent: 'center', marginTop: '1.2rem', fontSize: '0.74rem', color: 'var(--muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock className="h-3.5 w-3.5" /> Reply within one business day</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShieldCheck className="h-3.5 w-3.5" /> 100% free, no obligation</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="lead-panel">
      <div className="lead-head">
        <p className="lead-kicker">{eyebrow}</p>
        <div className="lead-progress" aria-label={`Step ${step + 1} of 3`}>
          <span>Step 0{step + 1} / 03</span>
          {[0, 1, 2].map(i => <i key={i} data-complete={i <= step} />)}
        </div>
      </div>
      <h3 className="lead-title" aria-live="polite">
        {step === 0 && 'What would you like to build?'}
        {step === 1 && 'Tell us about it (optional)'}
        {step === 2 && 'Where should we send your free plan?'}
      </h3>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 34 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -34 }}
          transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* STEP 1 — What would you like to build? (pick one or more) */}
          {step === 0 && (
            <div>
              <p className="ed-copy" style={{ margin: '0 0 0.9rem', fontSize: '0.9rem' }}>Pick one or more — you can change this later.</p>
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
                      className={`ed-choice ${active ? 'ed-choice--active' : ''}`}
                    >
                      <Icon className="choice-symbol" size={20} strokeWidth={1.6} />
                      <span className="choice-label">{opt.label}</span>
                      <span className="choice-check">{active && <Check size={12} strokeWidth={3} />}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Tell us about it (optional) + budget + timeline */}
          {step === 1 && (
            <div style={{ display: 'grid', gap: '1.1rem' }}>
              <div className="ed-field">
                <label htmlFor="lead-brief" className="ed-label">
                  What are you trying to achieve? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--muted)' }}>A few lines is plenty — skip it if you would rather talk it through.</span>
                </label>
                <textarea
                  id="lead-brief"
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  rows={4}
                  maxLength={4000}
                  placeholder="Example: I run a restaurant and need online bookings. Or: I have a SaaS idea and need an MVP to validate it…"
                  className="ed-textarea"
                  style={{ minHeight: 120 }}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ed-field">
                  <label htmlFor="lead-budget" className="ed-label">Budget <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <select id="lead-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="ed-select">
                    <option value="">Select a range (optional)</option>
                    {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="ed-field">
                  <label htmlFor="lead-timeline" className="ed-label">Timeline <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <select id="lead-timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)} className="ed-select">
                    <option value="">Select a timeline (optional)</option>
                    {TIMELINE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Contact details */}
          {step === 2 && (
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <p className="ed-copy" style={{ margin: 0, fontSize: '0.88rem' }}>We reply within one business day. No spam, no obligation.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ed-field">
                  <label htmlFor="lead-name" className="ed-label">Your name <span style={{ color: 'var(--accent-ink)' }}>*</span></label>
                  <input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Alex Founder" className="ed-input" />
                </div>
                <div className="ed-field">
                  <label htmlFor="lead-email" className="ed-label">Email <span style={{ color: 'var(--accent-ink)' }}>*</span></label>
                  <input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" className="ed-input" />
                </div>
                <div className="ed-field">
                  <label htmlFor="lead-phone" className="ed-label">Phone <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input id="lead-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+1 (555) 123-4567" className="ed-input" />
                </div>
                <div className="ed-field">
                  <label htmlFor="lead-company" className="ed-label">Company <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input id="lead-company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" placeholder="Acme Inc." className="ed-input" />
                </div>
              </div>
              <div className="ed-field">
                <span className="ed-label">Best way to reach you</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {CONTACT_METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setContactMethod(m)}
                      aria-pressed={contactMethod === m}
                      className={`ed-choice ${contactMethod === m ? 'ed-choice--active' : ''}`}
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="ed-check" style={{ marginTop: 3 }} />
                <span className="ed-copy" style={{ fontSize: '0.86rem' }}>
                  I agree that Chronolyte may contact me about my project. See our{' '}
                  <a href="/privacy" className="ed-link">privacy policy</a>.
                </span>
              </label>
              {/* Honeypot — bots fill this, humans never see it */}
              <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <div role="alert" className="ed-alert" style={{ marginTop: '1rem' }}>{error}</div>}

      {suggestion && <p className="ed-copy" role="status" style={{ marginTop: '1rem', fontSize: '0.84rem' }}>Suggested service: {SERVICE_LABELS[suggestion.value]}. You can edit your choices on step 1.</p>}

      {/* Footer actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.4rem' }}>
        <button
          type="button"
          onClick={goBack}
          className="ed-btn ed-btn--ghost ed-btn--sm"
          style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {step === 0 && (
          <button type="button" onClick={goNext} disabled={!canContinueStep1} className="ed-btn" style={{ opacity: canContinueStep1 ? 1 : 0.45, cursor: canContinueStep1 ? 'pointer' : 'not-allowed' }}>
            Next <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button type="button" onClick={goNext} className="ed-btn ed-btn--ghost ed-btn--sm">Skip</button>
            <button type="button" onClick={goNext} className="ed-btn">Next <ArrowRight className="h-4 w-4" /></button>
          </div>
        )}

        {step === 2 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="ed-btn"
            style={{ opacity: submitting || !canSubmit ? 0.45 : 1, cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>) : (<>Get my free plan <ArrowRight className="h-4 w-4" /></>)}
          </button>
        )}
      </div>
    </div>
  );
}
