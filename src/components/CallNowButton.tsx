import { useState, useRef, useEffect, useId } from 'react';
import { ArrowUpRight, Phone, ChevronDown } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CONTACT_WHATSAPP_URL } from '../constants/siteContact.js';

export function CallNowButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return (
    <div
      className={`call-control ${className}`}
      ref={ref}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="call-trigger"
        aria-label={`Call or WhatsApp ${CONTACT_PHONE_DISPLAY}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <Phone size={15} />
        Call now
        <ChevronDown size={13} />
      </button>
      {open && (
        <div id={id} className="call-menu">
          <a href={CONTACT_WHATSAPP_URL}>
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp {CONTACT_PHONE_DISPLAY}
            <ArrowUpRight size={14} />
          </a>
          <a href={CONTACT_PHONE_TEL}>
            <Phone size={15} />
            Call {CONTACT_PHONE_DISPLAY}
            <ArrowUpRight size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
