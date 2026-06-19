const { v4: uuidv4 } = require('uuid');
const { checkMessageRate, cleanupSocketRate } = require('../middleware/rateLimiter');

// In-memory state
const waitingQueue = []; // array of socket ids
const activePairs = new Map(); // socketId -> partnerSocketId
const userSockets = new Map(); // socketId -> socket
const roomData = new Map(); // roomId -> { users, startTime, messageCount }
const blockedUsers = new Map(); // socketId -> Set of blocked socketIds
let totalConnected = 0;

const getOnlineCount = () => totalConnected;

// ─── Global Unique Nickname Registry ───────────────────────────
// Shared across 1-on-1 Stranger Chat AND Chat Rooms. A nickname is
// reserved the moment it's assigned to a socket and freed on full
// disconnect, guaranteeing no two concurrently-connected users ever
// display the same name anywhere on the platform.

const MAX_NICKNAME_LEN = 20;
const DEFAULT_NICKNAME = 'Guest';

// lowercase nickname -> socketId currently holding it
const activeNicknames = new Map();
// socketId -> assigned nickname (exact case, with any _N suffix)
const socketNickname = new Map();

/**
 * Clean and constrain a raw nickname string.
 * Strips control chars, trims whitespace, enforces length.
 */
const sanitizeNickname = (raw) => {
  if (!raw || typeof raw !== 'string') return DEFAULT_NICKNAME;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]/g, '') // control chars
    .trim()
    .slice(0, MAX_NICKNAME_LEN);
  return cleaned.length > 0 ? cleaned : DEFAULT_NICKNAME;
};

/** Strip a trailing "_N" suffix to recover the base nickname. */
const baseNickname = (name) => name.replace(/_\d+$/, '');

/**
 * Assign a globally-unique nickname to a socket.
 *
 * - If the socket already holds a nickname with the same base, the
 *   existing assignment is reused (prevents incrementing on repeat
 *   calls, e.g. clicking "Next" or rejoining a room).
 * - Otherwise the previous reservation (if any) is released and a
 *   fresh unique name is reserved: Name, Name_2, Name_3, ...
 *
 * Returns the final, display-ready nickname.
 */
const assignUniqueNickname = (socket, rawNickname) => {
  const requestedBase = baseNickname(sanitizeNickname(rawNickname));
  const current = socketNickname.get(socket.id);

  // Reuse existing assignment if the base name is unchanged
  if (current && baseNickname(current).toLowerCase() === requestedBase.toLowerCase()) {
    return current;
  }

  // Release any previous reservation for this socket
  if (current) {
    const key = current.toLowerCase();
    if (activeNicknames.get(key) === socket.id) activeNicknames.delete(key);
    socketNickname.delete(socket.id);
  }

  // Find the first available variant: Name, Name_2, Name_3, ...
  let candidate = requestedBase;
  let suffix = 2;
  // Truncate base so "_N" suffix never exceeds MAX_NICKNAME_LEN
  const maxBaseLen = MAX_NICKNAME_LEN - 4; // room for "_999"
  let trimmedBase = requestedBase.slice(0, maxBaseLen) || DEFAULT_NICKNAME;
  candidate = trimmedBase;

  while (activeNicknames.has(candidate.toLowerCase())) {
    candidate = `${trimmedBase}_${suffix}`;
    suffix += 1;
  }

  activeNicknames.set(candidate.toLowerCase(), socket.id);
  socketNickname.set(socket.id, candidate);
  return candidate;
};

/** Release a socket's nickname reservation (call on full disconnect). */
const releaseNickname = (socket) => {
  const current = socketNickname.get(socket.id);
  if (!current) return;
  const key = current.toLowerCase();
  if (activeNicknames.get(key) === socket.id) activeNicknames.delete(key);
  socketNickname.delete(socket.id);
};

const removeFromQueue = (socketId) => {
  const idx = waitingQueue.indexOf(socketId);
  if (idx !== -1) waitingQueue.splice(idx, 1);
};

