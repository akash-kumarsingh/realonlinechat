'use client';

import { useEffect, useReducer, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { ChatState, ChatStatus, Message, Interest, UserProfile } from '@/types/chat';
import toast from 'react-hot-toast';

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export interface StrangerProfile {
  nickname: string;
  country: string;
  countryCode: string;
  interests: Interest[];
}

interface ExtendedChatState extends ChatState {
  strangerProfile: StrangerProfile | null;
  /** Final, globally-unique nickname assigned by the server for this session */
  myNickname: string | null;
}

type Action =
  | { type: 'SET_STATUS'; status: ChatStatus }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'SET_TYPING'; isTyping: boolean }
  | { type: 'SET_ONLINE_COUNT'; count: number }
  | { type: 'SET_ROOM'; roomId: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_STRANGER_PROFILE'; profile: StrangerProfile | null }
  | { type: 'SET_MY_NICKNAME'; nickname: string };

const initialState: ExtendedChatState = {
  status: 'idle',
  messages: [],
  isTyping: false,
  onlineCount: 0,
  roomId: null,
  strangerProfile: null,
  myNickname: null,
};

function reducer(state: ExtendedChatState, action: Action): ExtendedChatState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'SET_TYPING':
      return { ...state, isTyping: action.isTyping };
    case 'SET_ONLINE_COUNT':
      return { ...state, onlineCount: action.count };
    case 'SET_ROOM':
      return { ...state, roomId: action.roomId };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'SET_STRANGER_PROFILE':
      return { ...state, strangerProfile: action.profile };
    case 'SET_MY_NICKNAME':
      return { ...state, myNickname: action.nickname };
    default:
      return state;
  }
}

const systemMsg = (content: string): Message => ({
  id: uid(), content, sender: 'system', timestamp: Date.now(),
});

