'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SERVER_URL } from '@/lib/utils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporterSocketId: string;
  reportedSocketId: string;
  sessionId?: string;
}

const REASONS = [
  { value: 'spam', label: 'Spam or bot' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

export default function ReportModal({
  isOpen,
  onClose,
  reporterSocketId,
  reportedSocketId,
  sessionId,
}: ReportModalProps) {
  const [reason, setReason] = useState('other');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterSocketId, reportedSocketId, reason, description, sessionId }),
      });
      if (res.ok) {
        toast.success('Report submitted');
        onClose();
      } else {
        toast.error('Failed to submit report');
      }
    } catch {
      toast.error('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div className="relative w-full max-w-sm panel-elevated animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#1a0a0a] border border-[#3a1a1a] flex items-center justify-center">
              <AlertTriangle size={13} className="text-red-400" />
            </div>
            <span id="report-title" className="heading-sm">Report user</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Reason */}
          <div>
            <p className="text-xs text-text-tertiary mb-2.5 font-medium uppercase tracking-wider">
              Reason
            </p>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                    reason === r.value
                      ? 'bg-[#141414] border border-[#333333]'
                      : 'border border-transparent hover:bg-[#0d0d0d]'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="sr-only"
                  />
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    reason === r.value ? 'border-white' : 'border-[#333]'
                  }`}>
                    {reason === r.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm text-text-secondary">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-text-tertiary mb-2 font-medium uppercase tracking-wider">
              Additional details <span className="normal-case">(optional)</span>
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="Describe what happened..."
              rows={3}
              className="input-field px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Submitting...' : 'Submit report'}
          </button>
        </div>
      </div>
    </div>
  );
}
