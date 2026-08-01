'use client';

import { useEffect, useReducer, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

export interface PrivateMessage {
  id: string;
  content: string;
  nickname: string;
  socketId: string;
  timestamp: number;
  isAdmin?: boolean;
}

export interface PrivateMember {
  socketId: string;
  nickname: string;
  isAdmin: boolean;
}

export interface PrivateRoomInfo {
  code: string;
  name: string;
  memberCount: number;
  members: PrivateMember[];
  hasPassword: boolean;
  maxMembers: number;
  expiresAt: number;
}

interface PrivateRoomState {
  status: 'idle' | 'creating' | 'joining' | 'joined' | 'error';
  room: PrivateRoomInfo | null;
  messages: PrivateMessage[];
  typingUsers: Map<string, string>;
  error: string | null;
}

type Action =
  | { type: 'SET_STATUS'; status: PrivateRoomState['status'] }
  | { type: 'ROOM_JOINED'; room: PrivateRoomInfo; messages: PrivateMessage[] }
  | { type: 'LEAVE' }
  | { type: 'ADD_MESSAGE'; message: PrivateMessage }
  | { type: 'UPDATE_MEMBERS'; memberCount: number; members: PrivateMember[] }
  | { type: 'USER_TYPING'; socketId: string; nickname: string }
  | { type: 'USER_STOP_TYPING'; socketId: string }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'KICKED'; message: string };

const initial: PrivateRoomState = {
  status: 'idle', room: null, messages: [],
  typingUsers: new Map(), error: null,
};

function reducer(state: PrivateRoomState, action: Action): PrivateRoomState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.status, error: null };
    case 'ROOM_JOINED':
      return { ...state, status: 'joined', room: action.room, messages: action.messages, typingUsers: new Map(), error: null };
    case 'LEAVE':
      return { ...initial };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages.slice(-199), action.message] };
    case 'UPDATE_MEMBERS':
      return {
        ...state,
        room: state.room
          ? { ...state.room, memberCount: action.memberCount, members: action.members }
          : state.room,
      };
    case 'USER_TYPING': {
      const next = new Map(state.typingUsers);
      next.set(action.socketId, action.nickname);
      return { ...state, typingUsers: next };
    }
    case 'USER_STOP_TYPING': {
      const next = new Map(state.typingUsers);
      next.delete(action.socketId);
      return { ...state, typingUsers: next };
    }
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'KICKED':
      return { ...initial, status: 'error', error: action.message };
    default:
      return state;
  }
}

