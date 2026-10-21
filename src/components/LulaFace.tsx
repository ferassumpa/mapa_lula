export function LulaFace({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      className="lula-blink drop-shadow-md"
    >
      <circle cx="32" cy="32" r="30" fill="#F5C542" stroke="#C9891A" strokeWidth="2" />
      <ellipse cx="32" cy="28" rx="22" ry="18" fill="#F7D98A" />
      <circle cx="22" cy="28" r="3.2" fill="#2A1A0A" />
      <circle cx="42" cy="28" r="3.2" fill="#2A1A0A" />
      <path
        d="M22 40c4 6 16 6 20 0"
        fill="none"
        stroke="#8B1E1E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M14 18c6-8 30-8 36 0-2 10-10 16-18 16S16 28 14 18Z"
        fill="#1B4332"
      />
      <circle cx="32" cy="10" r="5" fill="#E63946" />
    </svg>
  );
}
