'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, ChevronDown, ShieldCheck } from 'lucide-react';
import { UserProfile, INTERESTS, Interest, Gender, DEFAULT_PROFILE } from '@/types/chat';
import { loadProfile, saveProfile, randomNickname } from '@/lib/profile';
import { COUNTRIES, detectCountryFromTimezone } from '@/lib/countries';

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

const INTEREST_ICONS: Record<string, string> = {
  Gaming: '🎮', Movies: '🎬', Music: '🎵', Coding: '💻',
  Technology: '⚡', Sports: '⚽', Study: '📚', Travel: '✈️',
  Business: '💼', Anime: '🌸', Books: '📖', Fitness: '💪',
};

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [profile, setProfile] = useState<UserProfile>({ ...DEFAULT_PROFILE });
  const [nicknameError, setNicknameError] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Load saved profile & detect country on mount
  useEffect(() => {
    const saved = loadProfile();
    if (saved.onboardingComplete) {
      onComplete(saved);
      return;
    }
    // Pre-fill with any partial saved data
    setProfile(prev => ({ ...prev, ...saved }));

    // Auto-detect country if not set
    if (!saved.country) {
      const detected = detectCountryFromTimezone();
      if (detected) {
        setProfile(prev => ({
          ...prev,
          country: detected.name,
          countryCode: detected.code,
        }));
      }
    }

    // Suggest random nickname if empty
    if (!saved.nickname) {
      setProfile(prev => ({ ...prev, nickname: randomNickname() }));
    }
  }, [onComplete]);

  const toggleInterest = (interest: Interest) => {
    setProfile(prev => {
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest].slice(0, 6),
      };
    });
  };

  const handleStart = () => {
    const trimmed = profile.nickname.trim();
    if (!trimmed) {
      setNicknameError('Please enter a nickname to continue.');
      return;
    }
    if (trimmed.length < 2) {
      setNicknameError('Nickname must be at least 2 characters.');
      return;
    }
    setNicknameError('');

    const completed: UserProfile = {
      ...profile,
      nickname: trimmed,
      onboardingComplete: true,
    };
    saveProfile(completed);
    onComplete(completed);
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find(c => c.code === profile.countryCode);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="modal-sheet">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#111111]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
              <MessageSquare size={13} className="text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h2 id="onboarding-title" className="text-sm font-semibold text-text-primary tracking-tight">
                Welcome to Real Online Chat
              </h2>
              <p className="text-[10px] text-text-tertiary">Set up your anonymous profile</p>
            </div>
          </div>
          {/* No close button — must complete */}
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* ─── Nickname ─── */}
          <div className="form-group">
            <label className="form-label" htmlFor="nickname">
              Nickname <span className="text-red-500">*</span>
            </label>
            <input
              id="nickname"
              type="text"
              value={profile.nickname}
              onChange={e => {
                setNicknameError('');
                setProfile(prev => ({ ...prev, nickname: e.target.value.slice(0, 24) }));
              }}
              placeholder="How should strangers call you?"
              maxLength={24}
              autoComplete="off"
              className="input-field px-3.5 py-3 text-sm"
              aria-describedby={nicknameError ? 'nickname-error' : undefined}
            />
            {nicknameError && (
              <p id="nickname-error" className="text-xs text-red-400 mt-1.5" role="alert">
                {nicknameError}
              </p>
            )}
          </div>

          {/* ─── Gender ─── */}
          <div className="form-group">
            <p className="form-label">Gender <span className="text-text-tertiary font-normal normal-case tracking-normal">(optional)</span></p>
            <div className="flex gap-2 flex-wrap">
              {GENDER_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() =>
                    setProfile(prev => ({
                      ...prev,
                      gender: prev.gender === value ? '' : value,
                    }))
                  }
                  className={`gender-btn ${profile.gender === value ? 'selected' : ''}`}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Country ─── */}
          <div className="form-group relative">
            <p className="form-label">Country <span className="text-text-tertiary font-normal normal-case tracking-normal">(optional)</span></p>
            <button
              type="button"
              onClick={() => setCountryOpen(!countryOpen)}
              className="w-full input-field px-3.5 py-3 text-sm text-left flex items-center justify-between gap-2"
              aria-expanded={countryOpen}
              aria-haspopup="listbox"
            >
              <span className={selectedCountry ? 'text-text-primary' : 'text-[#3a3a3a]'}>
                {selectedCountry
                  ? `${selectedCountry.flag} ${selectedCountry.name}`
                  : 'Select your country'}
              </span>
              <ChevronDown
                size={13}
                className={`text-text-tertiary flex-shrink-0 transition-transform duration-150 ${countryOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {countryOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl shadow-lg z-50 overflow-hidden animate-scale-in">
                <div className="p-2 border-b border-[#111111]">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                    className="w-full bg-transparent text-sm text-text-primary placeholder-[#333333] outline-none px-2 py-1"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto" role="listbox">
                  {filteredCountries.map(c => (
                    <button
                      key={c.code}
                      role="option"
                      aria-selected={profile.countryCode === c.code}
                      onClick={() => {
                        setProfile(prev => ({ ...prev, country: c.name, countryCode: c.code }));
                        setCountryOpen(false);
                        setCountrySearch('');
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-[#111111] flex items-center gap-2 ${
                        profile.countryCode === c.code ? 'text-text-primary bg-[#0f0f0f]' : 'text-text-secondary'
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Interests ─── */}
          <div className="form-group">
            <p className="form-label">
              Interests <span className="text-text-tertiary font-normal normal-case tracking-normal">(optional · pick up to 6)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`interest-chip ${profile.interests.includes(interest) ? 'selected' : ''}`}
                >
                  <span aria-hidden>{INTEREST_ICONS[interest]}</span>
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Privacy note ─── */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#060606] border border-[#111111]">
            <ShieldCheck size={14} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-text-tertiary leading-relaxed">
              Your information is never publicly displayed. Your nickname is only visible during an active chat session.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-6 pt-1">
          <button
            onClick={handleStart}
            className="btn btn-primary w-full"
            style={{ height: '46px', fontSize: '14px', fontWeight: 600, borderRadius: '12px' }}
          >
            Start Chatting
          </button>
          <p className="text-center text-[10px] text-[#2a2a2a] mt-2.5">
            By continuing you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