const matchUsers = (io, socket) => {
  // Filter valid waiting sockets, not blocked
  const blockedByMe = blockedUsers.get(socket.id) || new Set();

  const partnerIdx = waitingQueue.findIndex(
    (id) => id !== socket.id && !blockedByMe.has(id) && userSockets.has(id)
  );

  if (partnerIdx === -1) {
    // No match found, add to queue
    if (!waitingQueue.includes(socket.id)) {
      waitingQueue.push(socket.id);
    }
    socket.emit('waiting', { position: waitingQueue.length });
    broadcastOnlineCount(io);
    return;
  }

  const partnerId = waitingQueue.splice(partnerIdx, 1)[0];
  const partnerSocket = userSockets.get(partnerId);

  if (!partnerSocket || !partnerSocket.connected) {
    // Partner disconnected, try again
    matchUsers(io, socket);
    return;
  }

  const roomId = `room_${uuidv4()}`;

  // Join both to room
  socket.join(roomId);
  partnerSocket.join(roomId);

  // Track pairs
  activePairs.set(socket.id, partnerId);
  activePairs.set(partnerId, socket.id);

  // Track room
  roomData.set(roomId, {
    users: [socket.id, partnerId],
    startTime: Date.now(),
    messageCount: 0,
  });

  // Store roomId on socket
  socket.data.roomId = roomId;
  partnerSocket.data.roomId = roomId;

  // Notify both
  // Exchange profiles between matched users
  const myProfile = socket.data.profile || null;
  const partnerProfile = partnerSocket.data.profile || null;

  socket.emit('matched', { roomId, strangerProfile: partnerProfile });
  partnerSocket.emit('matched', { roomId, strangerProfile: myProfile });

  broadcastOnlineCount(io);
};

const disconnectFromPartner = (io, socket) => {
  const partnerId = activePairs.get(socket.id);

  // Notify partner FIRST — before any cleanup — for instant delivery
  if (partnerId) {
    const partnerSocket = userSockets.get(partnerId);
    if (partnerSocket && partnerSocket.connected) {
      // Use volatile emit for speed (fire-and-forget, no ack needed)
      partnerSocket.volatile.emit('stranger_left');
      partnerSocket.data.roomId = null;
    }
    activePairs.delete(partnerId);
    activePairs.delete(socket.id);
  } else {
    activePairs.delete(socket.id);
  }

  // Clean up room after notifying partner
  const roomId = socket.data.roomId;
  if (roomId) {
    socket.leave(roomId);
    roomData.delete(roomId);
    socket.data.roomId = null;
  }
};

const broadcastOnlineCount = (io) => {
  io.emit('online_count', { count: totalConnected });
};

const initSocket = (io) => {
  io.on('connection', (socket) => {
    totalConnected++;
    userSockets.set(socket.id, socket);
    socket.data.roomId = null;

    broadcastOnlineCount(io);
    console.log(`🔌 Connected: ${socket.id} | Total: ${totalConnected}`);

    // ─── Find stranger ───────────────────────────────────────
    socket.on('find_stranger', ({ profile } = {}) => {
      // Assign a globally-unique nickname (shared with chat rooms)
      const requestedNickname = profile?.nickname || socket.data.profile?.nickname;
      const uniqueNickname = assignUniqueNickname(socket, requestedNickname);

      // Store profile for sharing with matched partner
      socket.data.profile = {
        nickname: uniqueNickname,
        country: profile?.country ?? socket.data.profile?.country ?? '',
        countryCode: profile?.countryCode ?? socket.data.profile?.countryCode ?? '',
        interests: Array.isArray(profile?.interests)
          ? profile.interests.slice(0, 12)
          : socket.data.profile?.interests ?? [],
      };

      // Let the client know its final display nickname
      socket.emit('nickname_assigned', { nickname: uniqueNickname });

      disconnectFromPartner(io, socket);
      removeFromQueue(socket.id);
      matchUsers(io, socket);
    });

    // ─── Send message ─────────────────────────────────────────
    socket.on('send_message', ({ content }) => {
      if (!content || typeof content !== 'string') return;
      const trimmed = content.trim().substring(0, 500);
      if (!trimmed) return;

      // Rate limit
      if (!checkMessageRate(socket.id)) {
        socket.emit('rate_limited', { message: 'Slow down! Too many messages.' });
        return;
      }

      const roomId = socket.data.roomId;
      const partnerId = activePairs.get(socket.id);

      if (!roomId || !partnerId) {
        socket.emit('error_msg', { message: 'Not connected to a stranger.' });
        return;
      }

      // Update message count
      const room = roomData.get(roomId);
      if (room) room.messageCount++;

      const messageData = {
        id: uuidv4(),
        content: trimmed,
        timestamp: Date.now(),
        sender: 'stranger',
      };

      // Send to partner only
      const partnerSocket = userSockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.emit('receive_message', messageData);
      }

      // Echo back to sender with sender flag
      socket.emit('message_sent', { ...messageData, sender: 'me' });
    });

    // ─── Typing indicators ────────────────────────────────────
    socket.on('typing_start', () => {
      const partnerId = activePairs.get(socket.id);
      if (partnerId) {
        const p = userSockets.get(partnerId);
        if (p) p.emit('stranger_typing');
      }
    });

    socket.on('typing_stop', () => {
      const partnerId = activePairs.get(socket.id);
      if (partnerId) {
        const p = userSockets.get(partnerId);
        if (p) p.emit('stranger_stopped_typing');
      }
    });

    // ─── Next stranger ────────────────────────────────────────
    socket.on('next_stranger', () => {
      disconnectFromPartner(io, socket);
      removeFromQueue(socket.id);
      matchUsers(io, socket);
    });

    // ─── Stop searching ───────────────────────────────────────
    socket.on('stop_searching', () => {
      removeFromQueue(socket.id);
      disconnectFromPartner(io, socket);
    });

    // ─── Block user ───────────────────────────────────────────
    socket.on('block_user', () => {
      const partnerId = activePairs.get(socket.id);
      if (partnerId) {
        if (!blockedUsers.has(socket.id)) blockedUsers.set(socket.id, new Set());
        blockedUsers.get(socket.id).add(partnerId);
        disconnectFromPartner(io, socket);
        socket.emit('user_blocked');
      }
    });

    // ─── Disconnect ───────────────────────────────────────────
    socket.on('disconnect', () => {
      totalConnected = Math.max(0, totalConnected - 1);
      disconnectFromPartner(io, socket);
      removeFromQueue(socket.id);
      cleanupSocketRate(socket.id);
      blockedUsers.delete(socket.id);
      userSockets.delete(socket.id);
      releaseNickname(socket);

      broadcastOnlineCount(io);
      console.log(`❌ Disconnected: ${socket.id} | Total: ${totalConnected}`);
    });
  });
};


