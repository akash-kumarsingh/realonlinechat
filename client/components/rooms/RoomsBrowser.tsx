'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, ChevronLeft, Zap } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { getSocket } from '@/lib/socket';
import { RoomDefinition } from '@/types/chat';
import { formatCount } from '@/lib/utils';
import { loadProfile } from '@/lib/profile';
import OnboardingModal from '@/components/ui/OnboardingModal';
import { UserProfile } from '@/types/chat';

const ROOM_COLORS: Record<string, string> = {
  global: '#3b82f6', gaming: '#8b5cf6', music: '#ec4899',
  movies: '#f59e0b', technology: '#06b6d4', sports: '#22c55e',
  travel: '#f97316', study: '#6366f1', anime: '#e879f9',
  books: '#84cc16', fitness: '#ef4444', business: '#64748b',
};

// Hardcoded fallback — shown immediately, no socket needed
const FALLBACK_ROOMS: RoomDefinition[] = [
  { id: 'global',     name: 'Global Chat',  emoji: '🌍', description: 'Talk about anything with everyone' },
  { id: 'gaming',     name: 'Gaming',       emoji: '🎮', description: 'Games, esports, reviews' },
  { id: 'music',      name: 'Music',        emoji: '🎵', description: 'Artists, playlists, concerts' },
  { id: 'movies',     name: 'Movies & TV',  emoji: '🎬', description: 'Films, series, recommendations' },
  { id: 'technology', name: 'Technology',   emoji: '💻', description: 'Coding, gadgets, AI' },
  { id: 'sports',     name: 'Sports',       emoji: '⚽', description: 'Football, cricket, all sports' },
  { id: 'travel',     name: 'Travel',       emoji: '✈️', description: 'Destinations, tips, stories' },
  { id: 'study',      name: 'Study',        emoji: '📚', description: 'Homework help, learning' },
  { id: 'anime',      name: 'Anime',        emoji: '🌸', description: 'Manga, series, recommendations' },
  { id: 'books',      name: 'Books',        emoji: '📖', description: 'Reading, authors, reviews' },
  { id: 'fitness',    name: 'Fitness',      emoji: '💪', description: 'Workouts, nutrition, health' },
  { id: 'business',   name: 'Business',     emoji: '💼', description: 'Startups, finance, careers' },
];

export default function RoomsBrowser() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomDefinition[]>(FALLBACK_ROOMS);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const saved = loadProfile();
    if (saved.onboardingComplete) setProfile(saved);

    const socket = socketRef.current;

    const onConnect = () => {
      setConnected(true);
      // Request room list after connect
      socket.emit('get_room_list');
    };

    const onRoomList = ({ rooms: r, counts: c }: { rooms: RoomDefinition[]; counts: Record<string, number> }) => {
      if (r && r.length > 0) setRooms(r);
      if (c) setCounts(c);
    };

    const onRoomCounts = (c: Record<string, number>) => setCounts(c);

    socket.on('connect', onConnect);
    socket.on('room_list', onRoomList);
    socket.on('room_counts', onRoomCounts);

    // Connect (or re-use existing connection)
    if (!socket.connected) {
      socket.connect();
    } else {
      // Already connected — request room list immediately
      setConnected(true);
      socket.emit('get_room_list');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('room_list', onRoomList);
      socket.off('room_counts', onRoomCounts);
    };
  }, []);

  const handleEnterRoom = (roomId: string) => {
    if (!profile?.onboardingComplete) {
      setPendingRoomId(roomId);
      setShowOnboarding(true);
      return;
    }
    router.push(`/rooms/${roomId}`);
  };

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p);
    setShowOnboarding(false);
    if (pendingRoomId) {
      router.push(`/rooms/${pendingRoomId}`);
      setPendingRoomId(null);
    }
  };

  const totalOnline = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background grid-lines">
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-[#111] bg-black/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="btn btn-ghost btn-icon" aria-label="Home">
              <ChevronLeft size={14} />
            </Link>
            <Logo variant="full" height={28} className="hidden sm:flex" />
            <Logo variant="icon" height={20} className="flex sm:hidden" />
          </div>

          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-text-primary tracking-tight">
              Chat Rooms
            </span>
          </div>

          <div className="flex items-center gap-2">
            {totalOnline > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="live-dot-ring" aria-hidden />
                <span className="text-xs font-mono text-text-tertiary">
                  {formatCount(totalOnline)} in rooms
                </span>
              </div>
            )}
            <Link href="/chat" className="btn btn-primary !text-xs">
              <Zap size={11} /> 1-on-1 Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        <div className="badge mb-4">
          <Users size={10} /> {rooms.length} Chat Rooms
        </div>
        <h1 className="heading-display text-3xl sm:text-4xl text-text-primary mb-3">
          Join a conversation
        </h1>
        <p className="text-text-secondary text-base max-w-lg">
          Pick a topic, join the room, and start chatting instantly.
          No signup — just choose a nickname and dive in.
        </p>

        {/* Connection status */}
        {!connected && (
          <div className="mt-4 inline-flex items-center gap-2 badge">
            <div className="w-3 h-3 border border-[#333] border-t-[#888] rounded-full animate-spin" />
            <span>Connecting to server...</span>
          </div>
        )}
      </div>

      {/* Room Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((room) => {
            const memberCount = counts[room.id] || 0;
            const accentColor = ROOM_COLORS[room.id] || '#888';
            return (
              <button
                key={room.id}
                onClick={() => handleEnterRoom(room.id)}
                className="feature-card text-left group cursor-pointer transition-all hover:translate-y-[-1px]"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl flex-shrink-0"
                  style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}28` }}
                  aria-hidden
                >
                  {room.emoji}
                </div>

                {/* Name + desc */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                    {room.name}
                  </h2>
                  {memberCount > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                      <div className="live-dot live-dot-pulse" style={{ background: accentColor }} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-tertiary mb-4 leading-relaxed">
                  {room.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users size={10} className="text-text-tertiary" />
                    <span className="text-[11px] font-mono text-text-tertiary">
                      {memberCount > 0 ? `${memberCount} online` : 'Be the first'}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: accentColor }}
                  >
                    Join →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
