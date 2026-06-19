'use client';

import { useEffect, useRef, memo } from 'react';
import { Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessagesListProps {
  messages: Message[];
  isTyping: boolean;
}

const MessagesList = memo(function MessagesList({ messages, isTyping }: MessagesListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      className="flex-1 overflow-y-auto"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-[#222]">Press Start to find a stranger</p>
        </div>
      ) : (
        <div className="py-3 space-y-0.5">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} className="h-1" />
        </div>
      )}
    </div>
  );
});

export default MessagesList;