export function useChat() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const socketRef = useRef(getSocket());
  const profileRef = useRef<UserProfile | null>(null);
  const statusRef = useRef<ChatStatus>('idle');

  // Keep statusRef in sync
  useEffect(() => { statusRef.current = state.status; }, [state.status]);

  const setProfile = useCallback((p: UserProfile | null) => {
    profileRef.current = p;
  }, []);

  // ── Instant disconnect on tab close / navigate away ───────
  useEffect(() => {
    const notifyDisconnect = () => {
      const socket = socketRef.current;
      if (!socket.connected) return;
      // Use sendBeacon-style: emit stop_searching regardless of state
      socket.emit('stop_searching');
      // If matched, emit next_stranger to instantly notify partner
      if (statusRef.current === 'matched') {
        socket.volatile.emit('next_stranger');
      }
    };

    // visibilitychange fires instantly when tab is hidden/closed
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') notifyDisconnect();
    };

    // pagehide fires on tab close and back/forward navigation
    const handlePageHide = () => notifyDisconnect();

    // beforeunload fires on refresh/close
    const handleBeforeUnload = () => notifyDisconnect();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();

    socket.on('connect', () => dispatch({ type: 'SET_STATUS', status: 'idle' }));

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_STATUS', status: 'disconnected' });
      dispatch({ type: 'SET_STRANGER_PROFILE', profile: null });
    });

    socket.on('waiting', () => dispatch({ type: 'SET_STATUS', status: 'waiting' }));

    socket.on('matched', ({ roomId, strangerProfile }: {
      roomId: string; strangerProfile: StrangerProfile | null;
    }) => {
      dispatch({ type: 'SET_STATUS', status: 'matched' });
      dispatch({ type: 'SET_ROOM', roomId });
      dispatch({ type: 'CLEAR_MESSAGES' });
      dispatch({ type: 'SET_STRANGER_PROFILE', profile: strangerProfile || null });
      dispatch({ type: 'ADD_MESSAGE', message: systemMsg('🎉 Connected to a stranger! Say hi!') });
    });

    socket.on('receive_message', (message: Message) => {
      dispatch({ type: 'ADD_MESSAGE', message: { ...message, sender: 'stranger' } });
      dispatch({ type: 'SET_TYPING', isTyping: false });
    });

    socket.on('message_sent', (message: Message) => {
      dispatch({ type: 'ADD_MESSAGE', message: { ...message, sender: 'me' } });
    });

    socket.on('stranger_typing', () => dispatch({ type: 'SET_TYPING', isTyping: true }));
    socket.on('stranger_stopped_typing', () => dispatch({ type: 'SET_TYPING', isTyping: false }));

    socket.on('stranger_left', () => {
      dispatch({ type: 'SET_STATUS', status: 'idle' });
      dispatch({ type: 'SET_ROOM', roomId: null });
      dispatch({ type: 'SET_TYPING', isTyping: false });
      dispatch({ type: 'SET_STRANGER_PROFILE', profile: null });
      dispatch({
        type: 'ADD_MESSAGE',
        message: systemMsg('👋 Stranger has disconnected.'),
      });
    });

    socket.on('nickname_assigned', ({ nickname }: { nickname: string }) => {
      dispatch({ type: 'SET_MY_NICKNAME', nickname });
    });

    socket.on('online_count', ({ count }) => dispatch({ type: 'SET_ONLINE_COUNT', count }));
    socket.on('rate_limited', ({ message }) => toast.error(message, { icon: '⚡' }));
    socket.on('error_msg', ({ message }) => toast.error(message));
    socket.on('user_blocked', () => {
      toast.success('User blocked', { icon: '🚫' });
      dispatch({ type: 'SET_STATUS', status: 'idle' });
      dispatch({ type: 'SET_STRANGER_PROFILE', profile: null });
    });

    return () => {
      socket.off('connect');   socket.off('disconnect');
      socket.off('waiting');   socket.off('matched');
      socket.off('receive_message'); socket.off('message_sent');
      socket.off('stranger_typing'); socket.off('stranger_stopped_typing');
      socket.off('stranger_left');   socket.off('online_count');
      socket.off('rate_limited');    socket.off('error_msg');
      socket.off('user_blocked');    socket.off('nickname_assigned');
    };
  }, []);

  const findStranger = useCallback(() => {
    socketRef.current.emit('find_stranger', {
      profile: profileRef.current ? {
        nickname:    profileRef.current.nickname,
        country:     profileRef.current.country,
        countryCode: profileRef.current.countryCode,
        interests:   profileRef.current.interests,
      } : null,
    });
    dispatch({ type: 'SET_STATUS', status: 'connecting' });
    dispatch({ type: 'CLEAR_MESSAGES' });
    dispatch({ type: 'SET_ROOM', roomId: null });
    dispatch({ type: 'SET_STRANGER_PROFILE', profile: null });
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    socketRef.current.emit('send_message', { content });
    if (isTypingRef.current) {
      socketRef.current.emit('typing_stop');
      isTypingRef.current = false;
    }
  }, []);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      socketRef.current.emit('typing_start');
      isTypingRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing_stop');
      isTypingRef.current = false;
    }, 2000);
  }, []);

  const nextStranger = useCallback(() => {
    // Stop typing first
    if (isTypingRef.current) {
      socketRef.current.emit('typing_stop');
      isTypingRef.current = false;
    }
    socketRef.current.emit('next_stranger');
    dispatch({ type: 'SET_STATUS', status: 'connecting' });
    dispatch({ type: 'CLEAR_MESSAGES' });
    dispatch({ type: 'SET_STRANGER_PROFILE', profile: null });
  }, []);

  const stopSearching = useCallback(() => {
    socketRef.current.emit('stop_searching');
    dispatch({ type: 'SET_STATUS', status: 'idle' });
  }, []);

  const blockUser = useCallback(() => {
    socketRef.current.emit('block_user');
  }, []);

  const getSocketId = useCallback(() => socketRef.current.id || '', []);

  return {
    state, setProfile, findStranger, sendMessage, handleTyping,
    nextStranger, stopSearching, blockUser, getSocketId,
  };
}
