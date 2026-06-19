import { memo } from 'react';

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div
      className="flex justify-start px-4 mb-2 animate-fade-in"
      role="status"
      aria-label="Stranger is typing"
    >
      <div className="flex flex-col gap-1 items-start">
        <div className="bubble-stranger px-4 py-2.5 flex items-center gap-2">
          {/* Emoji */}
          <span className="text-sm leading-none" aria-hidden>✍️</span>
          {/* Dots */}
          <div className="flex items-center gap-[4px]">
            <span className="roc-typing-dot" />
            <span className="roc-typing-dot" style={{ animationDelay: '0.18s' }} />
            <span className="roc-typing-dot" style={{ animationDelay: '0.36s' }} />
          </div>
        </div>
        <span className="text-[10px] text-[#333] px-0.5 tracking-wide">
          Stranger is typing...
        </span>
      </div>
    </div>
  );
});

export default TypingIndicator;
