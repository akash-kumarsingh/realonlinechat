'use client';

import Link from 'next/link';
import { SkipForward, Flag, Ban, ChevronLeft } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { ChatStatus } from '@/types/chat';
import OnlineCounter from '@/components/ui/OnlineCounter';

interface ChatHeaderProps {
  status: ChatStatus;
  onlineCount: number;
  onNext: () => void;
  onReport: () => void;
  onBlock: () => void;
}

const STATUS_CONFIG: Record<ChatStatus, { label: string; dotClass: string }> = {
  idle: { label: 'Not connected', dotClass: 'status-dot-idle' },
  connecting: { label: 'Connecting...', dotClass: 'status-dot-connecting' },
  waiting: { label: 'Finding someone...', dotClass: 'status-dot-waiting' },
  matched: { label: 'Connected', dotClass: 'status-dot-matched' },
  disconnected: { label: 'Disconnected', dotClass: 'status-dot-idle' },
};

export default function ChatHeader({
  status,
  onlineCount,
  onNext,
  onReport,
  onBlock,
}: ChatHeaderProps) {
  const cfg = STATUS_CONFIG[status];
  const isActive = status === 'matched';

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-[#111111] bg-black/95 backdrop-blur-xl flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/" prefetch
          className="btn btn-ghost btn-icon hidden sm:flex"
          aria-label="Back to home"
        >
          <ChevronLeft size={15} />
        </Link>

        <div className="hidden sm:flex">
          <Logo variant="full" height={28} />
        </div>
        <div className="flex sm:hidden">
          <Logo variant="icon" height={20} />
        </div>

        {/* Status */}
        <div className="status-indicator">
          <div className={`status-dot ${cfg.dotClass}`} />
          <span className="hidden sm:inline">{cfg.label}</span>
        </div>
      </div>

      {/* Center — online count on mobile */}
      <div className="sm:hidden">
        <OnlineCounter count={onlineCount} />
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <div className="hidden sm:block mr-2">
          <OnlineCounter count={onlineCount} />
        </div>

        {isActive && (
          <>
            <button
              onClick={onReport}
              title="Report this user"
              aria-label="Report user"
              className="btn btn-ghost btn-icon"
            >
              <Flag size={13} className="text-text-tertiary" />
            </button>
            <button
              onClick={onBlock}
              title="Block this user"
              aria-label="Block user"
              className="btn btn-danger btn-icon"
            >
              <Ban size={13} />
            </button>
            <div className="w-px h-4 bg-[#1a1a1a] mx-0.5" />
          </>
        )}

        <button
          onClick={onNext}
          aria-label="Next stranger"
          className="btn btn-primary"
        >
          <SkipForward size={13} />
          <span>Next</span>
        </button>
      </div>
    </header>
  );
}
