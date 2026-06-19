'use client';

import { Globe, Lock, ArrowRight, MessageSquare, Pencil } from 'lucide-react';
import { ChatStatus, UserProfile } from '@/types/chat';
import { formatCount } from '@/lib/utils';
import MatchmakingScreen from './MatchmakingScreen';
import NicknameBadge from '@/components/ui/NicknameBadge';

const INTEREST_ICONS: Record<string, string> = {
  Gaming: '🎮', Movies: '🎬', Music: '🎵', Coding: '💻',
  Technology: '⚡', Sports: '⚽', Study: '📚', Travel: '✈️',
  Business: '💼', Anime: '🌸', Books: '📖', Fitness: '💪',
};

const PILLS = [
  { icon: Lock, text: 'Anonymous' },
  { icon: Globe, text: 'Worldwide' },
  { icon: MessageSquare, text: 'Free forever' },
];

interface StartScreenProps {
  status: ChatStatus;
  onlineCount: number;
  profile: UserProfile | null;
  /** Final, globally-unique nickname assigned by the server */
  myNickname?: string | null;
  onStart: () => void;
  onStop: () => void;
  onEditProfile: () => void;
}

export default function StartScreen({
  status,
  onlineCount,
  profile,
  myNickname,
  onStart,
  onStop,
  onEditProfile,
}: StartScreenProps) {
  const isSearching = status === 'waiting' || status === 'connecting';
  const isDisconnected = status === 'disconnected';

  if (isSearching) {
    return (
      <MatchmakingScreen
        onlineCount={onlineCount}
        profile={profile}
        onCancel={onStop}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      {/* Brand mark */}
      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-md">
        <MessageSquare size={22} className="text-black" strokeWidth={2} />
      </div>

      <h2 className="text-xl font-semibold text-text-primary mb-2 tracking-tight">
        {isDisconnected ? 'Chat ended' : 'Start a conversation'}
      </h2>
      <p className="text-sm text-text-secondary mb-1 text-balance max-w-xs">
        {isDisconnected
          ? 'The stranger has left. Ready for a new conversation?'
          : 'Meet a random stranger from anywhere in the world.'}
      </p>

      {/* Live count */}
      <div className="flex items-center justify-center gap-1.5 mt-3 mb-7">
        <div className="live-dot-ring" aria-hidden />
        <span className="text-xs text-text-tertiary">
          <span className="font-mono font-medium text-text-secondary">{formatCount(onlineCount)}</span>
          {' '}people online now
        </span>
      </div>

      {/* Profile summary card */}
      {profile && profile.nickname && (
        <div className="w-full max-w-xs mb-6 panel p-4 text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Your profile</p>
              <NicknameBadge
                nickname={myNickname || profile.nickname}
                requested={profile.nickname}
                size="md"
              />
              {profile.country && (
                <p className="text-xs text-text-tertiary mt-0.5">🌍 {profile.country}</p>
              )}
            </div>
            <button
              onClick={onEditProfile}
              className="btn btn-ghost btn-icon flex-shrink-0"
              aria-label="Edit profile"
              title="Edit profile"
            >
              <Pencil size={12} />
            </button>
          </div>

          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 5).map(i => (
                <span key={i} className="interest-tag">
                  {INTEREST_ICONS[i]} {i}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main CTA */}
      <button
        onClick={onStart}
        className="btn btn-primary btn-primary-lg group mb-5 w-full max-w-xs"
        aria-label="Start chatting"
      >
        {isDisconnected ? 'New Chat' : 'Start Chatting'}
        <ArrowRight
          size={14}
          className="transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden
        />
      </button>

      {/* Trust pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {PILLS.map(({ icon: Icon, text }) => (
          <span key={text} className="badge">
            <Icon size={9} aria-hidden />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
