export type ChatStatus =
  | 'idle'
  | 'connecting'
  | 'waiting'
  | 'matched'
  | 'disconnected';

export interface Message {
  id: string;
  content: string;
  sender: 'me' | 'stranger' | 'system';
  timestamp: number;
}

export interface ChatState {
  status: ChatStatus;
  messages: Message[];
  isTyping: boolean;
  onlineCount: number;
  roomId: string | null;
}

export interface SocketEvents {
  // Client -> Server
  find_stranger: () => void;
  send_message: (data: { content: string }) => void;
  typing_start: () => void;
  typing_stop: () => void;
  next_stranger: () => void;
  stop_searching: () => void;
  block_user: () => void;

  // Server -> Client
  waiting: (data: { position: number }) => void;
  matched: (data: { roomId: string }) => void;
  receive_message: (message: Message) => void;
  message_sent: (message: Message) => void;
  stranger_typing: () => void;
  stranger_stopped_typing: () => void;
  stranger_left: () => void;
  online_count: (data: { count: number }) => void;
  rate_limited: (data: { message: string }) => void;
  error_msg: (data: { message: string }) => void;
  user_blocked: () => void;
}

export interface ReportData {
  reporterSocketId: string;
  reportedSocketId: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'other';
  description?: string;
  sessionId?: string;
}

// ─── User Profile (client-side only, localStorage) ───────────
export type Gender = 'male' | 'female' | 'other' | 'prefer_not' | '';

export const INTERESTS = [
  'Gaming', 'Movies', 'Music', 'Coding', 'Technology',
  'Sports', 'Study', 'Travel', 'Business', 'Anime', 'Books', 'Fitness',
] as const;

export type Interest = typeof INTERESTS[number];

export interface UserProfile {
  nickname: string;
  gender: Gender;
  country: string;
  countryCode: string;
  interests: Interest[];
  onboardingComplete: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  nickname: '',
  gender: '',
  country: '',
  countryCode: '',
  interests: [],
  onboardingComplete: false,
};

// ─── Group Chat Rooms ─────────────────────────────────────────
export interface RoomDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface RoomMessage {
  id: string;
  content: string;
  nickname: string;
  socketId: string;
  timestamp: number;
}

export interface RoomMember {
  socketId: string;
  nickname: string;
}

export interface RoomState {
  currentRoom: RoomDefinition | null;
  messages: RoomMessage[];
  memberCount: number;
  members: RoomMember[];          // live member list for sidebar
  typingUsers: Map<string, string>; // socketId -> nickname
  rooms: RoomDefinition[];
  roomCounts: Record<string, number>;
  status: 'idle' | 'joining' | 'joined' | 'error';
  /** Final, globally-unique nickname assigned by the server for this session */
  myNickname: string | null;
}
