'use client';

import { useState, useCallback, memo } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface CopyButtonProps {
  value: string;
  label?: string;
  successMessage?: string;
  className?: string;
  size?: 'sm' | 'md';
}

const CopyButton = memo(function CopyButton({
  value,
  label,
  successMessage = 'Copied!',
  className = '',
  size = 'sm',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (copied) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(successMessage, {
        duration: 2000,
        icon: '✓',
        style: {
          background: '#0a0a0a',
          color: '#ededed',
          border: '1px solid #1e1e1e',
          fontSize: '12px',
          padding: '8px 12px',
        },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed. Try again.', { duration: 2000 });
    }
  }, [value, copied, successMessage]);

  const sizeClass = size === 'sm'
    ? 'h-7 px-2.5 text-[11px] gap-1.5'
    : 'h-8 px-3 text-xs gap-2';

  const iconSize = size === 'sm' ? 11 : 13;

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${label || 'to clipboard'}`}
      aria-live="polite"
      aria-atomic="true"
      className={`
        roc-copy-btn
        inline-flex items-center justify-center
        rounded-lg border font-medium
        transition-all duration-150 select-none
        ${sizeClass}
        ${copied
          ? 'border-[#22c55e]/30 bg-[#22c55e]/06 text-[#4ade80]'
          : 'border-[#1e1e1e] bg-[#080808] text-[#444] hover:border-[#2e2e2e] hover:text-[#888] hover:bg-[#0d0d0d]'
        }
        ${className}
      `}
    >
      {copied
        ? <Check size={iconSize} strokeWidth={2.5} aria-hidden />
        : <Copy size={iconSize} strokeWidth={1.8} aria-hidden />
      }
      {label && <span>{copied ? 'Copied' : label}</span>}
    </button>
  );
});

export default CopyButton;
