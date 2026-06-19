'use client';

import { useEffect, useReducer, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { RoomState, RoomDefinition, RoomMessage, RoomMember } from '@/types/chat';

type Action =
  | { type: 'SET_STATUS'; status: RoomState['status'] }
  | { type: 'SET_ROOMS'; rooms: RoomDefinition[]; counts: Record<string, number> }
  | { type: 'SET_ROOM_COUNTS'; counts: Record<string, number> }
  | { type: 'JOIN_ROOM'; room: RoomDefinition; messages: RoomMessage[]; memberCount: number; members: RoomMember[]; myNickname: string }
  | { type: 'LEAVE_ROOM' }
  | { type: 'ADD_MESSAGE'; message: RoomMessage }
  | { type: 'SET_MEMBER_COUNT'; count: number }
  | { type: 'ADD_MEMBER'; member: RoomMember }
  | { type: 'REMOVE_MEMBER'; socketId: string }
  | { type: 'USER_TYPING'; socketId: string; nickname: string }
  | { type: 'USER_STOP_TYPING'; socketId: string }
  | { type: 'SET_MY_NICKNAME'; nickname: string };

const initialState: RoomState = {
  currentRoom: null,
  messages: [],
  memberCount: 0,
  members: [],
  typingUsers: new Map(),
  rooms: [],
  roomCounts: {},
  status: 'idle',
  myNickname: null,
};

function reducer(state: RoomState, action: Action): RoomState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'SET_ROOMS':
      return { ...state, rooms: action.rooms, roomCounts: action.counts };
    case 'SET_ROOM_COUNTS':
      return { ...state, roomCounts: action.counts };
    case 'JOIN_ROOM':
      return {
        ...state, status: 'joined',
        currentRoom: action.room,
        messages: action.messages,
        memberCount: action.memberCount,
        members: action.members,
        myNickname: action.myNickname,
        typingUsers: new Map(),
      };
    case 'LEAVE_ROOM':
      return { ...initialState, rooms: state.rooms, roomCounts: state.roomCounts, myNickname: state.myNickname };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages.slice(-199), action.message] };
    case 'SET_MEMBER_COUNT':
      return { ...state, memberCount: action.count };
    case 'ADD_MEMBER': {
      const exists = state.members.some(m => m.socketId === action.member.socketId);
      if (exists) return state;
      return { ...state, members: [...state.members, action.member], memberCount: state.memberCount + 1 };
    }
    case 'REMOVE_MEMBER':
      return {
        ...state,
        members: state.members.filter(m => m.socketId !== action.socketId),
        memberCount: Math.max(0, state.memberCount - 1),
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
    case 'SET_MY_NICKNAME':
      return { ...state, myNickname: action.nickname };
    default:
      return state;
  }
}

