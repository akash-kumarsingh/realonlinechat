'use client';

import { KeyboardEvent, Suspense, lazy, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Send, Users, ShieldAlert } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { loadProfile } from '@/lib/profile';
import { UserProfile, RoomMessage } from '@/types/chat';
import { formatTime } from '@/lib/utils';
import dynamic from 'next/dynamic';
import CopyButton from '@/components/ui/CopyButton';
import NicknameBadge from '@/components/ui/NicknameBadge';
import { notifyNicknameRenamed } from '@/lib/nickname';

// Sidebar loaded only when needed
const MembersSidebar = dynamic(() => import('./MembersSidebar'), { ssr: false });

// Emoji picker lazy loaded — Suspense & lazy from top-level react import
const EmojiPicker = lazy(() => import('@/components/ui/EmojiPicker'));

/* ─── Room metadata ──────────────────────────────────────────── */
const ROOM_META: Record<string, { name: string; emoji: string }> = {
  global:     { name: 'Global Chat',  emoji: '🌍' },
  gaming:     { name: 'Gaming',       emoji: '🎮' },
  music:      { name: 'Music',        emoji: '🎵' },
  movies:     { name: 'Movies & TV',  emoji: '🎬' },
  technology: { name: 'Technology',   emoji: '💻' },
  sports:     { name: 'Sports',       emoji: '⚽' },
  travel:     { name: 'Travel',       emoji: '✈️' },
  study:      { name: 'Study',        emoji: '📚' },
  anime:      { name: 'Anime',        emoji: '🌸' },
  books:      { name: 'Books',        emoji: '📖' },
  fitness:    { name: 'Fitness',      emoji: '💪' },
  business:   { name: 'Business',     emoji: '💼' },
};

/* ─── Deterministic color ────────────────────────────────────── */
function nickColor(str: string): string {
  const p = ['#60a5fa','#a78bfa','#34d399','#f472b6','#fb923c','#facc15','#4ade80','#38bdf8'];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return p[Math.abs(h) % p.length];
}

/* ─── Message bubble (memoized) ──────────────────────────────── */
const MessageBubble = memo(function MessageBubble({
  message, isMe,
}: { message: RoomMessage; isMe: boolean }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1 px-4 roc-msg-in`}>
      <div className={`flex flex-col gap-0.5 max-w-[78%] sm:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <span
            className="text-[10px] font-semibold px-0.5"
            style={{ color: nickColor(message.nickname) }}
          >
            {message.nickname}
          </span>
        )}
        <div className={isMe ? 'bubble-me px-3.5 py-2.5' : 'bubble-stranger px-3.5 py-2.5'}>
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#2a2a2a] px-0.5">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
});

