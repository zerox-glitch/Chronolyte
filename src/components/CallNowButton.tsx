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
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="ed-btn ed-btn--sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Call now
      </button>
      {open && (
        <div className="absolute right-0 z-[100] mt-2 w-64 overflow-hidden rounded-[4px] border border-[#7b182a]/30 bg-[#f8f3e7] shadow-[6px_6px_0_rgba(123,24,42,0.18)]">
          <a
            href={CONTACT_WHATSAPP_URL}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#3e4c43] transition-colors hover:bg-[#c5de97]/50 hover:text-[#7b182a]"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#3f7a37]" /> WhatsApp {CONTACT_PHONE_DISPLAY}
          </a>
          <a
            href={CONTACT_PHONE_TEL}
            className="flex items-center gap-2 border-t border-[#7b182a]/15 px-4 py-3 text-sm font-semibold text-[#3e4c43] transition-colors hover:bg-[#c5de97]/50 hover:text-[#7b182a]"
          >
            <PhoneIcon className="w-4 h-4 text-[#7b182a]" /> Call {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      )}
    </div>
  );
}
