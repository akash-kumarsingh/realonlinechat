import { memo } from 'react';
import { Message } from '@/types/chat';
import { formatTime } from '@/lib/utils';

const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  const { content, sender, timestamp } = message;

  if (sender === 'system') {
    return (
      <div className="flex justify-center my-4 px-4 animate-fade-in">
        <div className="flex items-center gap-2 max-w-xs w-full">
          <div className="h-px flex-1 bg-[#0f0f0f]" />
          <span className="bubble-system px-3 text-[10px] tracking-wide whitespace-nowrap">
            {content}
          </span>
          <div className="h-px flex-1 bg-[#0f0f0f]" />
        </div>
      </div>
    );
  }

  const isMe = sender === 'me';
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-4 mb-1 roc-msg-in`}>
      <div className={`flex flex-col gap-0.5 max-w-[78%] sm:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <span className="text-[10px] font-semibold text-[#5a5a5a] px-0.5">Stranger</span>
        )}
        <div className={isMe ? 'bubble-me px-3.5 py-2.5' : 'bubble-stranger px-3.5 py-2.5'}>
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{content}</p>
        </div>
        <span className="text-[10px] font-mono text-[#282828] px-0.5">{formatTime(timestamp)}</span>
      </div>
    </div>
  );
});

export default MessageBubble;
