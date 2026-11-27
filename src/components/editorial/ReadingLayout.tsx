import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/** Index the actual document, including CMS edits. Never maintain a second copy of the article. */
export function ReadingLayout({
  docKey,
  children,
  label = 'In this guide',
}: {
  docKey: string;
  children: ReactNode;
  label?: string;
}) {
  const body = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<{ id: string; title: string }[]>([]);
  const [current, setCurrent] = useState('');
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 901px)').matches);
  useEffect(() => {
    const headings = Array.from(body.current?.querySelectorAll('h2') ?? []);
    setEntries(
      headings
        .map((heading, index) => {
          if (!heading.id) heading.id = `section-${index + 1}`;
          return { id: heading.id, title: heading.textContent?.trim() ?? '' };
        })
        .filter((entry) => entry.title),
    );
    if (!headings.length) return;
    const update = () => {
      // Last heading to cross the reading line, not simply the last one intersecting.
      const line = Math.min(window.innerHeight * 0.28, 210);
      const active = headings.reduce(
        (last, heading) => (heading.getBoundingClientRect().top <= line ? heading : last),
        headings[0],
      );
      setCurrent(active.id);
    };
    update();
    const observer = new IntersectionObserver(update, { rootMargin: '0px 0px -72% 0px' });
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [docKey]);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const change = () => setOpen(mq.matches);
    mq.addEventListener('change', change);
    return () => mq.removeEventListener('change', change);
  }, []);
  return (
    <div className={`reading-layout ${entries.length < 2 ? 'reading-layout--solo' : ''}`}>
      {entries.length > 1 && (
        <aside className="reading-index">
          <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
            <summary>
              {label}
              <ChevronDown size={15} />
            </summary>
            <nav aria-label={label}>
              <ol>
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      aria-current={current === entry.id ? 'location' : undefined}
                      onClick={() => {
                        if (window.innerWidth <= 900) setOpen(false);
                      }}
                    >
                      {entry.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>
        </aside>
      )}
      <div className="reading-body" ref={body}>
        {children}
      </div>
    </div>
  );
}
