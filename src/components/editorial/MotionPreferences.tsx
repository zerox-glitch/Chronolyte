import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { Pause, Play } from 'lucide-react';

const MotionContext = createContext({ paused: false, toggle: () => {} });
const media = '(prefers-reduced-motion: reduce)';

export function MotionPreferences({ children }: { children: ReactNode }) {
  const [systemReduced, setSystemReduced] = useState(() => window.matchMedia(media).matches);
  const [userPaused, setUserPaused] = useState(() => {
    try {
      return localStorage.getItem('chronolyte.motion') === 'paused';
    } catch {
      return false;
    }
  });
  const paused = systemReduced || userPaused;
  useEffect(() => {
    const mq = window.matchMedia(media);
    const change = () => setSystemReduced(mq.matches);
    mq.addEventListener('change', change);
    return () => mq.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'paused' : 'on';
  }, [paused]);
  const toggle = () => {
    if (systemReduced) return;
    setUserPaused(!userPaused);
    try {
      localStorage.setItem('chronolyte.motion', userPaused ? 'on' : 'paused');
    } catch {
      /* optional preference */
    }
  };
  return (
    <MotionContext.Provider value={{ paused, toggle }}>
      <MotionConfig reducedMotion={paused ? 'always' : 'user'}>{children}</MotionConfig>
    </MotionContext.Provider>
  );
}

export function MotionSwitch({ compact = false }: { compact?: boolean }) {
  const { paused, toggle } = useContext(MotionContext);
  return (
    <button
      className={`motion-switch ${compact ? 'motion-switch--compact' : ''}`}
      type="button"
      onClick={toggle}
      aria-label={paused ? 'Resume decorative motion' : 'Pause decorative motion'}
      aria-pressed={paused}
      title={paused ? 'Resume motion' : 'Pause motion'}
    >
      {paused ? <Play size={14} /> : <Pause size={14} />}
      {!compact && <span>Motion {paused ? 'off' : 'on'}</span>}
    </button>
  );
}
