'use client';

import { useEffect, useState, useRef, useCallback, memo, useMemo, KeyboardEvent, Suspense, lazy } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Send, Users, Copy, Check, ShieldAlert, Lock, UserX } from 'lucide-react';
import { usePrivateRoom, PrivateMessage } from '@/hooks/usePrivateRoom';
import { loadProfile } from '@/lib/profile';
import { UserProfile } from '@/types/chat';
import { formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const EmojiPicker = lazy(() => import('@/components/ui/EmojiPicker'));

function nickColor(str: string): string {
  const p = ['#60a5fa','#a78bfa','#34d399','#f472b6','#fb923c','#facc15','#4ade80','#38bdf8'];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return p[Math.abs(h) % p.length];
}

const MessageBubble = memo(function MessageBubble({
  message, isMe,
}: { message: PrivateMessage; isMe: boolean }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1 px-4 roc-msg-in`}>
      <div className={`flex flex-col gap-0.5 max-w-[78%] sm:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <span className="text-[10px] font-semibold px-0.5" style={{ color: nickColor(message.nickname) }}>
            {message.nickname}
          </span>
        )}
        <div className={isMe ? 'bubble-me px-3.5 py-2.5' : 'bubble-stranger px-3.5 py-2.5'}>
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-[10px] font-mono text-[#2a2a2a] px-0.5">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
});