// ─── CHAT ROOMS ───────────────────────────────────────────────
// Group rooms — runs on same io instance, separate namespace

const ROOM_DEFINITIONS = [
  { id: 'global',     name: 'Global Chat',  emoji: '🌍', description: 'Talk about anything with everyone' },
  { id: 'gaming',     name: 'Gaming',       emoji: '🎮', description: 'Games, esports, reviews' },
  { id: 'music',      name: 'Music',        emoji: '🎵', description: 'Artists, playlists, concerts' },
  { id: 'movies',     name: 'Movies & TV',  emoji: '🎬', description: 'Films, series, recommendations' },
  { id: 'technology', name: 'Technology',   emoji: '💻', description: 'Coding, gadgets, AI' },
  { id: 'sports',     name: 'Sports',       emoji: '⚽', description: 'Football, cricket, all sports' },
  { id: 'travel',     name: 'Travel',       emoji: '✈️', description: 'Destinations, tips, stories' },
  { id: 'study',      name: 'Study',        emoji: '📚', description: 'Homework help, learning' },
  { id: 'anime',      name: 'Anime',        emoji: '🌸', description: 'Manga, series, recommendations' },
  { id: 'books',      name: 'Books',        emoji: '📖', description: 'Reading, authors, reviews' },
  { id: 'fitness',    name: 'Fitness',      emoji: '💪', description: 'Workouts, nutrition, health' },
  { id: 'business',   name: 'Business',     emoji: '💼', description: 'Startups, finance, careers' },
];

// roomId -> Set of socketIds
const groupRoomMembers = new Map();
// roomId -> Map of socketId -> nickname (for member list)
const groupRoomMemberNames = new Map();
// roomId -> message history (last 50 messages)
const groupRoomHistory = new Map();
// socketId -> roomId (current group room)
const socketGroupRoom = new Map();

ROOM_DEFINITIONS.forEach(r => {
  groupRoomMembers.set(r.id, new Set());
  groupRoomMemberNames.set(r.id, new Map());
  groupRoomHistory.set(r.id, []);
});

const getGroupRoomCounts = () => {
  const counts = {};
  ROOM_DEFINITIONS.forEach(r => {
    counts[r.id] = groupRoomMembers.get(r.id)?.size || 0;
  });
  return counts;
};

const broadcastRoomCounts = (io) => {
  io.emit('room_counts', getGroupRoomCounts());
};

