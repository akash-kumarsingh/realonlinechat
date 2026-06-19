import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'icon';
  height?: number;
  href?: string;
  className?: string;
}

/**
 * Real Online Chat logo — inline SVG.
 * No <Image> tag, no network request, instant render, retina-sharp.
 * variant="full"  → icon + wordmark (navbar, footer)
 * variant="icon"  → icon only (mobile, tight spaces)
 */
export default function Logo({
  variant = 'full',
  height = 28,
  href = '/',
  className = '',
}: LogoProps) {
  const content =
    variant === 'full' ? (
      // viewBox 200×36 → scale to requested height
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 36"
        height={height}
        width={Math.round(height * (200 / 36))}
        aria-label="Real Online Chat"
        role="img"
        style={{ display: 'block', flexShrink: 0 }}
      >
        {/* Chat bubble icon */}
        <rect x="0" y="2" width="28" height="20" rx="5" fill="#fff" />
        <circle cx="7"  cy="12" r="2" fill="#000" />
        <circle cx="14" cy="12" r="2" fill="#000" />
        <circle cx="21" cy="12" r="2" fill="#000" />
        <polygon points="5,21 12,21 5,28" fill="#fff" />
        {/* Wordmark */}
        <text
          x="36" y="20"
          fontFamily="-apple-system, 'Inter', 'SF Pro Display', BlinkMacSystemFont, sans-serif"
          fontSize="14"
          fontWeight="600"
          fill="#fff"
          letterSpacing="-0.25"
          dominantBaseline="middle"
        >
          Real Online Chat
        </text>
      </svg>
    ) : (
      // Icon only — 32×32 viewBox
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        height={height}
        width={height}
        aria-label="Real Online Chat"
        role="img"
        style={{ display: 'block', flexShrink: 0 }}
      >
        <rect width="32" height="32" rx="6" fill="#000" />
        <rect x="4" y="5" width="24" height="18" rx="4" fill="#fff" />
        <circle cx="10" cy="14" r="2" fill="#000" />
        <circle cx="16" cy="14" r="2" fill="#000" />
        <circle cx="22" cy="14" r="2" fill="#000" />
        <polygon points="8,22 15,22 8,30" fill="#fff" />
      </svg>
    );

  if (!href) {
    return <div className={`inline-flex items-center flex-shrink-0 ${className}`}>{content}</div>;
  }

  return (
    <Link
      href={href}
      aria-label="Real Online Chat — home"
      className={`inline-flex items-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-sm ${className}`}
    >
      {content}
    </Link>
  );
}
