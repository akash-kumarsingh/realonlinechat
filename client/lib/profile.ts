/**
 * User profile persistence — localStorage only.
 * No server-side storage. Profile never leaves the device.
 */
import { UserProfile, DEFAULT_PROFILE } from '@/types/chat';

const KEY = 'roc_profile_v1';

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

/** Generate a random anonymous nickname fallback */
export function randomNickname(): string {
  const adj = ['Silent', 'Cosmic', 'Swift', 'Calm', 'Bold', 'Wise', 'Bright', 'Keen', 'Quiet'];
  const noun = ['Panda', 'Fox', 'Owl', 'Wolf', 'Eagle', 'Tiger', 'Bear', 'Hawk', 'Lynx'];
  return adj[Math.floor(Math.random() * adj.length)] + noun[Math.floor(Math.random() * noun.length)];
}
