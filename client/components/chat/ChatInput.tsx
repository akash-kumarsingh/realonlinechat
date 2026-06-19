'use client';

import {
  useState, useRef, useCallback, memo,
  KeyboardEvent, Suspense, lazy,
} from 'react';
import { ArrowUp } from 'lucide-react';
import { ChatStatus } from '@/types/chat';

// Lazy-load emoji picker — zero cost until first click
const EmojiPicker = lazy(() => import('@/components/ui/EmojiPicker'));

interface ChatInputProps {
  status: ChatStatus;
  onSend: (msg: string) => void;
  onTyping: () => void;
}

const ChatInput = memo(function ChatInput({ status, onSend, onTyping }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isActive = status === 'matched';

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || !isActive) return;
    onSend(trimmed);
    setValue('');
    setShowEmoji(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, [value, isActive, onSend]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') setShowEmoji(false);
  }, [handleSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value.slice(0, 500));
    onTyping();
    resize();
  }, [onTyping, resize]);

  // Insert emoji at cursor position
  const handleEmojiSelect = useCallback((emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      setValue(prev => (prev + emoji).slice(0, 500));
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end   = el.selectionEnd   ?? value.length;
    const next  = (value.slice(0, start) + emoji + value.slice(end)).slice(0, 500);
    setValue(next);

    // Restore cursor after emoji
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
      resize();
    });
  }, [value, resize]);

  const charCount = value.length;
  const nearLimit = charCount > 420;
  const canSend   = isActive && value.trim().length > 0;

  const placeholder = isActive
    ? 'Message...'
    : status === 'waiting' || status === 'connecting'
    ? 'Finding someone...'
    : 'Start a chat to send messages';

  return (
    <div
      ref={wrapperRef}
      className="flex-shrink-0 border-t border-[#0f0f0f] bg-[#030303] px-3 pb-3 pt-2"
    >
      <div className={`roc-composer flex items-end gap-1.5 ${!isActive ? 'opacity-50' : ''}`}>
        {/* ── Textarea ── */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={!isActive}
          placeholder={placeholder}
          rows={1}
          aria-label="Message input"
          aria-multiline="true"
          className="flex-1 bg-transparent px-3.5 py-3 text-sm text-[#ededed] placeholder-[#282828] resize-none focus:outline-none leading-relaxed disabled:cursor-not-allowed font-sans"
          style={{ maxHeight: '140px', minHeight: '44px' }}
        />

        {/* ── Right controls ── */}
        <div className="flex items-end pb-2 pr-2 gap-1 flex-shrink-0 relative">
          {/* Char counter */}
          {nearLimit && (
            <span className={`text-[10px] font-mono pb-0.5 ${charCount >= 480 ? 'text-red-400' : 'text-[#3a3a3a]'}`}>
              {500 - charCount}
            </span>
          )}

          {/* Emoji button */}
          {isActive && (
            <div className="relative">
              <button
                onClick={() => setShowEmoji(p => !p)}
                aria-label="Open emoji picker"
                aria-expanded={showEmoji}
                aria-haspopup="dialog"
                className={`roc-emoji-trigger ${showEmoji ? 'open' : ''}`}
              >
                😊
              </button>

              {/* Picker — lazy loaded */}
              {showEmoji && (
                <Suspense fallback={null}>
                  <EmojiPicker
                    onSelect={handleEmojiSelect}
                    onClose={() => setShowEmoji(false)}
                  />
                </Suspense>
              )}
            </div>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all duration-100 ${
              canSend
                ? 'bg-white hover:bg-[#f0f0f0] text-black active:scale-95 active:bg-[#e0e0e0]'
                : 'bg-[#0f0f0f] text-[#2a2a2a] cursor-not-allowed'
            }`}
          >
            <ArrowUp size={14} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] text-[#1a1a1a] mt-1.5 select-none">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
});

export default ChatInput;
