import type { Metadata } from 'next';
import RoomChatPage from '@/components/rooms/RoomChatPage';

interface Props {
  params: { roomId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const names: Record<string, string> = {
    global: 'Global Chat', gaming: 'Gaming', music: 'Music',
    movies: 'Movies & TV', technology: 'Technology', sports: 'Sports',
    travel: 'Travel', study: 'Study', anime: 'Anime',
    books: 'Books', fitness: 'Fitness', business: 'Business',
  };
  const name = names[params.roomId] || 'Chat Room';
  return {
    title: `${name} Chat Room — Real Online Chat`,
    description: `Join the ${name} chat room on Real Online Chat. Free, anonymous group chat. No signup required.`,
    robots: { index: false, follow: false },
  };
}

export default function RoomPage({ params }: Props) {
  return <RoomChatPage roomId={params.roomId} />;
}
