import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SiteNavigation } from '../SiteNavigation';
import { Footer } from '../Footer';

export type SheetTone = 'paper' | 'cream' | 'cherry' | 'lime' | 'mist' | 'ink' | 'blue';

/** Fixed sliced-wood slab sealed under a transparent resin pour. */
export function WoodStage() {
  return (
    <div className="ed-stage" aria-hidden="true">
      <div className="ed-stage__wood" />
      <div className="ed-stage__grain" />
      <div className="ed-stage__planks" />
      <div className="ed-stage__resin" />
      <div className="ed-stage__sheen" />
      <div className="ed-stage__vignette" />
    </div>
  );
}

interface EditorialPageProps {
  children: ReactNode;
  className?: string;
}

/** Shared shell for every public route: nav, wood/resin stage, sheets, footer. */
export function EditorialPage({ children, className = '' }: EditorialPageProps) {
  return (
    <div className={`ed-site ${className}`.trim()}>
      <WoodStage />
      <SiteNavigation />
      <main className="ed-main">{children}</main>
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

/** A sheet of paper resting on the resin slab. */
export function Sheet({
  children,
  tone = 'paper',
  id,
  className = '',
  innerClassName = '',
  wide = false,
  medium = false,
  narrow = false,
  as: Tag = 'section',
}: SheetProps) {
  const widthClass = wide ? 'ed-sheet__inner--wide' : medium ? 'ed-sheet__inner--medium' : narrow ? 'ed-sheet__inner--narrow' : '';
  return (
    <Tag id={id} className={`ed-sheet ed-sheet--${tone} ${className}`.trim()}>
      <div className={`ed-sheet__inner ${widthClass} ${innerClassName}`.trim()}>{children}</div>
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
}

/** Editorial hero used by every inner page. */
export function PageHero({ eyebrow, title, lede, actions, meta, tone = 'paper', children, className = '' }: PageHeroProps) {
  return (
    <Sheet tone={tone} className={`ed-hero ${className}`.trim()} innerClassName="ed-hero__body">
      <span className="ed-hero__asterisk" aria-hidden="true">✳︎</span>
      {eyebrow && <p className="ed-rubric">{eyebrow}</p>}
      <h1 className="ed-hero__title">{title}</h1>
      {lede && <p className="ed-hero__lede">{lede}</p>}
      {actions && <div className="ed-btn-row ed-hero__actions">{actions}</div>}
      {children}
      {meta && <div className="ed-hero__meta">{meta}</div>}
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
    <div className={`ed-section-head ${className}`.trim()}>
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
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  primaryTo?: string;
  primaryLabel?: string;
  secondaryTo?: string;
  secondaryLabel?: string;
  children?: ReactNode;
  tone?: SheetTone;
  note?: string;
}

export function CtaBand({
  eyebrow = 'Ready when you are',
  title,
  description,
  primaryTo = '/contact',
  primaryLabel = 'Start your project free',
  secondaryTo = '/pricing',
  secondaryLabel = 'See pricing',
  children,
  tone = 'ink',
  note,
}: CtaBandProps) {
  return (
    <Sheet tone={tone} innerClassName="ed-cta" className="ed-cta-sheet">
      <span className="ed-hero__asterisk" aria-hidden="true">✳︎</span>
      <div className="ed-cta__body">
        <p className="ed-rubric">{eyebrow}</p>
        <h2 className="ed-title">{title}</h2>
        {description && <p className="ed-lede">{description}</p>}
        <div className="ed-btn-row" style={{ marginTop: 'clamp(20px, 2.6vw, 32px)' }}>
          <Link to={primaryTo} className="ed-btn ed-btn--onDark">{primaryLabel}</Link>
          {secondaryLabel && secondaryTo && (
            <Link to={secondaryTo} className="ed-btn ed-btn--ghostOnDark">{secondaryLabel}</Link>
          )}
        </div>
        {children}
        {note && <p className="ed-cta__note">{note}</p>}
      </div>
    </Sheet>
  );
}