function PrivateRoomChatInner({ code }: { code: string }) {
  const searchParams = useSearchParams();
  const pwd = decodeURIComponent(searchParams.get('pwd') || '');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const nickname = profile?.nickname || 'Anonymous';

  // usePrivateRoom handles socket connection internally
  const { state, joinRoom, leaveRoom, sendMessage, handleTyping, socketId, kickMember } = usePrivateRoom(nickname);

  // Load profile
  useEffect(() => {
    const saved = loadProfile();
    if (saved.onboardingComplete) setProfile(saved);
  }, []);

  // Join room — fires when profile, code, or pwd changes
  useEffect(() => {
    if (!profile) return;
    joinRoom(code, pwd);
    return () => leaveRoom();
  }, [profile, code, pwd, joinRoom, leaveRoom]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || state.status !== 'joined') return;
    sendMessage(trimmed);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, [inputValue, state.status, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape') setShowEmoji(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value.slice(0, 500));
    handleTyping();
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleEmojiSelect = useCallback((emoji: string) => {
    const el = textareaRef.current;
    if (!el) { setInputValue(p => (p + emoji).slice(0, 500)); return; }
    const start = el.selectionStart ?? inputValue.length;
    const end = el.selectionEnd ?? inputValue.length;
    const next = (inputValue.slice(0, start) + emoji + inputValue.slice(end)).slice(0, 500);
    setInputValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
    setShowEmoji(false);
  }, [inputValue]);

  const copyCode = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Room code copied: ${code}`);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const typingNames = useMemo(
    () => Array.from(state.typingUsers.values()).filter(n => n !== nickname),
    [state.typingUsers, nickname]
  );

  const canSend = state.status === 'joined' && inputValue.trim().length > 0;
  const isHost = state.room?.members.find(m => m.socketId === socketId)?.isAdmin || false;

  if (state.status === 'error') {
    return (
      <div className="h-screen-safe flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center mb-4">
          <Lock size={20} className="text-[#333]" />
        </div>
        <h2 className="text-base font-semibold text-[#ededed] mb-2">
          {state.error?.includes('removed') ? 'Removed from room' : 'Cannot join room'}
        </h2>
        <p className="text-sm text-[#555] mb-6">{state.error}</p>
        <Link href="/rooms" className="btn btn-secondary">Back to Rooms</Link>
      </div>
    );
  }

  return (
    <div className="h-screen-safe flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-3 border-b border-[#0f0f0f] bg-black/95 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/rooms" className="btn btn-ghost btn-icon flex-shrink-0" aria-label="Back">
            <ChevronLeft size={14} />
          </Link>
          <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            <Lock size={12} className="text-[#555]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#d0d0d0] truncate leading-none">
              {state.room?.name || 'Private Room'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {state.status === 'joined' && <div className="live-dot live-dot-pulse" />}
              <span className="text-[10px] text-[#333]">
                {state.status === 'joining' ? 'Joining...' : `${state.room?.memberCount || 0} online`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#1a1a1a] bg-[#080808] hover:border-[#2a2a2a] transition-all"
            aria-label={`Copy room code ${code}`}
          >
            <span className="text-[11px] font-mono font-semibold text-[#555] tracking-widest">{code}</span>
            {copied
              ? <Check size={10} className="text-[#22c55e]" />
              : <Copy size={10} className="text-[#333]" />}
          </button>

          <button
            onClick={() => setShowMembers(p => !p)}
            className={`roc-members-btn ${showMembers ? 'active' : ''}`}
          >
            <Users size={11} />
            <span className="font-mono">{state.room?.memberCount || 0}</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Messages + input */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
          <div className="flex-1 overflow-y-auto min-h-0" role="log" aria-live="polite">
            {state.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#080808] border border-[#111] flex items-center justify-center">
                  <Lock size={18} className="text-[#2a2a2a]" />
                </div>
                <p className="text-sm font-medium text-[#2a2a2a]">
                  {state.status === 'joining' ? 'Joining...' : 'Private room ready. Say something!'}
                </p>
                {state.room && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#222] font-mono">Code:</span>
                    <span className="text-[11px] font-mono font-bold text-[#444] tracking-widest">{code}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-3 space-y-0.5">
                {state.messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} isMe={msg.socketId === socketId} />
                ))}
                {typingNames.length > 0 && (
                  <div className="px-4 pb-1 animate-fade-in flex items-center gap-2" role="status">
                    <div className="bubble-stranger px-3 py-2.5 flex items-center gap-2">
                      <span className="text-sm leading-none" aria-hidden>✍️</span>
                      <div className="flex items-center gap-[4px]">
                        <span className="roc-typing-dot" />
                        <span className="roc-typing-dot" style={{ animationDelay: '0.18s' }} />
                        <span className="roc-typing-dot" style={{ animationDelay: '0.36s' }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-[#333]">
                      {typingNames.slice(0, 2).join(', ')} typing...
                    </span>
                  </div>
                )}
                <div ref={bottomRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Safety */}
          <div className="trust-msg flex-shrink-0">
            <ShieldAlert size={10} className="text-[#1e1e1e] flex-shrink-0 mt-0.5" />
            <span>Private room — only people with the code can join.</span>
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-[#0a0a0a] bg-[#030303] px-3 pb-3 pt-2">
            <div className={`roc-composer flex items-end gap-1.5 ${state.status !== 'joined' ? 'opacity-40' : ''}`}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={state.status !== 'joined'}
                placeholder="Message..."
                rows={1}
                aria-label="Type a message"
                className="flex-1 bg-transparent px-3.5 py-3 text-sm text-[#ededed] placeholder-[#282828] resize-none focus:outline-none leading-relaxed disabled:cursor-not-allowed font-sans"
                style={{ maxHeight: '120px', minHeight: '44px' }}
              />
              <div className="flex items-end pb-2 pr-2 gap-1 flex-shrink-0 relative">
                {inputValue.length > 420 && (
                  <span className={`text-[10px] font-mono pb-0.5 ${inputValue.length >= 480 ? 'text-red-400' : 'text-[#3a3a3a]'}`}>
                    {500 - inputValue.length}
                  </span>
                )}
                {state.status === 'joined' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowEmoji(p => !p)}
                      className={`roc-emoji-trigger ${showEmoji ? 'open' : ''}`}
                      aria-label="Open emoji picker"
                    >
                      😊
                    </button>
                    {showEmoji && (
                      <Suspense fallback={null}>
                        <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
                      </Suspense>
                    )}
                  </div>
                )}
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
              <p className="text-[10px] text-[#161616] select-none">Enter to send · Shift+Enter new line</p>
              <p className="text-[10px] text-[#161616] font-mono select-none">{nickname}</p>
            </div>
          </div>
        </div>

        {/* Members sidebar */}
        {showMembers && state.room && (
          <aside className="w-48 flex-shrink-0 border-l border-[#0f0f0f] bg-[#040404] flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-[#0f0f0f]">
              <Users size={11} className="text-[#2a2a2a]" />
              <span className="text-[10px] font-semibold text-[#333] uppercase tracking-wider">
                Members ({state.room.memberCount})
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {state.room.members.map(m => (
                <div key={m.socketId} className="flex items-center gap-2 px-3 py-2">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ background: `${nickColor(m.nickname)}18`, color: nickColor(m.nickname) }}
                  >
                    {m.nickname[0]?.toUpperCase()}
                  </div>
                  <span className="text-[11px] text-[#555] truncate">{m.nickname}</span>
                  <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                    {m.isAdmin && (
                      <span className="text-[9px] font-semibold text-[#f59e0b]">HOST</span>
                    )}
                    {m.socketId === socketId && (
                      <span className="text-[9px] text-[#2a2a2a]">(you)</span>
                    )}
                    {/* Kick button — only host sees it, not on themselves */}
                    {isHost && m.socketId !== socketId && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${m.nickname} from room?`)) {
                            kickMember(m.socketId);
                          }
                        }}
                        className="w-5 h-5 rounded flex items-center justify-center text-[#333] hover:text-red-400 hover:bg-red-400/10 transition-all ml-1"
                        title={`Remove ${m.nickname}`}
                        aria-label={`Remove ${m.nickname} from room`}
                      >
                        <UserX size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// Suspense wrapper required for useSearchParams
export default function PrivateRoomChat({ code }: { code: string }) {
  return (
    <Suspense fallback={
      <div className="h-screen-safe flex items-center justify-center bg-background">
        <div className="w-6 h-6 spinner" />
      </div>
    }>
      <PrivateRoomChatInner code={code} />
    </Suspense>
  );
}
