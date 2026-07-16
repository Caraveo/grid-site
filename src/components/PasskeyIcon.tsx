/** FIDO-style passkey mark — key + person (no external asset). */

type Props = {
  className?: string;
  title?: string;
};

export function PasskeyIcon({
  className = "h-8 w-8",
  title = "Passkey",
}: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* Person */}
      <circle cx="9" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 19.5c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Key shaft + bow */}
      <circle cx="17.5" cy="14.5" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M15.7 16.3L9.5 22.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.2 20.8h2.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
