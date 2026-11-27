import { useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const studies = [
  {
    image: 'turbine',
    name: 'Velocity rotor',
    description: 'A machined silver turbine with swept blades and an orange central bearing.',
    width: 796,
    smallWidth: 527,
    height: 815,
  },
  {
    image: 'helix',
    name: 'Torsion helix',
    description: 'An orange aluminium ribbon wound around a brushed titanium spindle.',
    width: 976,
    smallWidth: 540,
    height: 741,
  },
  {
    image: 'gyroscope',
    name: 'Orbital gimbal',
    description: 'A polished sphere suspended inside three intersecting metal rings.',
    width: 738,
    smallWidth: 530,
    height: 752,
  },
] as const;

export type StudyKind = (typeof studies)[number]['image'] | 'signal' | 'globe' | 'register' | 'folio';

function RegistrationMarks() {
  return (
    <>
      {['nw', 'ne', 'sw', 'se'].map((corner) => (
        <i key={corner} className={`register-mark register-mark--${corner}`} aria-hidden="true" />
      ))}
    </>
  );
}

/** Scale, centre lines and a slowly indexing dial sit behind the rendered object. */
function Dial() {
  return (
    <svg className="study-dial" viewBox="0 0 560 440" aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeWidth="0.8">
        <path d="M10 220h540M280 5v430" strokeDasharray="9 5 2 5" />
        <circle cx="280" cy="220" r="181" strokeDasharray="2 5" />
        <circle cx="280" cy="220" r="158" />
        <g className="study-dial__ticks">
          {Array.from({ length: 72 }, (_, i) => (
            <path key={i} d={i % 6 ? 'M280 34v3' : 'M280 30v9'} transform={`rotate(${i * 5} 280 220)`} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/** Decorative, purpose-drawn plates for the editorial, delivery and contact pages. */
function Plot({ kind }: { kind: StudyKind }) {
  return (
    <svg
      viewBox="0 0 420 280"
      className={`studio-plot studio-plot--${kind}`}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
    >
      {kind === 'globe' ? (
        <g transform="rotate(-23 210 140)">
          <circle cx="210" cy="140" r="105" />
          {[20, 45, 70, 90].map((rx) => (
            <ellipse key={rx} cx="210" cy="140" rx={rx} ry="105" />
          ))}
          {[-80, -55, -28, 0, 28, 55, 80].map((d) => (
            <ellipse key={d} cx="210" cy={140 + d} rx={Math.sqrt(105 ** 2 - d ** 2)} ry="10" />
          ))}
          <ellipse
            cx="210"
            cy="140"
            rx="139"
            ry="40"
            stroke="var(--signal)"
            strokeWidth="2.5"
            transform="rotate(48 210 140)"
          />
          <circle cx="284" cy="52" r="5" fill="var(--signal)" stroke="none" />
        </g>
      ) : kind === 'signal' ? (
        <g>
          {Array.from({ length: 36 }, (_, i) => (
            <path
              key={i}
              d={`M${22 + i * 1.9} ${142 + i * 1.6} C110 ${141 + i},115 ${15 + i * 1.1},182 ${57 + i * 2.2} S260 ${282 - i * 1.9},310 ${182 - i * 1.5} S350 ${91 + i * 1.1},400 ${103 + i * 1.6}`}
              stroke={i > 20 && i < 28 ? 'var(--signal)' : 'currentColor'}
            />
          ))}
        </g>
      ) : kind === 'folio' ? (
        <g transform="translate(0 -8)">
          {Array.from({ length: 19 }, (_, i) => (
            <path
              key={i}
              d={`M66 ${156 + i * 2.4}l90 -99q22 -10 56 14q30 -28 58 -22l84 85q-50 -2 -126 59q-64 -54 -162 -37Z`}
              fill={i === 0 ? 'var(--canvas)' : 'none'}
              stroke={i > 11 ? 'var(--signal)' : 'currentColor'}
              transform={`translate(0 ${i * 0.5})`}
            />
          ))}
        </g>
      ) : (
        <g transform="rotate(-19 210 140)">
          {Array.from({ length: 32 }, (_, i) => (
            <ellipse
              key={i}
              cx={210 + i * 0.5}
              cy={82 + i * 3.25}
              rx={90 + Math.sin(i / 5) * 18}
              ry="35"
              stroke={i >= 13 && i <= 19 ? 'var(--signal)' : 'currentColor'}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

export function StudioArtwork({
  kind = 'turbine',
  interactive = false,
}: {
  kind?: StudyKind;
  interactive?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const study = interactive ? studies[index] : studies.find((s) => s.image === kind);
  const captions: Record<string, string> = {
    globe: 'Orbital projection',
    signal: 'Signal paths',
    register: 'Section study',
    folio: 'Fold study',
  };
  const plotNumbers: Record<string, string> = { globe: '04', signal: '05', register: '06', folio: '07' };
  const serial = !study
    ? plotNumbers[kind]
    : interactive
      ? `0${index + 1}`
      : `0${
          Math.max(
            0,
            studies.findIndex((s) => s.image === kind),
          ) + 1
        }`;
  const change = (by: number) => setIndex((i) => (i + by + studies.length) % studies.length);
  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.pointerType !== 'mouse' || document.documentElement.dataset.motion !== 'on')
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty('--lean-x', `${-y * 7}deg`);
    event.currentTarget.style.setProperty('--lean-y', `${x * 9}deg`);
  };
  return (
    <figure
      className={`study-plate ${interactive ? 'study-plate--hero' : 'study-plate--inner'}`}
      aria-label={
        interactive ? 'Kinetic studies, an interactive series of studio artworks' : 'Studio illustration'
      }
    >
      <div
        className="study-field"
        onPointerMove={interactive ? trackPointer : undefined}
        onPointerLeave={
          interactive
            ? (e) => {
                e.currentTarget.style.removeProperty('--lean-x');
                e.currentTarget.style.removeProperty('--lean-y');
              }
            : undefined
        }
      >
        <RegistrationMarks />
        <div className="study-field__meta" aria-hidden="true">
          <span>
            {interactive ? 'Kinetic studies' : 'Studio studies'} / CL—{serial}
          </span>
          <span className="barcode" />
        </div>
        <Dial />
        {study && <span className="study-shadow" aria-hidden="true" />}
        {study ? (
          <div className="study-image-stage" key={study.image}>
            <img
              className={`study-object study-object--${study.image}`}
              src={`/images/studio/${study.image}.webp`}
              srcSet={`/images/studio/${study.image}-sm.webp ${study.smallWidth}w, /images/studio/${study.image}.webp ${study.width}w`}
              sizes={interactive ? '(max-width: 720px) 88vw, 43vw' : '(max-width: 720px) 85vw, 30vw'}
              width={study.width}
              height={study.height}
              fetchPriority={interactive ? 'high' : 'auto'}
              alt={study.description}
            />
          </div>
        ) : (
          <Plot kind={kind} />
        )}
        <span className="study-field__scale" aria-hidden="true">
          A—A
        </span>
      </div>
      <figcaption className="study-caption">
        <span aria-live={interactive ? 'polite' : undefined}>
          <b>FIG. {serial}</b>
          <span className="caption-slash">/</span>
          {study?.name ?? captions[kind]}
        </span>
        {interactive ? (
          <div className="study-controls">
            <button type="button" aria-label="Previous kinetic study" onClick={() => change(-1)}>
              <ArrowLeft size={16} />
            </button>
            <span aria-hidden="true">{serial} / 03</span>
            <button type="button" aria-label="Next kinetic study" onClick={() => change(1)}>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <i className="caption-rule" aria-hidden="true" />
        )}
      </figcaption>
    </figure>
  );
}

/** A sectional drawing of a rotating index ring for the closing invitation. */
export function ClosingDrawing() {
  return (
    <svg className="closing-drawing" viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <g stroke="currentColor" transform="translate(160 160)">
        {Array.from({ length: 48 }, (_, i) => (
          <path key={i} d="M73 -4 Q94 -22 136 -12 L126 -1 Q105 -8 74 1Z" transform={`rotate(${i * 7.5})`} />
        ))}
        <circle r="66" strokeDasharray="2 5" />
        <circle r="145" strokeDasharray="2 5" />
      </g>
    </svg>
  );
}
