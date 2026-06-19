'use client';

import { memo, useMemo } from 'react';
import { X, Users } from 'lucide-react';
import { RoomMember } from '@/types/chat';
import NicknameBadge from '@/components/ui/NicknameBadge';

interface MembersSidebarProps {
  members: RoomMember[];
  typingUsers: Map<string, string>;
  mySocketId: string;
  /** The nickname I originally requested — used to show "was renamed" indicator on my own row */
  myRequestedNickname?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function nickColor(str: string): string {
  const palette = ['#60a5fa','#a78bfa','#34d399','#f472b6','#fb923c','#facc15','#4ade80','#38bdf8'];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

const MemberRow = memo(function MemberRow({
  member, isMe, isTyping, myRequestedNickname,
}: {
  member: RoomMember;
  isMe: boolean;
  isTyping: boolean;
  myRequestedNickname?: string | null;
}) {
  const initial = member.nickname[0]?.toUpperCase() || '?';
  const color = nickColor(member.nickname);

  return (
    <div className="roc-member-row" aria-label={isMe ? `${member.nickname} (you)` : member.nickname}>
      <div
        className="roc-member-avatar"
        style={{ background: `${color}18`, border: `1px solid ${color}28`, color }}
        aria-hidden
      >
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <NicknameBadge
            nickname={member.nickname}
            requested={isMe ? myRequestedNickname : null}
            size="sm"
            className="truncate"
          />
          {isMe && (
            <span className="text-[9px] text-[#3a3a3a] font-medium flex-shrink-0">(you)</span>
          )}
        </div>
        {isTyping && (
          <div className="flex items-center gap-1 mt-0.5" aria-label="typing">
            <span className="text-[10px]">✍️</span>
            <div className="flex gap-0.5">
              <span className="roc-typing-mini" />
              <span className="roc-typing-mini" style={{ animationDelay: '0.15s' }} />
              <span className="roc-typing-mini" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
      </div>

      <div className="roc-member-dot" aria-hidden />
    </div>
  );
});

const MembersSidebar = memo(function MembersSidebar({
  members, typingUsers, mySocketId, myRequestedNickname, isOpen, onClose,
}: MembersSidebarProps) {
  const typingSet = useMemo(() => new Set(typingUsers.keys()), [typingUsers]);

  const sorted = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.socketId === mySocketId) return -1;
      if (b.socketId === mySocketId) return 1;
      return a.nickname.localeCompare(b.nickname);
    });
  }, [members, mySocketId]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 sm:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`roc-sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Room members"
        role="complementary"
      >
        {/* Header */}
        <div className="roc-sidebar-header">
          <div className="flex items-center gap-1.5">
            <Users size={11} className="text-[#3a3a3a]" aria-hidden />
            <span className="text-[11px] font-semibold text-[#444] uppercase tracking-wider">
              Members
            </span>
            <span className="text-[10px] font-mono text-[#2a2a2a] ml-0.5">
              {members.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="sm:hidden btn btn-ghost btn-icon !w-6 !h-6"
            aria-label="Close members panel"
          >
            <X size={12} />
          </button>
        </div>

        {/* Member list */}
        <div className="roc-member-list" role="list">
          {sorted.length === 0 ? (
            <p className="text-[11px] text-[#2a2a2a] px-3 py-4 text-center">
              No members yet
            </p>
          ) : (
            sorted.map(member => (
              <MemberRow
                key={member.socketId}
                member={member}
                isMe={member.socketId === mySocketId}
                isTyping={typingSet.has(member.socketId)}
                myRequestedNickname={myRequestedNickname}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
});

export default MembersSidebar;