/* ─── Typing indicator for rooms ─────────────────────────────── */
const RoomTyping = memo(function RoomTyping({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label = names.length === 1
    ? `${names[0]} is typing`
    : `${names.slice(0, 2).join(', ')} are typing`;
  return (
    <div className="px-4 pb-1 animate-fade-in flex items-center gap-2" role="status" aria-label={label}>
      <div className="bubble-stranger px-3 py-2.5 flex items-center gap-2">
        <span className="text-sm leading-none" aria-hidden>✍️</span>
        <div className="flex items-center gap-[4px]">
          <span className="roc-typing-dot" />
          <span className="roc-typing-dot" style={{ animationDelay: '0.18s' }} />
          <span className="roc-typing-dot" style={{ animationDelay: '0.36s' }} />
        </div>
      </div>
      <span className="text-[10px] text-[#333]">{label}...</span>
    </div>
  );
});

/* ─── Main page ──────────────────────────────────────────────── */
export default function RoomChatPage({ roomId }: { roomId: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasJoinedRef = useRef(false);

  const meta = ROOM_META[roomId] || { name: 'Chat Room', emoji: '💬' };
  const nickname = profile?.nickname || 'Anonymous';

  const { state, joinRoom, leaveRoom, sendRoomMessage, handleRoomTyping, socketId } = useRoom(nickname);

  // Lazy-load onboarding modal
  const [OnboardingModal, setOnboardingModal] = useState<React.ComponentType<{ onComplete: (p: UserProfile) => void }> | null>(null);

  /* ── Load profile ── */
  useEffect(() => {
    const saved = loadProfile();
    if (saved.onboardingComplete) {
      setProfile(saved);
    } else {
      // Dynamically import onboarding only when needed
      import('@/components/ui/OnboardingModal').then(m => {
        setOnboardingModal(() => m.default);
        setShowOnboarding(true);
      });
    }
  }, []);

  /* ── Join room once profile ready ── */
  useEffect(() => {
    if (!profile || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    joinRoom(roomId, { id: roomId, ...meta, description: '' });
    return () => leaveRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  /* ── Auto scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  /* ── One-time toast if nickname was uniquified ── */
  useEffect(() => {
    if (state.myNickname) notifyNicknameRenamed(state.myNickname, profile?.nickname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.myNickname]);

  /* ── Send ── */
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    sendRoomMessage(trimmed);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, [inputValue, sendRoomMessage]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') setShowEmoji(false);
  }, [handleSend]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      setInputValue(prev => (prev + emoji).slice(0, 500));
      return;
    }
    const start = el.selectionStart ?? inputValue.length;
    const end   = el.selectionEnd   ?? inputValue.length;
    const next  = (inputValue.slice(0, start) + emoji + inputValue.slice(end)).slice(0, 500);
    setInputValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  }, [inputValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value.slice(0, 500));
    handleRoomTyping();
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [handleRoomTyping]);

  const handleOnboardingComplete = useCallback((p: UserProfile) => {
    setProfile(p);
    setShowOnboarding(false);
  }, []);

  /* ── Derived values ── */
  const typingNames = useMemo(
    () => Array.from(state.typingUsers.values()).filter(n => n !== (state.myNickname || nickname)),
    [state.typingUsers, state.myNickname, nickname],
  );

  const inputDisabled = !profile || showOnboarding;
  const canSend = !inputDisabled && inputValue.trim().length > 0;

  return (
    <div className="h-screen-safe flex flex-col bg-background overflow-hidden">
      {showOnboarding && OnboardingModal && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* ── Header ── */}
      <header className="flex items-center justify-between h-14 px-3 border-b border-[#0f0f0f] bg-black/95 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/rooms"
            className="btn btn-ghost btn-icon flex-shrink-0"
            aria-label="Back to rooms"
            prefetch
          >
            <ChevronLeft size={14} />
          </Link>
          <span className="text-lg flex-shrink-0" aria-hidden>{meta.emoji}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#d0d0d0] truncate leading-none">
              {meta.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {state.status === 'joined' && <div className="live-dot live-dot-pulse" />}
              <span className="text-[10px] text-[#333]">
                {state.status === 'joining'
                  ? 'Joining...'
                  : `${state.memberCount} online`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Members toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={`roc-members-btn ${sidebarOpen ? 'active' : ''}`}
            aria-label={sidebarOpen ? 'Hide members' : 'Show members'}
            aria-expanded={sidebarOpen}
          >
            <Users size={11} aria-hidden />
            <span className="font-mono">{state.memberCount}</span>
          </button>

          {/* Copy room ID */}
          <CopyButton
            value={roomId}
            label="Copy ID"
            successMessage={`Room ID copied: ${roomId}`}
            size="sm"
          />

          <Link href="/chat" className="btn btn-secondary !text-[11px] !h-8 !px-3" prefetch>
            1-on-1
          </Link>
        </div>
      </header>

      {/* ── Body: messages + sidebar ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Messages column */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
          <div
            className="flex-1 overflow-y-auto min-h-0"
            role="log"
            aria-label={`${meta.name} messages`}
            aria-live="polite"
          >
            {state.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#080808] border border-[#111] flex items-center justify-center text-xl">
                  {meta.emoji}
                </div>
                <p className="text-sm font-medium text-[#2a2a2a]">
                  {state.status === 'joining' ? 'Joining...' : 'No messages yet — say something!'}
                </p>
                {state.status === 'joining' && (
                  <div className="w-4 h-4 border border-[#2a2a2a] border-t-[#555] rounded-full animate-spin" />
                )}
              </div>
            ) : (
              <div className="py-3 space-y-0.5">
                {state.messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={msg.socketId === socketId}
                  />
                ))}
                <RoomTyping names={typingNames} />
                <div ref={bottomRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Safety banner */}
          <div className="trust-msg flex-shrink-0">
            <ShieldAlert size={10} className="text-[#1e1e1e] flex-shrink-0 mt-0.5" />
            <span>Never share personal or financial information in public rooms.</span>
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-[#0a0a0a] bg-[#030303] px-3 pb-3 pt-2">
            <div className={`roc-composer flex items-end gap-2 ${inputDisabled ? 'opacity-40' : ''}`}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={inputDisabled}
                placeholder={showOnboarding ? 'Set a nickname to chat...' : `Message ${meta.name}...`}
                rows={1}
                aria-label="Type a message"
                className="flex-1 bg-transparent px-3.5 py-3 text-sm text-[#ededed] placeholder-[#262626] resize-none focus:outline-none leading-relaxed disabled:cursor-not-allowed font-sans"
                style={{ maxHeight: '120px', minHeight: '44px' }}
              />
              <div className="flex items-end pb-2 pr-2 flex-shrink-0">
                {inputValue.length > 420 && (
                  <span className={`text-[10px] font-mono mr-1 pb-0.5 ${inputValue.length >= 480 ? 'text-red-400' : 'text-[#333]'}`}>
                    {500 - inputValue.length}
                  </span>
                )}
                {/* Emoji button */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmoji(p => !p)}
                    aria-label="Open emoji picker"
                    aria-expanded={showEmoji}
                    className={`roc-emoji-trigger ${showEmoji ? 'open' : ''}`}
                  >
                    😊
                  </button>
                  {showEmoji && (
                    <Suspense fallback={null}>
                      <EmojiPicker
                        onSelect={handleEmojiSelect}
                        onClose={() => setShowEmoji(false)}
                      />
                    </Suspense>
                  )}
                </div>

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  aria-label="Send message"
                  className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-100 ${
                    canSend
                      ? 'bg-white hover:bg-[#f0f0f0] text-black active:scale-95'
                      : 'bg-[#0d0d0d] text-[#222] cursor-not-allowed'
                  }`}
                >
                  <Send size={13} strokeWidth={2.5} aria-hidden />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-[#161616] select-none">
                Enter to send · Shift+Enter new line
              </p>
              <p className="text-[10px] text-[#161616] select-none flex items-center">
                <NicknameBadge
                  nickname={state.myNickname || nickname}
                  requested={nickname}
                  size="sm"
                />
              </p>
            </div>
          </div>
        </div>

        {/* Members sidebar */}
        <MembersSidebar
          members={state.members}
          typingUsers={state.typingUsers}
          mySocketId={socketId}
          myRequestedNickname={nickname}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
