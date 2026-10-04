export function PhoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22.54 6.46l-2.12-2.12a1.99 1.99 0 00-2.82 0l-2.12 2.12c-.78.78-.78 2.05 0 2.83l2.12 2.12c.78.78 2.05.78 2.83 0l2.12-2.12c.78-.78.78-2.05 0-2.83zM7 2H3c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-8h-2v8H3V4h4V2z"/>
    </svg>
  );
}
