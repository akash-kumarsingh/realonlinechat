const SITE_URL = 'https://realonlinechat.com';
import type { Metadata } from 'next';
import ChatApp from '@/components/chat/ChatApp';

export const metadata: Metadata = {
  title: 'Chat — Real Online Chat',
  description: 'You are now chatting on Real Online Chat.',
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/chat` },
};

export default function ChatPage() {
  return <ChatApp />;
}
