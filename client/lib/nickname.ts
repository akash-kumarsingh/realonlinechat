import toast from 'react-hot-toast';

/**
 * Show a one-time, premium toast when the server had to make the
 * user's requested nickname globally unique (e.g. "Rahul" -> "Rahul_2").
 *
 * Only fires when:
 *  - a nickname was requested
 *  - the assigned nickname differs from the request
 *  - the difference is exactly a "_N" uniquification suffix
 */
export function notifyNicknameRenamed(assigned: string, requested?: string | null) {
  if (!assigned || !requested) return;

  const req = requested.trim();
  if (!req || req.toLowerCase() === assigned.toLowerCase()) return;

  const base = assigned.replace(/_\d+$/, '');
  if (base.toLowerCase() !== req.toLowerCase()) return;

  toast(`"${req}" was taken — you're "${assigned}"`, {
    icon: '✦',
    duration: 4000,
    style: {
      background: '#0a0a0a',
      color: '#ededed',
      border: '1px solid #1e1e1e',
      borderRadius: '10px',
      fontSize: '12px',
      padding: '10px 14px',
    },
  });
}
