'use client';

import { useState, useCallback, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import ChatInput from './ChatInput';
import StartScreen from './StartScreen';
import StrangerProfile from './StrangerProfile';
import OnboardingModal from '@/components/ui/OnboardingModal';
import ReportModal from '@/components/ui/ReportModal';
import { UserProfile } from '@/types/chat';
import { loadProfile, clearProfile } from '@/lib/profile';
import toast from 'react-hot-toast';
import { notifyNicknameRenamed } from '@/lib/nickname';
import { ShieldAlert } from 'lucide-react';

export default function ChatApp() {
  const {
    state,
    setProfile: setChatProfile,
    findStranger,
    sendMessage,
    handleTyping,
    nextStranger,
    stopSearching,
    blockUser,
    getSocketId,
  } = useChat();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const { status, messages, isTyping, onlineCount, roomId, strangerProfile, myNickname } = state;

  // One-time toast if the server had to uniquify the nickname
  useEffect(() => {
    if (myNickname) notifyNicknameRenamed(myNickname, profile?.nickname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myNickname]);

  // Load profile on mount — pass to chat hook for socket emission
  useEffect(() => {
    const saved = loadProfile();
    if (saved.onboardingComplete) {
      setProfile(saved);
      setChatProfile(saved);
    } else {
      setShowOnboarding(true);
    }
  }, [setChatProfile]);

  const handleOnboardingComplete = useCallback((p: UserProfile) => {
    setProfile(p);
    setChatProfile(p);
    setShowOnboarding(false);
  }, [setChatProfile]);

  const handleEditProfile = useCallback(() => {
    clearProfile();
    setShowOnboarding(true);
  }, []);

  const showChat =
    status === 'matched' ||
    (messages.length > 0 && status !== 'connecting' && status !== 'waiting');

  const handleNext = useCallback(() => nextStranger(), [nextStranger]);

  const handleBlock = useCallback(() => {
    blockUser();
    toast('User blocked', { icon: '🚫' });
    setTimeout(() => findStranger(), 600);
  }, [blockUser, findStranger]);

  const handleReport = useCallback(() => setReportOpen(true), []);

  return (
    <div className="h-screen-safe flex flex-col bg-background overflow-hidden">
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <ChatHeader
        status={status}
        onlineCount={onlineCount}
        onNext={handleNext}
        onReport={handleReport}
        onBlock={handleBlock}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {showChat ? (
          <>
            {/* Premium stranger profile card */}
            {status === 'matched' && (
              <StrangerProfile
                nickname={strangerProfile?.nickname}
                country={strangerProfile?.country}
                countryCode={strangerProfile?.countryCode}
                interests={strangerProfile?.interests}
                myInterests={profile?.interests || []}
              />
            )}

            <MessagesList messages={messages} isTyping={isTyping} />

            {/* Safety reminder */}
            <div className="trust-msg">
              <ShieldAlert size={12} className="text-[#333333] flex-shrink-0 mt-0.5" />
              <span>
                Stay safe. Never share personal, financial, or sensitive information with strangers.
              </span>
            </div>

            <ChatInput status={status} onSend={sendMessage} onTyping={handleTyping} />
          </>
        ) : (
          <StartScreen
            status={status}
            onlineCount={onlineCount}
            profile={profile}
            myNickname={myNickname}
            onStart={findStranger}
            onStop={stopSearching}
            onEditProfile={handleEditProfile}
          />
        )}
      </div>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        reporterSocketId={getSocketId()}
        reportedSocketId=""
        sessionId={roomId ?? undefined}
      />
    </div>
  );
}
