'use client';

import { useEffect, useState } from 'react';
import { formatCount } from '@/lib/utils';
import { UserProfile } from '@/types/chat';

const INTEREST_ICONS: Record<string, string> = {
  Gaming: '🎮', Movies: '🎬', Music: '🎵', Coding: '💻',
  Technology: '⚡', Sports: '⚽', Study: '📚', Travel: '✈️',
  Business: '💼', Anime: '🌸', Books: '📖', Fitness: '💪',
};

const STEPS = [
  'Finding someone online...',
  'Matching based on interests...',
  'Connecting...',
];

interface MatchmakingScreenProps {
  onlineCount: number;
  profile: UserProfile | null;
  onCancel: () => void;
}

export default function MatchmakingScreen({
  onlineCount,
  profile,
  onCancel,
}: MatchmakingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Advance steps every 1.4s
    const stepTimer = setInterval(() => {
      setStepIndex(prev => Math.min(prev + 1, STEPS.length - 1));
    }, 1400);

    // Elapsed seconds counter
    const elapsedTimer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepTimer);
      clearInterval(elapsedTimer);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center select-none">
      {/* Animated ring stack */}
      <div className="relative flex items-center justify-center mb-10" style={{ width: 80, height: 80 }}>
        {/* Outer rings */}
        <div
          className="matchmaking-ring"
          style={{ width: 80, height: 80, animationDelay: '0s' }}
          aria-hidden
        />
        <div
          className="matchmaking-ring"
          style={{ width: 80, height: 80, animationDelay: '0.8s' }}
          aria-hidden
        />
        <div
          className="matchmaking-ring"
          style={{ width: 80, height: 80, animationDelay: '1.6s' }}
          aria-hidden
        />

        {/* Center icon */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-[#1e1e1e] flex items-center justify-center">
          <div className="w-5 h-5 border-[1.5px] border-[#333333] border-t-[#888888] rounded-full animate-spin" />
        </div>
      </div>

      {/* Current step */}
      <div className="mb-6 h-6">
        <p className="text-sm font-medium text-text-secondary animate-fade-in" key={stepIndex}>
          {STEPS[stepIndex]}
        </p>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`step-dot ${i < stepIndex ? 'done' : i === stepIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-8">
        <div className="text-center">
          <div className="text-base font-mono font-semibold text-text-primary tabular-nums">
            {formatCount(onlineCount)}
          </div>
          <div className="text-[10px] text-text-tertiary">people online</div>
        </div>
        <div className="w-px h-6 bg-[#1a1a1a]" />
        <div className="text-center">
          <div className="text-base font-mono font-semibold text-text-primary tabular-nums">
            {elapsed}s
          </div>
          <div className="text-[10px] text-text-tertiary">elapsed</div>
        </div>
      </div>

      {/* Profile summary */}
      {profile && (profile.interests.length > 0 || profile.country) && (
        <div className="mb-8 max-w-xs">
          <p className="text-[10px] text-text-tertiary mb-2 uppercase tracking-wider">
            Matching your profile
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {profile.country && (
              <span className="interest-tag text-[10px]">
                🌍 {profile.country}
              </span>
            )}
            {profile.interests.slice(0, 4).map(i => (
              <span key={i} className="interest-tag text-[10px]">
                {INTEREST_ICONS[i]} {i}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onCancel}
        className="btn btn-secondary text-xs"
        aria-label="Cancel matchmaking"
      >
        Cancel
      </button>
    </div>
  );
}
