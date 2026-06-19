'use client';

import { memo } from 'react';

interface NicknameBadgeProps {
  /** Final nickname assigned by the server (globally unique) */
  nickname: string;
  /** The nickname the user originally chose, before any uniquification */
  requested?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Splits "Rahul_2" into { base: "Rahul", suffix: "_2" } for styling.
 * Returns suffix: null if there's no numeric suffix.
 */
function splitNickname(name: string): { base: string; suffix: string | null } {
  const match = name.match(/^(.+)(_\d+)$/);
  if (!match) return { base: name, suffix: null };
  return { base: match[1], suffix: match[2] };
}

/**
 * Displays a user's globally-unique nickname. If the server had to
 * append a suffix (e.g. "Rahul" -> "Rahul_2") because the requested
 * name was already taken, the suffix is shown in a muted tone and a
 * small dot indicator appears with an explanatory tooltip.
 */
const NicknameBadge = memo(function NicknameBadge({
  nickname,
  requested,
  size = 'sm',
  className = '',
}: NicknameBadgeProps) {
  const { base, suffix } = splitNickname(nickname);

  // Was this name auto-uniquified relative to what the user asked for?
  const wasModified =
    !!requested &&
    requested.trim().toLowerCase() !== nickname.toLowerCase() &&
    requested.trim().toLowerCase() === base.toLowerCase();

  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const dotSize = size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`font-medium text-[#d0d0d0] ${textSize} tracking-tight`}>
        {base}
        {suffix && (
          <span className="text-[#3a3a3a] font-mono">{suffix}</span>
        )}
      </span>

      {wasModified && (
        <span
          className={`inline-block rounded-full bg-[#2a2a2a] ${dotSize} flex-shrink-0`}
          role="img"
          aria-label={`"${requested}" was already taken — you're "${nickname}"`}
          title={`"${requested}" was already taken — you're "${nickname}"`}
        />
      )}
    </span>
  );
});

export default NicknameBadge;
