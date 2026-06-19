'use client';

import { useEffect, useState } from 'react';
import { formatCount } from '@/lib/utils';

interface OnlineCounterProps {
  count: number;
  className?: string;
}

export default function OnlineCounter({ count, className = '' }: OnlineCounterProps) {
  const [displayed, setDisplayed] = useState(count);

  useEffect(() => {
    const t = setTimeout(() => setDisplayed(count), 100);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="live-dot-ring" aria-hidden />
      <span
        className="font-mono text-xs font-medium text-text-secondary tabular-nums"
        aria-live="polite"
        aria-label={`${displayed} users online`}
      >
        {formatCount(displayed)}
      </span>
      <span className="text-xs text-text-tertiary">online</span>
    </div>
  );
}
