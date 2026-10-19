import { Link } from 'react-router-dom';

interface BrandWordmarkProps {
  className?: string;
}

export function BrandWordmark({ className = 'text-xl' }: BrandWordmarkProps) {
  return (
    <span
      className={`font-display font-bold tracking-wide text-white flex items-center ${className}`}
      style={{ textShadow: '0 0 10px rgba(0,229,255,0.3)' }}
    >
      CHR
      <span className="relative inline-flex items-center justify-center w-5 h-5 mx-0.5">
        <span
          className="absolute inset-[-3px] rounded-full bg-cyan-400/25 blur-md"
          style={{ animation: 'pulse-glow-optimized 2s ease-in-out infinite' }}
        />
        <span
          className="absolute inset-0 rounded-full border-2 border-cyan-400"
          style={{ boxShadow: '0 0 10px rgba(0,229,255,0.9), 0 0 20px rgba(0,229,255,0.5), inset 0 0 6px rgba(0,229,255,0.4)' }}
        />
        <span className="absolute inset-[2px] rounded-full border border-cyan-300/50" />
        <span className="absolute h-[1.5px] w-7 bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
        <span className="absolute h-7 w-[1.5px] bg-gradient-to-b from-transparent via-white/80 to-transparent opacity-70" />
        <span className="absolute h-1.5 w-1.5 rounded-full bg-white" style={{ boxShadow: '0 0 5px #fff, 0 0 8px #00e5ff' }} />
      </span>
      NOLYTE
    </span>
  );
}

export function NavLogo() {
  return (
    <Link to="/" aria-label="Chronolyte home" className="flex shrink-0 items-center gap-2">
      <BrandWordmark />
    </Link>
  );
}
