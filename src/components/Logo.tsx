type LogoProps = {
  className?: string;
  /** Outer diamond stroke opacity (0–1). Default matches header: 0.4 */
  strokeOpacity?: number;
};

/** GRID mark: diamond outline (rotated square) with solid square center. */
export function Logo({ className = "h-7 w-7", strokeOpacity = 0.4 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 3.5 L28.5 16 L16 28.5 L3.5 16 Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="miter"
        strokeOpacity={strokeOpacity}
        className="transition-[stroke-opacity] group-hover:stroke-opacity-100"
      />
      <rect x="13.5" y="13.5" width="5" height="5" fill="currentColor" />
    </svg>
  );
}
