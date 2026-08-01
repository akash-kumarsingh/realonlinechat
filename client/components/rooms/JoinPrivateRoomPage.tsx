'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Lock, ArrowRight } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import Logo from '@/components/ui/Logo';

interface RoomCheckResult {
  exists: boolean;
  name?: string;
  memberCount?: number;
  maxMembers?: number;
  hasPassword?: boolean;
  isFull?: boolean;
}

export default function JoinPrivateRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomCheckResult | null>(null);
  const [error, setError] = useState('');
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();

    socket.on('private_room_check', (result: RoomCheckResult) => {
      setChecking(false);
      setRoomInfo(result);
      if (!result.exists) setError('Room not found. Check the code and try again.');
      else if (result.isFull) setError('This room is full.');
      else setError('');
    });

    return () => { socket.off('private_room_check'); };
  }, []);

  const handleCodeChange = (val: string) => {
    const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(upper);
    setRoomInfo(null);
    setError('');

    if (upper.length === 6) {
      setChecking(true);
      socketRef.current.emit('check_private_room', { code: upper });
    }
  };

  const handleJoin = () => {
    if (!roomInfo?.exists || roomInfo.isFull) return;
    const trimmedPwd = password.trim();
    let url = `/rooms/private/${code}`;
    if (trimmedPwd) {
      url += `?pwd=${encodeURIComponent(trimmedPwd)}`;
    }
    router.push(url);
  };

  const canJoin = roomInfo?.exists && !roomInfo.isFull && code.length === 6;

  return (
    <div className="min-h-screen bg-background grid-lines flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-[#111] bg-black/90 backdrop-blur-xl">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/rooms" className="btn btn-ghost btn-icon">
            <ChevronLeft size={14} />
          </Link>
          <Logo variant="full" height={24} href="/" />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-6">
            <Lock size={20} className="text-[#555]" />
          </div>

          <h1 className="heading-display text-2xl text-[#ededed] text-center mb-2">
            Join Private Room
          </h1>
          <p className="text-sm text-[#555] text-center mb-8">
            Enter the 6-character room code to join.
          </p>

          {/* Code input */}
          <div className="mb-4">
            <label className="form-label" htmlFor="room-code">Room Code</label>
            <input
              id="room-code"
              type="text"
              value={code}
              onChange={e => handleCodeChange(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="input-field px-4 py-3 text-center text-xl font-mono tracking-[0.3em] uppercase"
              aria-describedby={error ? 'code-error' : undefined}
            />

            {/* Status below input */}
            <div className="mt-2 min-h-[20px] text-center">
              {checking && (
                <span className="text-[11px] text-[#333]">Checking...</span>
              )}
              {!checking && roomInfo?.exists && !roomInfo.isFull && (
                <span className="text-[11px] text-[#22c55e]">
                  ✓ {roomInfo.name} · {roomInfo.memberCount}/{roomInfo.maxMembers} members
                </span>
              )}
              {!checking && error && (
                <span id="code-error" className="text-[11px] text-red-400" role="alert">{error}</span>
              )}
            </div>
          </div>

          {/* Password (only if room has password) */}
          {roomInfo?.hasPassword && (
            <div className="mb-4">
              <label className="form-label" htmlFor="room-pwd">Password</label>
              <input
                id="room-pwd"
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="input-field px-3.5 py-3 text-sm"
              />
            </div>
          )}

          {/* Join button */}
          <button
            onClick={handleJoin}
            disabled={!canJoin}
            className="btn btn-primary btn-primary-lg w-full group"
          >
            Join Room
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <p className="text-center text-[11px] text-[#2a2a2a] mt-4">
            Don&apos;t have a code?{' '}
            <Link href="/rooms" className="text-[#444] hover:text-[#888] transition-colors">
              Browse public rooms
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
