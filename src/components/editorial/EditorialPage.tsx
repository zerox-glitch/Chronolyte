import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SiteNavigation } from '../SiteNavigation';
import { Footer } from '../Footer';
import { StudioArtwork, ClosingDrawing, type StudyKind } from './StudioArtwork';

export type SheetTone = 'paper' | 'white' | 'graphite' | 'fog' | 'alloy' | 'ink' | 'silver';

/** Shared masthead, content measure, skip target and colophon on all public routes. */
export function EditorialPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`ed-site ${className}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteNavigation />
      <main id="main-content" className="ed-main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

interface SheetProps {
  children: ReactNode;
  tone?: SheetTone;
  id?: string;
  className?: string;
  innerClassName?: string;
  wide?: boolean;
  medium?: boolean;
  narrow?: boolean;
  as?: 'section' | 'div' | 'article' | 'aside';
}
export function Sheet({
  children,
  tone = 'paper',
  id,
  className = '',
  innerClassName = '',
  wide,
  medium,
  narrow,
  as: Tag = 'section',
}: SheetProps) {
  const measure = wide ? 'wide' : medium ? 'medium' : narrow ? 'narrow' : 'standard';
  return (
    <Tag id={id} className={`ed-sheet ed-sheet--${tone} ${className}`}>
      <div className={`ed-sheet__inner ed-sheet__inner--${measure} ${innerClassName}`}>{children}</div>
    </Tag>
  );
}

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  tone?: SheetTone;
  children?: ReactNode;
  className?: string;
  study?: StudyKind;
  visual?: ReactNode;
}
export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  meta,
  tone = 'paper',
  children,
  className = '',
  study = 'register',
  visual,
}: PageHeroProps) {
  return (
    <Sheet tone={tone} className={`ed-hero ${className}`}>
      <div className="inner-hero-grid">
        <div className="inner-hero-copy">
          {eyebrow && (
            <p className="studio-eyebrow">
              <span className="signal-rule" />
              {eyebrow}
            </p>
          )}
          <h1 className="ed-hero__title">{title}</h1>
          {lede && <p className="ed-hero__lede">{lede}</p>}
          {actions && <div className="ed-btn-row ed-hero__actions">{actions}</div>}
          {children}
        </div>
        {visual || <StudioArtwork kind={study} />}
      </div>
      {meta && <div className="ed-hero__meta">{meta}</div>}
    </Sheet>
  );
}

export function LegalHero({ title, updated }: { title: string; updated: string }) {
  return (
    <Sheet className="legal-head" medium>
      <p className="studio-eyebrow">
        <span className="signal-rule" />
        Legal
      </p>
      <h1 className="ed-hero__title">{title}</h1>
      <p className="legal-dateline">{updated}</p>
    </Sheet>
  );
}
interface SectionHeadProps {
  rubric?: string;
  number?: string;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  className?: string;
}
export function SectionHead({ rubric, number, title, lede, aside, className = '' }: SectionHeadProps) {
  return (
    <div className={`ed-section-head ${className}`}>
      <div className="ed-section-head__body">
        {rubric && (
          <p className="ed-rubric">
            {rubric}
            {number && <span className="ed-rubric__num">{number}</span>}
          </p>
        )}
        <h2 className="ed-title">{title}</h2>
        {lede && <p className="ed-lede">{lede}</p>}
      </div>
      {aside}
    </div>
  );
}
interface CtaBandProps {
  id?: string;
  eyebrow?: string;
  number?: string;
  title: ReactNode;
  description?: ReactNode;
  primaryTo?: string;
  primaryLabel?: string;
  secondaryTo?: string;
  secondaryLabel?: string;
  extraAction?: ReactNode;
  children?: ReactNode;
  tone?: SheetTone;
  note?: string;
}
export function CtaBand({
  id,
  eyebrow = 'Ready when you are',
  number,
  title,
  description,
  primaryTo = '/contact',
  primaryLabel = 'Start your project free',
  secondaryTo = '/pricing',
  secondaryLabel = 'See pricing',
  extraAction,
  children,
  tone = 'ink',
  note,
}: CtaBandProps) {
  return (
    <Sheet id={id} tone={tone} innerClassName="ed-cta" className="ed-cta-sheet">
      <div className="ed-cta__body">
        <p className="ed-rubric">
          {eyebrow}
          {number && <span className="ed-rubric__num">{number}</span>}
        </p>
        <h2 className="ed-title">{title}</h2>
        {description && <p className="ed-lede">{description}</p>}
        <div className="ed-btn-row section-actions">
          <Link to={primaryTo} className="ed-btn ed-btn--onDark">
            {primaryLabel}
            <ArrowUpRight />
          </Link>
          {secondaryLabel && secondaryTo && (
            <Link to={secondaryTo} className="ed-btn ed-btn--ghostOnDark">
              {secondaryLabel}
            </Link>
          )}
          {extraAction}
        </div>
        {children}
        {note && <p className="ed-cta__note">{note}</p>}
      </div>
      <ClosingDrawing />
    </Sheet>
  );
}
