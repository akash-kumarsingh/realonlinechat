import type { Metadata } from 'next';
import RoomsBrowser from '@/components/rooms/RoomsBrowser';

export const metadata: Metadata = {
  title: 'Chat Rooms — Real Online Chat',
  description:
    'Join free public chat rooms on Real Online Chat. Pick a topic — Gaming, Music, Travel, Tech and more — and start chatting instantly.',
  alternates: { canonical: 'https://realonlinechat.com/rooms' },
};

export default function RoomsPage() {
  return <RoomsBrowser />;
}
