import { useState, useRef, useEffect } from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { PhoneIcon } from './PhoneIcon';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CONTACT_WHATSAPP_URL } from '../constants/siteContact.js';

interface CallNowButtonProps {
  className?: string;
  [key: string]: unknown;
}

export function CallNowButton({ className, ...props }: CallNowButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div className={`relative ${className || ''}`} ref={ref} {...props}>
      <button
        type="button"
        aria-label={`Call or WhatsApp ${CONTACT_PHONE_DISPLAY}`}
        onClick={() => setOpen(v => !v)}
        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-sm font-semibold text-black hover:shadow-lg hover:shadow-cyan-500/30 transition-shadow flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Call Now
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#0c1220] shadow-lg shadow-cyan-500/10 overflow-hidden z-[100]">
          <a
            href={CONTACT_WHATSAPP_URL}
            className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-400" /> WhatsApp {CONTACT_PHONE_DISPLAY}
          </a>
          <a
            href={CONTACT_PHONE_TEL}
            className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-t border-white/5"
          >
            <PhoneIcon className="w-4 h-4 text-cyan-400" /> Call {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      )}
    </div>
  );
}
