import type { Metadata } from 'next';
import JoinPrivateRoomPage from '@/components/rooms/JoinPrivateRoomPage';

export const metadata: Metadata = {
  title: 'Join Private Room — Real Online Chat',
  description: 'Enter a room code to join a private chat room on Real Online Chat.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <JoinPrivateRoomPage />;
}



