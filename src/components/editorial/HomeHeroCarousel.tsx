import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Mail, Pause, Play, Send } from 'lucide-react';
import { useMotionPaused } from './MotionPreferences';

const AUTOPLAY_MS = 6000;

type HeroSlideKind = 'website' | 'booking' | 'commerce' | 'saas' | 'automation' | 'wireframe';

interface HeroSlide {
  id: string;
  kind: HeroSlideKind;
  caption: string;
  tag?: string;
  alt: string;
  src?: string;
  srcSet?: string;
  width?: number;
  height?: number;
}

const SIZES = '(max-width: 760px) 92vw, 46vw';

/**
 * Homepage-only slide collection: six studio studies showing what visitors can
 * have built. Inner pages keep using StudioArtwork; this component never
 * touches those illustrations or their assets.
 */
export const HOME_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'website',
    kind: 'website',
    caption: 'Website design',
    alt: 'Website design study: an editorial website layout with navigation and headline type over a dusk photograph of a modern coastal house.',
    src: '/images/hero/website-960.webp',
    srcSet:
      '/images/hero/website-640.webp 640w, /images/hero/website-960.webp 960w, /images/hero/website-1280.webp 1280w',
    width: 960,
    height: 597,
  },
  {
    id: 'booking',
    kind: 'booking',
    caption: 'Mobile app design',
    alt: 'Mobile app design study: a phone showing a booking screen with selectable dates and times and a confirm button.',
  },
  {
    id: 'commerce',
    kind: 'commerce',
    caption: 'E-commerce',
    tag: 'Concept project',
    alt: 'E-commerce design study: amber skincare bottles and soap arranged with eucalyptus on stone, beside a product detail card.',
    src: '/images/hero/commerce-960.webp',
    srcSet:
      '/images/hero/commerce-640.webp 640w, /images/hero/commerce-960.webp 960w, /images/hero/commerce-1280.webp 1280w',
    width: 960,
    height: 597,
  },
  {
    id: 'saas',
    kind: 'saas',
    caption: 'SaaS workspace',
    alt: 'SaaS workspace study: a project board with cards moving from review to approval.',
  },
  {
    id: 'automation',
    kind: 'automation',
    caption: 'Automation',
    alt: 'Automation study: a three-step flow from an enquiry arriving to a record being created and a follow-up prepared.',
  },
  {
    id: 'wireframe',
    kind: 'wireframe',
    caption: 'UI/UX design',
    alt: 'UI/UX design study: a rough wireframe resolving into a finished interface.',
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

function WebsiteArt({ slide, eager, onReady }: { slide: HeroSlide; eager: boolean; onReady: () => void }) {
  return (
    <div className="hero-website">
      <div className="browser-chrome" aria-hidden="true">
        <span className="browser-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="browser-nav">Collection&nbsp;&nbsp;Journal&nbsp;&nbsp;Contact</span>
      </div>
      <div className="hero-photo">
        <img
          src={slide.src}
          srcSet={slide.srcSet}
          sizes={SIZES}
          width={slide.width}
          height={slide.height}
          alt={slide.alt}
          fetchPriority={eager ? 'high' : 'auto'}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={onReady}
        />
        <div className="website-overlay" aria-hidden="true">
          <span className="website-eyebrow">Coastal collection</span>
          <span className="website-headline">Homes by the sea.</span>
        </div>
      </div>
    </div>
  );
}

function CommerceArt({ slide, onReady }: { slide: HeroSlide; onReady: () => void }) {
  return (
    <div className="hero-commerce">
      <img
        src={slide.src}
        srcSet={slide.srcSet}
        sizes={SIZES}
        width={slide.width}
        height={slide.height}
        alt={slide.alt}
        loading="lazy"
        decoding="async"
        onLoad={onReady}
      />
      <div className="product-card" aria-hidden="true">
        <span className="product-card__eyebrow">Verdant &amp; Co. · Concept project</span>
        <span className="product-card__name">Botanical face oil</span>
        <span className="product-card__meta">30 ml · Amber glass</span>
        <span className="product-card__sizes">
          <i className="is-active" />
          <i />
          <i />
        </span>
        <span className="product-card__cta">Add to bag</span>
      </div>
    </div>
  );
}

function BookingArt({ alt }: { alt: string }) {
  return (
    <div className="hero-booking" role="img" aria-label={alt}>
      <div className="phone" aria-hidden="true">
        <div className="phone__status">
          <span>9:41</span>
          <span className="phone__dots">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="phone__title">Book a visit</div>
        <div className="phone__sub">Choose a time</div>
        <div className="phone__dates">
          <span>Mon 12</span>
          <span className="is-active">Tue 13</span>
          <span>Wed 14</span>
        </div>
        <div className="phone__times">
          <span>09:00</span>
          <span className="is-active">10:30</span>
          <span>12:00</span>
          <span>14:00</span>
          <span>15:30</span>
          <span>17:00</span>
        </div>
        <div className="phone__summary">Tue 13 · 10:30</div>
        <div className="phone__cta">
          <Check size={15} />
          Confirm booking
        </div>
      </div>
    </div>
  );
}

function SaasArt({ alt }: { alt: string }) {
  return (
    <div className="hero-saas" role="img" aria-label={alt}>
      <div className="saas-head" aria-hidden="true">
        <span className="saas-title">Launch plan</span>
        <span className="saas-pills">
          <i className="is-active">All</i>
          <i>Mine</i>
        </span>
      </div>
      <div className="saas-board" aria-hidden="true">
        <div className="saas-col">
          <div className="saas-col__head">
            To review <b>2</b>
          </div>
          <div className="saas-card">
            <span>Homepage hero</span>
            <span className="saas-card__meta">
              <i className="avatar" />
              <i className="chip">Design</i>
            </span>
          </div>
          <div className="saas-card">
            <span>Checkout flow</span>
            <span className="saas-card__meta">
              <i className="avatar" />
              <i className="chip">Build</i>
            </span>
          </div>
        </div>
        <div className="saas-col">
          <div className="saas-col__head">
            In review <b>3</b>
          </div>
          <div className="saas-card is-moving">
            <span>Onboarding email</span>
            <span className="saas-card__meta">
              <i className="avatar" />
              <i className="chip">Copy</i>
            </span>
            <span className="saas-move">Move to approved →</span>
          </div>
          <div className="saas-card">
            <span>Settings page</span>
            <span className="saas-card__meta">
              <i className="avatar" />
              <i className="chip">Build</i>
            </span>
          </div>
        </div>
        <div className="saas-col">
          <div className="saas-col__head">
            Approved <b>1</b>
          </div>
          <div className="saas-card is-done">
            <span>Pricing page</span>
            <span className="saas-done">
              <Check size={12} />
              Approved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationArt({ alt }: { alt: string }) {
  return (
    <div className="hero-flow" role="img" aria-label={alt}>
      <div className="flow-node" aria-hidden="true">
        <span className="flow-num">01</span>
        <Mail size={18} />
        <span className="flow-title">Enquiry arrives</span>
        <span className="flow-sub">New message</span>
      </div>
      <div className="flow-link is-signal" aria-hidden="true">
        <i />
      </div>
      <div className="flow-node" aria-hidden="true">
        <span className="flow-num">02</span>
        <ClipboardCheck size={18} />
        <span className="flow-title">Record created</span>
        <span className="flow-sub">Saved automatically</span>
      </div>
      <div className="flow-link" aria-hidden="true">
        <i />
      </div>
      <div className="flow-node" aria-hidden="true">
        <span className="flow-num">03</span>
        <Send size={18} />
        <span className="flow-title">Follow-up prepared</span>
        <span className="flow-sub">Draft ready to send</span>
      </div>
    </div>
  );
}

function WireframeArt({ alt }: { alt: string }) {
  return (
    <div className="hero-wire" role="img" aria-label={alt}>
      <div className="wire-panel is-rough" aria-hidden="true">
        <span className="wire-label">Wireframe</span>
        <span className="w-bar" />
        <span className="w-hero" />
        <span className="w-cols">
          <i />
          <i />
        </span>
        <span className="w-btn" />
      </div>
      <div className="wire-arrow" aria-hidden="true">
        <ArrowRight size={26} />
      </div>
      <div className="wire-panel is-finished" aria-hidden="true">
        <span className="wire-label">Finished</span>
        <span className="f-bar">
          <i />
          <i />
          <i />
        </span>
        <span className="f-hero">Design that converts</span>
        <span className="f-cols">
          <i />
          <i />
        </span>
        <span className="f-btn">Start free</span>
      </div>
    </div>
  );
}

export function HomeHeroCarousel() {
  const motionPaused = useMotionPaused();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const rootRef = useRef<HTMLElement | null>(null);
  const indexRef = useRef(0);
  const loadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const markLoaded = useCallback((id: string) => {
    loadedRef.current.add(id);
  }, []);

  const preloadSlide = useCallback((slide: HeroSlide) => {
    const src = slide.src;
    if (!src || loadedRef.current.has(slide.id)) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        loadedRef.current.add(slide.id);
        resolve();
      };
      img.onerror = () => {
        loadedRef.current.add(slide.id);
        resolve();
      };
      img.src = src;
    });
  }, []);

  const advance = useCallback(() => {
    const next = (indexRef.current + 1) % HOME_HERO_SLIDES.length;
    const slide = HOME_HERO_SLIDES[next];
    if (slide.src && !loadedRef.current.has(slide.id)) {
      void preloadSlide(slide).then(() => setIndex(next));
    } else {
      setIndex(next);
    }
  }, [preloadSlide]);

  const playing =
    !motionPaused && !userPaused && !hoverPaused && !focusPaused && inView && tabVisible;

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(advance, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [playing, index, advance]);

  useEffect(() => {
    const next = HOME_HERO_SLIDES[(index + 1) % HOME_HERO_SLIDES.length];
    if (next.src) void preloadSlide(next);
  }, [index, preloadSlide]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void preloadSlide(HOME_HERO_SLIDES[2]);
    }, 1200);
    return () => clearTimeout(timer);
  }, [preloadSlide]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const goTo = (target: number) => {
    const next = ((target % HOME_HERO_SLIDES.length) + HOME_HERO_SLIDES.length) % HOME_HERO_SLIDES.length;
    const slide = HOME_HERO_SLIDES[next];
    if (slide.src && !loadedRef.current.has(slide.id)) {
      void preloadSlide(slide).then(() => setIndex(next));
    } else {
      setIndex(next);
    }
    setAnnouncement(`${slide.caption} — slide ${next + 1} of ${HOME_HERO_SLIDES.length}`);
  };

  const togglePause = () => {
    const next = !userPaused;
    setUserPaused(next);
    setAnnouncement(next ? 'Slideshow paused' : 'Slideshow playing');
  };

  const slide = HOME_HERO_SLIDES[index];

  return (
    <figure
      ref={rootRef}
      className="hero-stories"
      aria-roledescription="carousel"
      aria-label="Studio work in six studies: website design, mobile apps, e-commerce, SaaS, automation and UI/UX design"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={(e) => {
        // The pause/play toggle manages its own state; focusing it must not
        // block a Play press from resuming the slideshow.
        if (!(e.target as HTMLElement).closest('.hero-pause')) setFocusPaused(true);
      }}
      onBlur={() => setFocusPaused(false)}
    >
      <div className="hero-stage">
        {HOME_HERO_SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`hero-slide${i === index ? ' hero-slide--active' : ''}`}
            aria-hidden={i !== index}
          >
            {s.kind === 'website' && (
              <WebsiteArt slide={s} eager={i === 0} onReady={() => markLoaded(s.id)} />
            )}
            {s.kind === 'commerce' && <CommerceArt slide={s} onReady={() => markLoaded(s.id)} />}
            {s.kind === 'booking' && <BookingArt alt={s.alt} />}
            {s.kind === 'saas' && <SaasArt alt={s.alt} />}
            {s.kind === 'automation' && <AutomationArt alt={s.alt} />}
            {s.kind === 'wireframe' && <WireframeArt alt={s.alt} />}
          </div>
        ))}
      </div>
      <figcaption className="study-caption hero-caption">
        <span>
          <b>FIG. {pad(index + 1)}</b>
          <span className="caption-slash">/</span>
          {slide.caption}
          {slide.tag && <span className="hero-tag">{slide.tag}</span>}
        </span>
        <div className="study-controls hero-controls">
          <button type="button" aria-label="Previous slide" onClick={() => goTo(index - 1)}>
            <ArrowLeft size={16} />
          </button>
          <span aria-hidden="true">
            {pad(index + 1)} / {pad(HOME_HERO_SLIDES.length)}
          </span>
          <button type="button" aria-label="Next slide" onClick={() => goTo(index + 1)}>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className="hero-pause"
            aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
            aria-pressed={userPaused}
            title={userPaused ? 'Play slideshow' : 'Pause slideshow'}
            onClick={togglePause}
          >
            {userPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
      </figcaption>
      <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </figure>
  );
}
