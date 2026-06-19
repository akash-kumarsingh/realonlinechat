'use client';

import { useEffect, useRef } from 'react';
import { MapPin, Sparkles, MessageCircle } from 'lucide-react';
import { Interest } from '@/types/chat';
import { COUNTRIES } from '@/lib/countries';

/* ─── Types ──────────────────────────────────────────────────── */
export interface StrangerProfileProps {
  nickname?: string;
  country?: string;
  countryCode?: string;
  interests?: Interest[];
  myInterests?: Interest[];
}

/* ─── Constants ──────────────────────────────────────────────── */
const INTEREST_ICONS: Record<string, string> = {
  Gaming: '🎮', Movies: '🎬', Music: '🎵', Coding: '💻',
  Technology: '⚡', Sports: '⚽', Study: '📚', Travel: '✈️',
  Business: '💼', Anime: '🌸', Books: '📖', Fitness: '💪',
};

const ICEBREAKERS = [
  'Favorite movie? 🎬',
  'Music you like? 🎵',
  'Where are you from? 🌍',
];

const AVATAR_GRADIENTS = [
  ['#1a1a2e', '#16213e'], ['#0f3460', '#533483'],
  ['#1a1a1a', '#2d2d2d'], ['#1e1e2e', '#313244'],
  ['#16213e', '#0f3460'], ['#2d1b69', '#11998e'],
];

/* ─── Avatar ─────────────────────────────────────────────────── */
function Avatar({ nickname, size = 40 }: { nickname: string; size?: number }) {
  const letter = nickname?.[0]?.toUpperCase() || '?';
  const idx = nickname
    ? nickname.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length
    : 0;
  const [from, to] = AVATAR_GRADIENTS[idx];

  return (
    <div
      className="relative flex-shrink-0 rounded-full flex items-center justify-center select-none"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        border: '1.5px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}
      aria-hidden
    >
      <span
        className="font-semibold text-white"
        style={{ fontSize: size * 0.38, lineHeight: 1 }}
      >
        {letter}
      </span>
      <span
        className="absolute bottom-0 right-0 rounded-full border-2 border-[#080808] bg-[#22c55e]"
        style={{ width: size * 0.27, height: size * 0.27 }}
      />
    </div>
  );
}

/* ─── Pill ───────────────────────────────────────────────────── */
function Pill({ interest, shared, index }: { interest: Interest; shared: boolean; index: number }) {
  return (
    <span
      className={`roc-pill ${shared ? 'roc-pill-shared' : 'roc-pill-other'}`}
      style={{ animationDelay: `${index * 55}ms`, animationFillMode: 'both' }}
      aria-label={shared ? `${interest} — shared interest` : interest}
    >
      <span aria-hidden>{INTEREST_ICONS[interest] || '·'}</span>
      <span>{interest}</span>
      {shared && <span className="roc-shared-dot" aria-hidden />}
    </span>
  );
}

/* ─── Component ──────────────────────────────────────────────── */
export default function StrangerProfile({
  nickname = 'Anonymous',
  country, countryCode,
  interests = [], myInterests = [],
}: StrangerProfileProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const countryData = countryCode ? COUNTRIES.find(c => c.code === countryCode) : null;
  const flag = countryData?.flag || '';
  const displayCountry = countryData?.name || country || null;

  const shared = interests.filter(i => myInterests.includes(i));
  const other  = interests.filter(i => !myInterests.includes(i));

  const sharedShow = shared.slice(0, 4);
  const otherShow  = other.slice(0, 4);
  const sharedMore = Math.max(0, shared.length - 4);
  const otherMore  = Math.max(0, other.length - 4);

  const matchText = shared.length > 0
    ? 'Matched by shared interests'
    : displayCountry ? `Matched from ${displayCountry}` : 'Random match';

  // Animate in
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px) scale(0.985)';
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'opacity 380ms cubic-bezier(0.16,1,0.3,1), transform 380ms cubic-bezier(0.16,1,0.3,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    });
    return () => cancelAnimationFrame(raf);
  }, [nickname]);

  return (
      <div ref={cardRef} className="roc-card" role="region" aria-label="Stranger profile">
        {/* ── Top row: Avatar + Identity + Online badge ── */}
        <div className="flex items-center gap-3">
          <Avatar nickname={nickname} size={36} />

          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-center gap-2 flex-wrap leading-none">
              <span className="text-[13px] font-semibold text-[#ededed] tracking-tight">
                {nickname}
              </span>
              {displayCountry && (
                <span
                  className="flex items-center gap-1 text-[10px] text-[#3a3a3a]"
                  aria-label={`From ${displayCountry}`}
                >
                  {flag
                    ? <span aria-hidden>{flag}</span>
                    : <MapPin size={8} aria-hidden />
                  }
                  <span>{displayCountry}</span>
                </span>
              )}
            </div>

            {/* Match reason */}
            <div className="flex items-center gap-1 mt-[3px]">
              <Sparkles size={8} className="text-[#252525] flex-shrink-0" aria-hidden />
              <span className="text-[10px] text-[#2a2a2a]">{matchText}</span>
            </div>
          </div>

          {/* Online badge */}
          <div className="roc-online" aria-label="Stranger is online">
            <span className="w-[5px] h-[5px] rounded-full bg-[#22c55e] roc-pulse" aria-hidden />
            <span className="text-[10px] font-medium text-[#4ade80]">Online</span>
          </div>
        </div>

        {/* ── Interests ── */}
        {interests.length > 0 ? (
          <div className="mt-[10px]">
            {/* Shared */}
            {sharedShow.length > 0 && (
              <div className="mb-1.5">
                <span className="roc-label">Shared interests</span>
                <div className="flex flex-wrap gap-1.5" role="list" aria-label="Shared interests">
                  {sharedShow.map((i, idx) => (
                    <Pill key={i} interest={i} shared index={idx} />
                  ))}
                  {sharedMore > 0 && (
                    <span className="roc-pill-more">+{sharedMore} more</span>
                  )}
                </div>
              </div>
            )}

            {sharedShow.length > 0 && otherShow.length > 0 && (
              <div className="roc-divider" aria-hidden />
            )}

            {/* Other */}
            {otherShow.length > 0 && (
              <div>
                <span className="roc-label">
                  {sharedShow.length > 0 ? 'Other interests' : 'Interests'}
                </span>
                <div className="flex flex-wrap gap-1.5" role="list" aria-label="Other interests">
                  {otherShow.map((i, idx) => (
                    <Pill key={i} interest={i} shared={false} index={idx} />
                  ))}
                  {otherMore > 0 && (
                    <span className="roc-pill-more">+{otherMore}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="mt-[10px]">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageCircle size={10} className="text-[#252525]" aria-hidden />
              <span className="text-[10px] text-[#2e2e2e]">
                Start the conversation with a question 👋
              </span>
            </div>
            <div
              className="flex gap-1.5 flex-wrap"
              role="list"
              aria-label="Conversation starters"
            >
              {ICEBREAKERS.map(text => (
                <button
                  key={text}
                  className="roc-ice"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Conversation starter: ${text}`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
  );
}
