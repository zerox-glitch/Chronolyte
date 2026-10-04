import { Link } from 'react-router-dom';

export function NavLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <span
        className="font-display font-bold text-xl tracking-wide text-white flex items-center"
        style={{ textShadow: '0 0 10px rgba(0,229,255,0.3)' }}
      >
        CHR
        {/* Glowing O */}
        <span className="relative inline-flex items-center justify-center w-5 h-5 mx-0.5">
          {/* Outer glow pulse */}
          <span
            className="absolute inset-[-3px] rounded-full bg-cyan-400/25 blur-md"
            style={{ animation: 'pulse-glow-optimized 2s ease-in-out infinite' }}
          />
          {/* Main ring */}
          <span
            className="absolute inset-0 rounded-full border-2 border-cyan-400"
            style={{
              boxShadow:
                '0 0 10px rgba(0,229,255,0.9), 0 0 20px rgba(0,229,255,0.5), inset 0 0 6px rgba(0,229,255,0.4)',
            }}
          />
          {/* Inner ring */}
          <span className="absolute inset-[2px] rounded-full border border-cyan-300/50" />
          {/* Horizontal flare */}
          <span className="absolute w-7 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
          {/* Vertical flare */}
          <span className="absolute h-7 w-[1.5px] bg-gradient-to-b from-transparent via-white/80 to-transparent opacity-70" />
          {/* Center dot */}
          <span
            className="absolute w-1.5 h-1.5 rounded-full bg-white"
            style={{ boxShadow: '0 0 5px #fff, 0 0 8px #00e5ff' }}
          />
        </span>
        NOLYTE
      </span>
    </Link>
  );
}
