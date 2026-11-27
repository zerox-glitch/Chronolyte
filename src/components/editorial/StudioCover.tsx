import { useState } from 'react';

interface CoverProps {
  src?: string;
  alt?: string;
  title: string;
  label?: string;
  eager?: boolean;
}

/** Always prefer the author's artwork. An unavailable remote image gets a graphic
 * index plate, not an invented screenshot of the customer's work. */
export function StudioCover({ src, alt, title, label = 'Studio notes', eager }: CoverProps) {
  const [failed, setFailed] = useState<string>();
  if (src && failed !== src)
    return (
      <img
        className="studio-cover-image"
        src={src}
        alt={alt || title}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        onError={() => setFailed(src)}
      />
    );
  const index = Array.from(title).reduce((sum, c) => sum + c.charCodeAt(0), 0) % 3;
  return (
    <div
      className={`graphic-cover graphic-cover--${index}`}
      role="img"
      aria-label={`Graphic cover for ${title}`}
    >
      <svg viewBox="0 0 440 230" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <g transform={`translate(225 115) rotate(${-24 + index * 13})`}>
          {Array.from({ length: 34 }, (_, i) => (
            <ellipse
              key={i}
              cx={(i - 17) * (index === 2 ? 2.9 : 2)}
              cy={Math.sin(i / 11) * 6}
              rx={80 + 15 * Math.sin(i / 11)}
              ry={66 - 19 * Math.cos(i / 9)}
              transform={`rotate(${i * (index === 1 ? 2.5 : 1)})`}
              stroke={i >= 12 && i < 20 ? 'var(--cover-accent)' : 'currentColor'}
              strokeWidth="1.35"
            />
          ))}
        </g>
      </svg>
      <span>
        {label} <i>/</i> CL
      </span>
    </div>
  );
}
