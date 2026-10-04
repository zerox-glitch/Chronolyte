import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export function Logo({ className = '', animated = true, size = 'md' }: LogoProps) {
  if (animated) {
    return (
      <motion.svg
        viewBox="0 0 200 200"
        className={`${sizeMap[size]} cursor-pointer ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ scale: 1.1 }}
      >
        <defs>
          <radialGradient id="oGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#00f5ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0080ff" stopOpacity="0.2" />
          </radialGradient>
          <filter id="glowO">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="100%" stopColor="#0080ff" />
          </linearGradient>
        </defs>

        {/* Large central circle "O" */}
        <motion.circle
          cx="100"
          cy="100"
          r="65"
          fill="none"
          stroke="url(#oGradient)"
          strokeWidth="4"
          filter="url(#glowO)"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* Inner circle ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="55"
          fill="none"
          stroke="url(#oGradient)"
          strokeWidth="2"
          opacity="0.5"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* Animated arrow passing through the O */}
        <motion.g
          filter="url(#glowO)"
          animate={{
            x: [-15, 15, -15],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Arrow shaft */}
          <line
            x1="20"
            y1="100"
            x2="80"
            y2="100"
            stroke="url(#arrowGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Arrow head */}
          <polygon
            points="85,100 72,92 78,100 72,108"
            fill="url(#arrowGradient)"
          />
          
          {/* Arrow glow particles trailing behind */}
          <circle cx="15" cy="100" r="2.5" fill="#00f5ff" opacity="0.6" />
          <circle cx="35" cy="100" r="1.5" fill="#00f5ff" opacity="0.4" />
          <circle cx="55" cy="100" r="2" fill="#0080ff" opacity="0.5" />
        </motion.g>

        {/* "R" text on the left */}
        <text
          x="35"
          y="110"
          fontSize="28"
          fontWeight="bold"
          fill="#ffffff"
          opacity="0.7"
          fontFamily="Arial, sans-serif"
        >
          R
        </text>
      </motion.svg>
    );
  }

  // Non-animated version
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
    >
      <defs>
        <radialGradient id="oGradientStatic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#00f5ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0080ff" stopOpacity="0.2" />
        </radialGradient>
        <filter id="glowOStatic">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="arrowGradientStatic" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f5ff" />
          <stop offset="100%" stopColor="#0080ff" />
        </linearGradient>
      </defs>

      {/* Large central circle "O" */}
      <circle
        cx="100"
        cy="100"
        r="65"
        fill="none"
        stroke="url(#oGradientStatic)"
        strokeWidth="4"
        filter="url(#glowOStatic)"
      />

      {/* Inner circle ring */}
      <circle
        cx="100"
        cy="100"
        r="55"
        fill="none"
        stroke="url(#oGradientStatic)"
        strokeWidth="2"
        opacity="0.5"
      />

      {/* Arrow passing through the O */}
      <g filter="url(#glowOStatic)">
        <line
          x1="20"
          y1="100"
          x2="80"
          y2="100"
          stroke="url(#arrowGradientStatic)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        <polygon
          points="85,100 72,92 78,100 72,108"
          fill="url(#arrowGradientStatic)"
        />
        
        <circle cx="15" cy="100" r="2.5" fill="#00f5ff" opacity="0.6" />
        <circle cx="35" cy="100" r="1.5" fill="#00f5ff" opacity="0.4" />
        <circle cx="55" cy="100" r="2" fill="#0080ff" opacity="0.5" />
      </g>

      {/* "R" text on the left */}
      <text
        x="35"
        y="110"
        fontSize="28"
        fontWeight="bold"
        fill="#ffffff"
        opacity="0.7"
        fontFamily="Arial, sans-serif"
      >
        R
      </text>
    </svg>
  );
}
