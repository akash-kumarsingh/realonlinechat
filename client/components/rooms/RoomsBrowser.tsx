'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, ChevronLeft, Zap, Lock, Hash } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { RoomDefinition } from '@/types/chat';
import { formatCount } from '@/lib/utils';
import { loadProfile, saveProfile } from '@/lib/profile';
import { UserProfile } from '@/types/chat';
import dynamic from 'next/dynamic';
import Logo from '@/components/ui/Logo';

const OnboardingModal = dynamic(() => import('@/components/ui/OnboardingModal'), { ssr: false });
const CreatePrivateRoomModal = dynamic(() => import('@/components/rooms/CreatePrivateRoomModal'), { ssr: false });

const ROOM_COLORS: Record<string, string> = {
  global: '#3b82f6', gaming: '#8b5cf6', music: '#ec4899',
  movies: '#f59e0b', technology: '#06b6d4', sports: '#22c55e',
  travel: '#f97316', study: '#6366f1', anime: '#e879f9',
  books: '#84cc16', fitness: '#ef4444', business: '#64748b',
};

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const saved = loadProfile();
    if (saved.onboardingComplete) setProfile(saved);

    const socket = socketRef.current;
    if (!socket.connected) socket.connect();

    const onConnect = () => socket.emit('get_room_list');
    const onRoomList = ({ rooms: r, counts: c }: { rooms: RoomDefinition[]; counts: Record<string, number> }) => {
      if (r?.length > 0) setRooms(r);
      if (c) setCounts(c);
    };
    const onRoomCounts = (c: Record<string, number>) => setCounts(c);

    // Private room created — redirect to it
    const onRoomCreated = ({ code }: { code: string }) => {
      setCreatingRoom(false);
      setShowCreateModal(false);
      router.push(`/rooms/private/${code}`);
    };

    socket.on('connect', onConnect);
    socket.on('room_list', onRoomList);
    socket.on('room_counts', onRoomCounts);
    socket.on('private_room_created', onRoomCreated);

    if (socket.connected) socket.emit('get_room_list');

    return () => {
      socket.off('connect', onConnect);
      socket.off('room_list', onRoomList);
      socket.off('room_counts', onRoomCounts);
      socket.off('private_room_created', onRoomCreated);
    };
  }, [router]);

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
    saveProfile(p);
    setShowOnboarding(false);
    if (pendingRoomId) {
      router.push(`/rooms/${pendingRoomId}`);
      setPendingRoomId(null);
    }
  };

  const handleCreateRoom = useCallback((opts: { roomName: string; password: string; maxMembers: number }) => {
    if (!profile?.onboardingComplete) {
      setShowCreateModal(false);
      setShowOnboarding(true);
      return;
    }
    setCreatingRoom(true);
    socketRef.current.emit('create_private_room', {
      nickname: profile.nickname,
      roomName: opts.roomName,
      password: opts.password,
      maxMembers: opts.maxMembers,
    });
  }, [profile]);

  const totalOnline = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background grid-lines">
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      {showCreateModal && (
        <CreatePrivateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
          loading={creatingRoom}
        />
      )}

      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-[#111] bg-black/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="btn btn-ghost btn-icon" aria-label="Home">
              <ChevronLeft size={14} />
            </Link>
            <Logo variant="full" height={24} className="hidden sm:flex" />
            <Logo variant="icon" height={22} className="flex sm:hidden" />
          </div>

          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-[#d0d0d0] tracking-tight">Chat Rooms</span>
          </div>

          <div className="flex items-center gap-2">
            {totalOnline > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="live-dot-ring" aria-hidden />
                <span className="text-xs font-mono text-[#333]">{formatCount(totalOnline)} online</span>
              </div>
            )}
            <Link href="/chat" className="btn btn-secondary !text-xs !h-8 !px-3">
              <Zap size={11} /> 1-on-1
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        <div className="badge mb-4"><Users size={10} /> {rooms.length} Chat Rooms</div>
        <h1 className="heading-display text-3xl sm:text-4xl text-[#ededed] mb-3">
          Join a conversation
        </h1>
        <p className="text-[#555] text-base max-w-lg mb-6">
          Pick a topic room, or create a private room to chat with friends.
        </p>

        {/* Private room actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Lock size={13} />
            Create Private Room
          </button>
          <Link href="/rooms/join" className="btn btn-secondary">
            <Hash size={13} />
            Join with Code
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#0f0f0f]" />
          <span className="text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider">Public Rooms</span>
          <div className="h-px flex-1 bg-[#0f0f0f]" />
        </div>
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
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl flex-shrink-0"
                  style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}28` }}
                  aria-hidden
                >
                  {room.emoji}
                </div>

                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="text-sm font-semibold text-[#ededed] tracking-tight">{room.name}</h2>
                  {memberCount > 0 && (
                    <div className="live-dot live-dot-pulse flex-shrink-0 mt-1" style={{ background: accentColor }} />
                  )}
                </div>
                <p className="text-xs text-[#555] mb-4 leading-relaxed">{room.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users size={10} className="text-[#333]" />
                    <span className="text-[11px] font-mono text-[#333]">
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

