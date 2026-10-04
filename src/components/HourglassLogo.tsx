import { motion } from 'framer-motion';

// Animated Hourglass Logo with Arrow - Rotating with Glow
export function HourglassLogo({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`${className} relative`}
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      style={{ filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.6))' }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="hgCyanAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#0070ff" />
          </linearGradient>
          <linearGradient id="hgSilverAdmin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#c0c0c0" />
            <stop offset="100%" stopColor="#707070" />
          </linearGradient>
          <linearGradient id="hgArrowAdmin" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.1" />
            <stop offset="20%" stopColor="#00e5ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00ffff" />
            <stop offset="80%" stopColor="#00e5ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0070ff" />
          </linearGradient>
          <radialGradient id="hgFlashAdmin" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#00ffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
          <filter id="hgGlowAdmin" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hgBrightAdmin" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hgBurstAdmin" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path d="M 25 80 A 35 35 0 1 1 75 80" fill="none" stroke="url(#hgCyanAdmin)" strokeWidth="3" filter="url(#hgGlowAdmin)" opacity="0.85"/>
        <path d="M 28 77 A 31 31 0 1 1 72 77" fill="none" stroke="url(#hgSilverAdmin)" strokeWidth="1.5" opacity="0.4"/>

        {/* Hourglass outer cyan */}
        <g filter="url(#hgGlowAdmin)">
          <path d="M 35 18 L 65 18 L 65 24 L 55 46 L 55 54 L 65 76 L 65 82 L 35 82 L 35 76 L 45 54 L 45 46 L 35 24 Z" 
            fill="none" stroke="url(#hgCyanAdmin)" strokeWidth="3" strokeLinejoin="round"/>
        </g>
        
        {/* Hourglass inner silver */}
        <path d="M 38 21 L 62 21 L 62 25 L 53 45 L 53 55 L 62 75 L 62 79 L 38 79 L 38 75 L 47 55 L 47 45 L 38 25 Z" 
          fill="none" stroke="url(#hgSilverAdmin)" strokeWidth="2" strokeLinejoin="round" opacity="0.7"/>
        
        {/* Top/bottom bars */}
        <line x1="32" y1="18" x2="68" y2="18" stroke="url(#hgCyanAdmin)" strokeWidth="4" strokeLinecap="round" filter="url(#hgGlowAdmin)"/>
        <line x1="32" y1="82" x2="68" y2="82" stroke="url(#hgCyanAdmin)" strokeWidth="4" strokeLinecap="round" filter="url(#hgGlowAdmin)"/>
        <line x1="35" y1="21" x2="65" y2="21" stroke="url(#hgSilverAdmin)" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <line x1="35" y1="79" x2="65" y2="79" stroke="url(#hgSilverAdmin)" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>

        {/* Arrow beam */}
        <g filter="url(#hgBrightAdmin)">
          <line x1="5" y1="50" x2="95" y2="50" stroke="url(#hgArrowAdmin)" strokeWidth="4" strokeLinecap="round"/>
          <path d="M 90 50 L 100 50" stroke="url(#hgCyanAdmin)" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M 94 45 L 102 50 L 94 55" fill="none" stroke="url(#hgCyanAdmin)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>

        {/* Center burst */}
        <g filter="url(#hgBurstAdmin)">
          <circle cx="50" cy="50" r="8" fill="url(#hgFlashAdmin)"/>
          <circle cx="50" cy="50" r="4" fill="#ffffff"/>
          <line x1="50" y1="38" x2="50" y2="32" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="50" y1="62" x2="50" y2="68" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="38" y1="50" x2="32" y2="50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
          <line x1="62" y1="50" x2="68" y2="50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
          <line x1="42" y1="42" x2="38" y2="38" stroke="#00ffff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
          <line x1="58" y1="42" x2="62" y2="38" stroke="#00ffff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
          <line x1="42" y1="58" x2="38" y2="62" stroke="#00ffff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
          <line x1="58" y1="58" x2="62" y2="62" stroke="#00ffff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        </g>

        {/* Shattered fragments */}
        <g opacity="0.85">
          <polygon points="78,38 84,35 82,43" fill="url(#hgCyanAdmin)" filter="url(#hgGlowAdmin)"/>
          <polygon points="85,48 92,45 90,53" fill="url(#hgCyanAdmin)" filter="url(#hgGlowAdmin)"/>
          <polygon points="80,60 87,57 85,65" fill="url(#hgCyanAdmin)" filter="url(#hgGlowAdmin)"/>
          <polygon points="74,68 80,65 78,73" fill="url(#hgCyanAdmin)" filter="url(#hgGlowAdmin)"/>
          <polygon points="88,40 93,38 92,44" fill="#00e5ff" opacity="0.7"/>
          <polygon points="76,32 81,30 80,36" fill="#00e5ff" opacity="0.6"/>
          <polygon points="84,70 89,68 88,74" fill="#00e5ff" opacity="0.6"/>
          <circle cx="94" cy="50" r="1.5" fill="#00e5ff" opacity="0.5"/>
          <circle cx="90" cy="58" r="1.2" fill="#00ffff" opacity="0.4"/>
          <circle cx="86" cy="35" r="1" fill="#00e5ff" opacity="0.4"/>
          <circle cx="78" cy="75" r="1.3" fill="#0070ff" opacity="0.4"/>
        </g>
      </svg>
    </motion.div>
  );
}
