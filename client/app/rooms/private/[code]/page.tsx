import type { Metadata } from 'next';
import PrivateRoomChat from '@/components/rooms/PrivateRoomChat';

interface Props {
  params: { code: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Private Room ${params.code.toUpperCase()} — Real Online Chat`,
    description: 'You are in a private chat room on Real Online Chat.',
    robots: { index: false, follow: false },
  };
}

export default function Page({ params }: Props) {
  return <PrivateRoomChat code={params.code.toUpperCase()} />;
}