export function usePrivateRoom(nickname: string) {
  const [state, dispatch] = useReducer(reducer, initial);
  const socketRef = useRef(getSocket());
  const currentCodeRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const nicknameRef = useRef(nickname);
  nicknameRef.current = nickname;

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();

    const onCreated = (info: PrivateRoomInfo) => {
      currentCodeRef.current = info.code;
      dispatch({ type: 'ROOM_JOINED', room: info, messages: [] });
    };

    const onJoined = (data: {
      code: string; name: string; messages: PrivateMessage[];
      members: PrivateMember[]; memberCount: number;
      hasPassword: boolean; maxMembers: number; expiresAt: number;
    }) => {
      currentCodeRef.current = data.code;
      dispatch({
        type: 'ROOM_JOINED',
        room: {
          code: data.code, name: data.name,
          memberCount: data.memberCount, members: data.members || [],
          hasPassword: data.hasPassword || false,
          maxMembers: data.maxMembers || 10,
          expiresAt: data.expiresAt || Date.now() + 86400000,
        },
        messages: data.messages || [],
      });
    };

    const onError = ({ message }: { message: string }) => {
      dispatch({ type: 'SET_ERROR', error: message });
    };

    const onNewMessage = ({ message }: { code: string; message: PrivateMessage }) => {
      dispatch({ type: 'ADD_MESSAGE', message });
    };

    const onUserJoined = ({ memberCount, members }: {
      socketId: string; nickname: string; memberCount: number; members: PrivateMember[];
    }) => {
      dispatch({ type: 'UPDATE_MEMBERS', memberCount, members });
    };

    const onUserLeft = ({ socketId, memberCount, members }: {
      socketId: string; nickname: string; memberCount: number; members: PrivateMember[];
    }) => {
      dispatch({ type: 'UPDATE_MEMBERS', memberCount, members });
      dispatch({ type: 'USER_STOP_TYPING', socketId });
    };

    const onUserTyping = ({ socketId, nickname: nick }: { socketId: string; nickname: string }) => {
      dispatch({ type: 'USER_TYPING', socketId, nickname: nick });
      setTimeout(() => dispatch({ type: 'USER_STOP_TYPING', socketId }), 3000);
    };

    const onUserStoppedTyping = ({ socketId }: { socketId: string }) => {
      dispatch({ type: 'USER_STOP_TYPING', socketId });
    };

    const onKicked = ({ message }: { message: string }) => {
      currentCodeRef.current = null;
      dispatch({ type: 'KICKED', message });
    };

    socket.on('private_room_created', onCreated);
    socket.on('private_room_joined', onJoined);
    socket.on('private_room_error', onError);
    socket.on('private_room_new_message', onNewMessage);
    socket.on('private_room_user_joined', onUserJoined);
    socket.on('private_room_user_left', onUserLeft);
    socket.on('private_room_user_typing', onUserTyping);
    socket.on('private_room_user_stopped_typing', onUserStoppedTyping);
    socket.on('private_room_kicked', onKicked);

    return () => {
      socket.off('private_room_created', onCreated);
      socket.off('private_room_joined', onJoined);
      socket.off('private_room_error', onError);
      socket.off('private_room_new_message', onNewMessage);
      socket.off('private_room_user_joined', onUserJoined);
      socket.off('private_room_user_left', onUserLeft);
      socket.off('private_room_user_typing', onUserTyping);
      socket.off('private_room_user_stopped_typing', onUserStoppedTyping);
      socket.off('private_room_kicked', onKicked);
    };
  }, []);

  const createRoom = useCallback((opts: { roomName?: string; password?: string; maxMembers?: number }) => {
    dispatch({ type: 'SET_STATUS', status: 'creating' });
    socketRef.current.emit('create_private_room', {
      nickname: nicknameRef.current,
      roomName: opts.roomName,
      password: opts.password,
      maxMembers: opts.maxMembers || 10,
    });
  }, []);

  const joinRoom = useCallback((code: string, password?: string) => {
    const upperCode = code.toUpperCase().trim();
    currentCodeRef.current = upperCode;
    dispatch({ type: 'SET_STATUS', status: 'joining' });

    const doJoin = () => {
      const trimmedPwd = (password || '').trim();
      socketRef.current.emit('join_private_room', {
        code: upperCode,
        nickname: nicknameRef.current,
        password: trimmedPwd,
      });
    };

    if (socketRef.current.connected) {
      doJoin();
    } else {
      socketRef.current.connect();
      socketRef.current.once('connect', doJoin);
    }
  }, []);

  const leaveRoom = useCallback(() => {
    const code = currentCodeRef.current;
    if (code) {
      socketRef.current.emit('leave_private_room', { code });
      currentCodeRef.current = null;
    }
    dispatch({ type: 'LEAVE' });
  }, []);

  const sendMessage = useCallback((content: string) => {
    const code = currentCodeRef.current;
    if (!content.trim() || !code) return;
    socketRef.current.emit('private_room_message', { code, content });
    if (isTypingRef.current) {
      socketRef.current.emit('private_room_typing_stop', { code });
      isTypingRef.current = false;
    }
  }, []);

  const handleTyping = useCallback(() => {
    const code = currentCodeRef.current;
    if (!code) return;
    if (!isTypingRef.current) {
      socketRef.current.emit('private_room_typing_start', { code });
      isTypingRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('private_room_typing_stop', { code });
      isTypingRef.current = false;
    }, 2000);
  }, []);

  const kickMember = useCallback((targetSocketId: string) => {
    const code = currentCodeRef.current;
    if (!code) return;
    socketRef.current.emit('private_room_kick', { code, targetSocketId });
  }, []);

  return {
    state,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    handleTyping,
    kickMember,
    socketId: socketRef.current.id || '',
  };
}
