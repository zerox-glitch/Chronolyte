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
    tag: 'Concept project',
    alt: 'Atelier Estates concept website: an editorial property collection over a dusk photograph of a modern coastal house.',
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
  return <div className="art-site">
    <img src={slide.src} srcSet={slide.srcSet} sizes={SIZES} width={slide.width} height={slide.height} alt={slide.alt} fetchPriority={eager ? 'high' : 'auto'} loading={eager ? 'eager' : 'lazy'} decoding="async" onLoad={onReady} />
    <div className="art-site-shade" aria-hidden="true" />
    <div className="art-site-nav" aria-hidden="true"><span>ATELIER <i> / </i> ESTATES</span><span>Homes &nbsp;&nbsp; Journal &nbsp;&nbsp; ↗</span></div>
    <div className="art-site-copy" aria-hidden="true"><small>THE COASTAL COLLECTION &nbsp; / &nbsp; 01</small><strong>A place<br /><em>to belong.</em></strong><span>Thoughtfully chosen homes by the sea.</span><b>EXPLORE THE COLLECTION &nbsp; ↗</b></div>
    <div className="art-site-index" aria-hidden="true">01 — 04 <span>────────</span></div>
  </div>;
}

function CommerceArt({ slide, onReady }: { slide: HeroSlide; onReady: () => void }) {
  return <div className="art-commerce">
    <img src={slide.src} srcSet={slide.srcSet} sizes={SIZES} width={slide.width} height={slide.height} alt={slide.alt} loading="lazy" decoding="async" onLoad={onReady} />
    <div className="commerce-top" aria-hidden="true"><span>VERDANT &amp; CO.</span><span>SHOP &nbsp; ABOUT &nbsp; BAG (0)</span></div>
    <div className="commerce-card" aria-hidden="true"><small>THE DAILY RITUAL &nbsp; / &nbsp; 01</small><strong>Botanical<br /><em>face oil.</em></strong><p>A little nourishment, every day.</p><div className="commerce-rule"><span>30 ML &nbsp; · &nbsp; AMBER GLASS</span><span>+</span></div><b>ADD TO BAG <span>↗</span></b></div>
  </div>;
}

function BookingArt({ alt }: { alt: string }) {
  return <div className="art-booking" role="img" aria-label={alt}>
    <div className="booking-editorial" aria-hidden="true"><small>01 / MOBILE EXPERIENCE</small><strong>Make<br /><em>time.</em></strong><span>A simpler way to<br />book your next visit.</span><div className="booking-orbit">✳</div></div>
    <div className="booking-phone" aria-hidden="true"><div className="booking-status"><span>9:41</span><span>● ● ●</span></div><div className="booking-back">← <span>BOOKING</span> ···</div><div className="booking-head"><small>YOUR NEXT VISIT</small><strong>Find your<br />moment.</strong><p>Choose a day and time that works for you.</p></div><div className="booking-month">October <span>‹ &nbsp; ›</span></div><div className="booking-days"><span>M <b>12</b></span><span>T <b className="selected">13</b></span><span>W <b>14</b></span><span>T <b>15</b></span><span>F <b>16</b></span></div><div className="booking-label">AVAILABLE TIMES <span>3 OPTIONS</span></div><div className="booking-times"><span>09:00</span><span className="selected">10:30</span><span>14:00</span></div><div className="booking-confirm">Confirm booking <span>↗</span></div></div>
  </div>;
}

function SaasArt({ alt }: { alt: string }) {
  return <div className="art-workspace" role="img" aria-label={alt}><div className="workspace-shell" aria-hidden="true"><aside><div className="workspace-mark">✳</div><span>◫</span><span>▦</span><span>◷</span><span>⚙</span></aside><div className="workspace-main"><div className="workspace-top"><span>WORKSPACE &nbsp; / &nbsp; PROJECTS</span><span>◌ &nbsp; <b>JD</b></span></div><div className="workspace-title"><div><small>PROJECT OVERVIEW</small><strong>Launch plan<span> ✳</span></strong><p>Everything moving, in one place.</p></div><span className="workspace-button">+ New task</span></div><div className="workspace-tabs"><b>Board view</b><span>List view</span><span>Activity</span></div><div className="workspace-columns"><section><header>TO DO <span>02</span></header><article><small>DESIGN</small><b>Homepage direction</b><p>Visual exploration</p><footer>◉ &nbsp; JD <span>↗</span></footer></article><article><small>CONTENT</small><b>Product copy</b><p>First draft</p><footer>◉ &nbsp; AL</footer></article></section><section><header>IN REVIEW <span>01</span></header><article className="workspace-feature"><small>READY FOR REVIEW</small><b>Onboarding flow</b><p>Feedback incorporated</p><footer>◉ &nbsp; JD <span>→ APPROVE</span></footer></article></section><section><header>APPROVED <span>01</span></header><article><small>COMPLETE</small><b>Design system</b><p>Components &amp; styles</p><footer><Check size={12} /> &nbsp; Approved</footer></article></section></div></div></div></div>;
}

function AutomationArt({ alt }: { alt: string }) {
  return <div className="art-automation" role="img" aria-label={alt}><div className="automation-header" aria-hidden="true"><div><small>WORKFLOW / 01</small><strong>From enquiry<br /><em>to action.</em></strong></div><span>● &nbsp; ACTIVE</span></div><div className="automation-flow" aria-hidden="true"><div><span className="automation-icon"><Mail size={19}/></span><small>01 &nbsp; TRIGGER</small><strong>Enquiry arrives</strong><p>New message received</p></div><i>↓</i><div><span className="automation-icon"><ClipboardCheck size={19}/></span><small>02 &nbsp; ORGANISE</small><strong>Record created</strong><p>Details saved to workspace</p></div><i>↓</i><div><span className="automation-icon"><Send size={19}/></span><small>03 &nbsp; FOLLOW UP</small><strong>Reply prepared</strong><p>Draft ready for review</p></div></div><div className="automation-foot" aria-hidden="true"><span>LESS BUSYWORK.</span><span>MORE MOMENTUM. &nbsp; ↗</span></div></div>;
}

function WireframeArt({ alt }: { alt: string }) {
  return <div className="art-design" role="img" aria-label={alt}><div className="design-heading" aria-hidden="true"><small>THE DESIGN PROCESS &nbsp; / &nbsp; 01—02</small><strong>From thinking<br /><em>to feeling.</em></strong><span>Structure meets expression. ↗</span></div><div className="design-panels" aria-hidden="true"><div className="design-sketch"><div className="design-panel-label">01 / WIREFRAME <span>↗</span></div><div className="sketch-nav"><i/><i/><i/></div><div className="sketch-copy"><i/><i/><i/></div><div className="sketch-image"><span>×</span></div><div className="sketch-bottom"><i/><i/></div></div><div className="design-final"><div className="design-panel-label">02 / FINAL DESIGN <span>↗</span></div><div className="final-interface"><div className="final-nav">STUDIO / 01 <span>MENU &nbsp; ☰</span></div><div className="final-content"><small>SPACE TO SLOW DOWN</small><strong>Live<br /><em>beautifully.</em></strong><span>DISCOVER THE COLLECTION &nbsp; ↗</span></div><div className="final-photo" /></div></div></div></div>;
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
