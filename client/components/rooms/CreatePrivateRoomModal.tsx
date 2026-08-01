'use client';

import { useState, memo } from 'react';
import { X, Lock, Users, Hash } from 'lucide-react';

interface CreatePrivateRoomModalProps {
  onClose: () => void;
  onCreate: (opts: { roomName: string; password: string; maxMembers: number }) => void;
  loading: boolean;
}

const CreatePrivateRoomModal = memo(function CreatePrivateRoomModal({
  onClose, onCreate, loading,
}: CreatePrivateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);

  const handleSubmit = () => {
    onCreate({
      roomName: roomName.trim() || 'Private Room',
      password: password.trim(),
      maxMembers,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-room-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden />

      {/* Sheet */}
      <div className="relative w-full max-w-md panel-elevated animate-slide-up rounded-t-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0f0f0f] border border-[#1e1e1e] flex items-center justify-center">
              <Lock size={13} className="text-[#888]" />
            </div>
            <h2 id="create-room-title" className="text-sm font-semibold text-[#ededed] tracking-tight">
              Create Private Room
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Room name */}
          <div>
            <label className="form-label" htmlFor="room-name">
              Room Name <span className="text-[#3a3a3a] font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id="room-name"
              type="text"
              value={roomName}
              onChange={e => setRoomName(e.target.value.slice(0, 40))}
              placeholder="My Private Room"
              className="input-field px-3.5 py-3 text-sm"
              maxLength={40}
            />
          </div>

          {/* Password */}
          <div>
            <label className="form-label" htmlFor="room-password">
              Password <span className="text-[#3a3a3a] font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id="room-password"
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value.slice(0, 20))}
              placeholder="Leave empty for no password"
              className="input-field px-3.5 py-3 text-sm"
              maxLength={20}
            />
          </div>

          {/* Max members */}
          <div>
            <label className="form-label">Max Members</label>
            <div className="flex gap-2">
              {[2, 5, 10, 20].map(n => (
                <button
                  key={n}
                  onClick={() => setMaxMembers(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    maxMembers === n
                      ? 'bg-white text-black border-white'
                      : 'bg-[#080808] text-[#555] border-[#1e1e1e] hover:border-[#2e2e2e] hover:text-[#888]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#060606] border border-[#111]">
            <Hash size={12} className="text-[#333] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#333] leading-relaxed">
              A unique 6-character code will be generated. Share it with friends to invite them. Room expires after 24 hours.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default CreatePrivateRoomModal;
