/** Curated country list for onboarding dropdown */
export const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'OTHER', name: 'Other', flag: '🌍' },
];

export function getCountryByCode(code: string) {
  return COUNTRIES.find(c => c.code === code);
}

/** Try to detect country from browser timezone — best-effort, not precise */
export function detectCountryFromTimezone(): { code: string; name: string; flag: string } | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map: Record<string, string> = {
      'America/New_York': 'US', 'America/Los_Angeles': 'US', 'America/Chicago': 'US',
      'America/Denver': 'US', 'America/Phoenix': 'US',
      'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
      'Europe/London': 'GB', 'America/Toronto': 'CA',
      'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
      'Europe/Berlin': 'DE', 'Europe/Paris': 'FR',
      'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX',
      'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR',
      'Europe/Moscow': 'RU', 'Europe/Istanbul': 'TR',
      'Asia/Karachi': 'PK', 'Asia/Jakarta': 'ID',
      'Asia/Manila': 'PH', 'Africa/Lagos': 'NG',
      'Africa/Cairo': 'EG', 'Asia/Riyadh': 'SA',
      'Asia/Dubai': 'AE', 'Africa/Johannesburg': 'ZA',
      'America/Argentina/Buenos_Aires': 'AR', 'America/Bogota': 'CO',
      'Europe/Madrid': 'ES', 'Europe/Rome': 'IT',
      'Europe/Amsterdam': 'NL', 'Europe/Warsaw': 'PL',
      'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
      'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY',
      'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN',
      'Asia/Dhaka': 'BD', 'Asia/Kathmandu': 'NP',
      'Africa/Accra': 'GH', 'Africa/Nairobi': 'KE',
    };
    const code = map[tz];
    if (code) return COUNTRIES.find(c => c.code === code) || null;
    return null;
  } catch {
    return null;
  }
}
