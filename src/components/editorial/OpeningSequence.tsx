import { useEffect, useState } from 'react';
import { BrandMark } from './Brand';
import { useMotionPaused } from './MotionPreferences';

/** A short, non-blocking first-visit signature. It never hides page content from assistive technology. */
export function OpeningSequence() {
  const paused = useMotionPaused();
  const [show, setShow] = useState(() => {
    if (paused) return false;
    try { return sessionStorage.getItem('chronolyte.opening') !== 'seen'; } catch { return true; }
  });
  useEffect(() => {
    if (!show) return;
    if (paused) { setShow(false); return; }
    try { sessionStorage.setItem('chronolyte.opening', 'seen'); } catch { /* optional storage */ }
    const timer = window.setTimeout(() => setShow(false), 2350);
    return () => window.clearTimeout(timer);
  }, [show, paused]);
  if (!show || paused) return null;
  return <div className="opening-sequence" aria-hidden="true"><div className="opening-orbit opening-orbit--one"/><div className="opening-orbit opening-orbit--two"/><div className="opening-beam"/><div className="opening-brand"><BrandMark /><span className="opening-word">CHRONOLYTE</span><span className="opening-note">TIME <i>✳</i> LIGHT</span></div><div className="opening-line"/></div>;
}