const initGroupRooms = (io) => {
  io.on('connection', (socket) => {
    // Send room list + counts on connect
    socket.emit('room_list', {
      rooms: ROOM_DEFINITIONS,
      counts: getGroupRoomCounts(),
    });

    // Also respond to explicit room list requests (for reconnect cases)
    socket.on('get_room_list', () => {
      socket.emit('room_list', {
        rooms: ROOM_DEFINITIONS,
        counts: getGroupRoomCounts(),
      });
    });

    // ─── Join a group room ────────────────────────────────────
    socket.on('join_room', ({ roomId, nickname }) => {
      if (!groupRoomMembers.has(roomId)) return;

      // Leave previous group room if any
      const prevRoom = socketGroupRoom.get(socket.id);
      if (prevRoom && prevRoom !== roomId) {
        groupRoomMembers.get(prevRoom)?.delete(socket.id);
        socket.leave(`group_${prevRoom}`);
        io.to(`group_${prevRoom}`).emit('room_user_left', {
          socketId: socket.id,
          nickname: socket.data.roomNickname || 'Anonymous',
          memberCount: groupRoomMembers.get(prevRoom)?.size || 0,
        });
      }

      // Assign a globally-unique nickname (shared with Stranger Chat)
      const uniqueNickname = assignUniqueNickname(socket, nickname);

      // Join new room
      socket.join(`group_${roomId}`);
      groupRoomMembers.get(roomId).add(socket.id);
      groupRoomMemberNames.get(roomId)?.set(socket.id, uniqueNickname);
      socketGroupRoom.set(socket.id, roomId);
      socket.data.roomNickname = uniqueNickname;
      socket.data.currentGroupRoom = roomId;

      const memberCount = groupRoomMembers.get(roomId).size;

      // Send history
      // Build member list for sidebar
      const memberList = [];
      groupRoomMemberNames.get(roomId)?.forEach((nick, sid) => {
        memberList.push({ socketId: sid, nickname: nick });
      });

      socket.emit('room_history', {
        roomId,
        messages: groupRoomHistory.get(roomId) || [],
        memberCount,
        members: memberList,
        nickname: uniqueNickname,
      });

      // Let the client know its final display nickname (consistent
      // event name with Stranger Chat's nickname_assigned)
      socket.emit('nickname_assigned', { nickname: uniqueNickname });

      // Notify others
      socket.to(`group_${roomId}`).emit('room_user_joined', {
        socketId: socket.id,
        nickname: socket.data.roomNickname,
        memberCount,
      });

      broadcastRoomCounts(io);
    });

    // ─── Send group message ───────────────────────────────────
    socket.on('room_message', ({ roomId, content }) => {
      if (!content || typeof content !== 'string') return;
      const trimmed = content.trim().substring(0, 500);
      if (!trimmed) return;

      // Rate limit (reuse existing)
      if (!checkMessageRate(socket.id)) {
        socket.emit('rate_limited', { message: 'Too many messages. Slow down.' });
        return;
      }

      if (!groupRoomMembers.has(roomId) || !groupRoomMembers.get(roomId).has(socket.id)) return;

      const msg = {
        id: uuidv4(),
        content: trimmed,
        nickname: socket.data.roomNickname || 'Anonymous',
        socketId: socket.id,
        timestamp: Date.now(),
      };

      // Keep last 50 messages in history
      const history = groupRoomHistory.get(roomId);
      if (history) {
        history.push(msg);
        if (history.length > 50) history.shift();
      }

      // Broadcast to room (including sender)
      io.to(`group_${roomId}`).emit('room_new_message', { roomId, message: msg });
    });

    // ─── Typing in group room ─────────────────────────────────
    socket.on('room_typing_start', ({ roomId }) => {
      socket.to(`group_${roomId}`).emit('room_user_typing', {
        socketId: socket.id,
        nickname: socket.data.roomNickname || 'Anonymous',
      });
    });

    socket.on('room_typing_stop', ({ roomId }) => {
      socket.to(`group_${roomId}`).emit('room_user_stopped_typing', {
        socketId: socket.id,
      });
    });

    // ─── Leave group room ─────────────────────────────────────
    socket.on('leave_room', ({ roomId }) => {
      if (!groupRoomMembers.has(roomId)) return;
      groupRoomMembers.get(roomId)?.delete(socket.id);
      groupRoomMemberNames.get(roomId)?.delete(socket.id);
      socketGroupRoom.delete(socket.id);
      socket.leave(`group_${roomId}`);

      io.to(`group_${roomId}`).emit('room_user_left', {
        socketId: socket.id,
        nickname: socket.data.roomNickname || 'Anonymous',
        memberCount: groupRoomMembers.get(roomId)?.size || 0,
      });
      broadcastRoomCounts(io);
    });

    // ─── Cleanup on disconnect ────────────────────────────────
    const origDisconnect = socket.listeners('disconnect');
    socket.on('disconnect', () => {
      const roomId = socketGroupRoom.get(socket.id);
      if (roomId && groupRoomMembers.has(roomId)) {
        groupRoomMembers.get(roomId)?.delete(socket.id);
        groupRoomMemberNames.get(roomId)?.delete(socket.id);
        socketGroupRoom.delete(socket.id);
        io.to(`group_${roomId}`).emit('room_user_left', {
          socketId: socket.id,
          nickname: socket.data.roomNickname || 'Anonymous',
          memberCount: groupRoomMembers.get(roomId)?.size || 0,
        });
        broadcastRoomCounts(io);
      }
    });
  });
};

module.exports = { initSocket, getOnlineCount, initGroupRooms, ROOM_DEFINITIONS };