export function useRoom(nickname: string) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef(getSocket());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const currentRoomIdRef = useRef<string | null>(null);
  const nicknameRef = useRef(nickname);
  nicknameRef.current = nickname;

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();

    const onConnect = () => socket.emit('get_room_list');
    const onRoomList = ({ rooms, counts }: { rooms: RoomDefinition[]; counts: Record<string, number> }) => {
      dispatch({ type: 'SET_ROOMS', rooms, counts });
    };
    const onRoomCounts = (counts: Record<string, number>) => {
      dispatch({ type: 'SET_ROOM_COUNTS', counts });
    };
    const onRoomHistory = ({ roomId, messages, memberCount, members = [], nickname: myNickname }: {
      roomId: string; messages: RoomMessage[]; memberCount: number; members?: RoomMember[]; nickname?: string;
    }) => {
      const room: RoomDefinition = { id: roomId, name: roomId, emoji: '', description: '' };
      dispatch({ type: 'JOIN_ROOM', room, messages, memberCount, members, myNickname: myNickname || '' });
    };
    const onNicknameAssigned = ({ nickname }: { nickname: string }) => {
      dispatch({ type: 'SET_MY_NICKNAME', nickname });
    };
    const onNewMessage = ({ message }: { roomId: string; message: RoomMessage }) => {
      dispatch({ type: 'ADD_MESSAGE', message });
    };
    const onUserJoined = ({ socketId, nickname: nick, memberCount }: {
      socketId: string; nickname: string; memberCount: number;
    }) => {
      dispatch({ type: 'ADD_MEMBER', member: { socketId, nickname: nick } });
      dispatch({ type: 'SET_MEMBER_COUNT', count: memberCount });
    };
    const onUserLeft = ({ socketId, memberCount }: {
      socketId: string; nickname: string; memberCount: number;
    }) => {
      dispatch({ type: 'REMOVE_MEMBER', socketId });
      dispatch({ type: 'SET_MEMBER_COUNT', count: memberCount });
      dispatch({ type: 'USER_STOP_TYPING', socketId });
    };
    const onUserTyping = ({ socketId, nickname: nick }: { socketId: string; nickname: string }) => {
      dispatch({ type: 'USER_TYPING', socketId, nickname: nick });
      setTimeout(() => dispatch({ type: 'USER_STOP_TYPING', socketId }), 3000);
    };
    const onStoppedTyping = ({ socketId }: { socketId: string }) => {
      dispatch({ type: 'USER_STOP_TYPING', socketId });
    };

    socket.on('connect', onConnect);
    socket.on('room_list', onRoomList);
    socket.on('room_counts', onRoomCounts);
    socket.on('room_history', onRoomHistory);
    socket.on('room_new_message', onNewMessage);
    socket.on('room_user_joined', onUserJoined);
    socket.on('room_user_left', onUserLeft);
    socket.on('room_user_typing', onUserTyping);
    socket.on('room_user_stopped_typing', onStoppedTyping);
    socket.on('nickname_assigned', onNicknameAssigned);

    if (socket.connected) socket.emit('get_room_list');

    return () => {
      socket.off('connect', onConnect);
      socket.off('room_list', onRoomList);
      socket.off('room_counts', onRoomCounts);
      socket.off('room_history', onRoomHistory);
      socket.off('room_new_message', onNewMessage);
      socket.off('room_user_joined', onUserJoined);
      socket.off('room_user_left', onUserLeft);
      socket.off('room_user_typing', onUserTyping);
      socket.off('room_user_stopped_typing', onStoppedTyping);
      socket.off('nickname_assigned', onNicknameAssigned);
    };
  }, []);

  const joinRoom = useCallback((roomId: string, _roomDef: RoomDefinition) => {
    dispatch({ type: 'SET_STATUS', status: 'joining' });
    currentRoomIdRef.current = roomId;
    socketRef.current.emit('join_room', { roomId, nickname: nicknameRef.current });
  }, []);

  const leaveRoom = useCallback(() => {
    const roomId = currentRoomIdRef.current;
    if (roomId) {
      socketRef.current.emit('leave_room', { roomId });
      currentRoomIdRef.current = null;
    }
    dispatch({ type: 'LEAVE_ROOM' });
  }, []);

  const sendRoomMessage = useCallback((content: string) => {
    const roomId = currentRoomIdRef.current;
    if (!content.trim() || !roomId) return;
    socketRef.current.emit('room_message', { roomId, content });
    if (isTypingRef.current) {
      socketRef.current.emit('room_typing_stop', { roomId });
      isTypingRef.current = false;
    }
  }, []);

  const handleRoomTyping = useCallback(() => {
    const roomId = currentRoomIdRef.current;
    if (!roomId) return;
    if (!isTypingRef.current) {
      socketRef.current.emit('room_typing_start', { roomId });
      isTypingRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('room_typing_stop', { roomId });
      isTypingRef.current = false;
    }, 2000);
  }, []);

  return {
    state,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    handleRoomTyping,
    socketId: socketRef.current.id || '',
  };
}
