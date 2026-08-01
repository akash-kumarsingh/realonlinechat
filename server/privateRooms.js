// ─── PRIVATE ROOMS ─────────────────────────────────────────────

const privateRooms = new Map();
const privateNicknames = new Map(); // socketId -> nickname (private room specific)

// ─── Unique nickname for private rooms ─────────────────────────
const sanitize = (raw) => (raw || 'Anonymous').trim().replace(/[<>'"]/g, '').substring(0, 24) || 'Anonymous';

const assignPrivateNick = (socketId, raw, roomMembers) => {
  const base = sanitize(raw);
  const taken = new Set(roomMembers.values());

  if (!taken.has(base)) return base;

  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}_${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}_${Math.floor(Math.random() * 9000) + 1000}`;
};

// ─── Room code generator ────────────────────────────────────────
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

// ─── Auto-expire after 24 hours ────────────────────────────────
setInterval(() => {
  const now = Date.now();
  const EXPIRE = 24 * 60 * 60 * 1000;
  for (const [code, room] of privateRooms.entries()) {
    if (now - room.createdAt > EXPIRE) privateRooms.delete(code);
  }
}, 60 * 60 * 1000);

// ─── Helper: build member list with isAdmin flag ────────────────
const buildMemberList = (room) =>
  Array.from(room.members.entries()).map(([sid, nick]) => ({
    socketId: sid,
    nickname: nick,
    isAdmin: sid === room.createdBy,
  }));

// ─── Main init ─────────────────────────────────────────────────
const initPrivateRooms = (io) => {
  io.on('connection', (socket) => {

    // ── Create private room ──────────────────────────────────
    socket.on('create_private_room', ({ nickname, roomName, password, maxMembers }) => {
      let code;
      let attempts = 0;
      do { code = generateRoomCode(); attempts++; }
      while (privateRooms.has(code) && attempts < 10);

      const uniqueNick = sanitize(nickname);

      const room = {
        code,
        name: (roomName || 'Private Room').substring(0, 40),
        createdBy: socket.id,
        members: new Map([[socket.id, uniqueNick]]),
        messages: [],
        createdAt: Date.now(),
        maxMembers: Math.min(Math.max(parseInt(maxMembers) || 10, 2), 20),
        password: password ? password.trim().substring(0, 20) : null,
      };

      privateRooms.set(code, room);
      socket.join(`private_${code}`);
      socket.data.privateRoomCode = code;
      socket.data.privateNickname = uniqueNick;

      socket.emit('private_room_created', {
        code,
        name: room.name,
        memberCount: 1,
        members: buildMemberList(room),
        hasPassword: !!room.password,
        maxMembers: room.maxMembers,
        expiresAt: room.createdAt + 24 * 60 * 60 * 1000,
      });

      console.log(`🔒 Private room created: ${code} by ${uniqueNick}`);
    });

    // ── Join private room ────────────────────────────────────
    socket.on('join_private_room', ({ code, nickname, password }) => {
      const upperCode = (code || '').toUpperCase().trim();
      const room = privateRooms.get(upperCode);

      if (!room) {
        socket.emit('private_room_error', { message: 'Room not found. Check the code and try again.' });
        return;
      }

      const isCreator = room.createdBy === socket.id;
      const isAlreadyMember = room.members.has(socket.id);

      // Already member — resend history (reconnect)
      if (isAlreadyMember) {
        socket.join(`private_${upperCode}`);
        socket.emit('private_room_joined', {
          code: upperCode, name: room.name,
          messages: room.messages.slice(-50),
          members: buildMemberList(room),
          memberCount: room.members.size,
          hasPassword: !!room.password,
          maxMembers: room.maxMembers,
          expiresAt: room.createdAt + 24 * 60 * 60 * 1000,
        });
        return;
      }

      // Room full — skip for creator
      if (!isCreator && room.members.size >= room.maxMembers) {
        socket.emit('private_room_error', { message: 'Room is full.' });
        return;
      }

      // Password check — skip for creator
      const roomPwd = (room.password || '').trim();
      const givenPwd = (password || '').trim();
      if (!isCreator && roomPwd && roomPwd !== givenPwd) {
        socket.emit('private_room_error', { message: 'Incorrect password.' });
        return;
      }

      // Assign unique nickname
      const uniqueNick = assignPrivateNick(socket.id, nickname, room.members);
      room.members.set(socket.id, uniqueNick);
      socket.join(`private_${upperCode}`);
      socket.data.privateRoomCode = upperCode;
      socket.data.privateNickname = uniqueNick;

      const memberList = buildMemberList(room);

      socket.emit('private_room_joined', {
        code: upperCode, name: room.name,
        messages: room.messages.slice(-50),
        members: memberList,
        memberCount: room.members.size,
        hasPassword: !!room.password,
        maxMembers: room.maxMembers,
        expiresAt: room.createdAt + 24 * 60 * 60 * 1000,
      });

      socket.to(`private_${upperCode}`).emit('private_room_user_joined', {
        socketId: socket.id,
        nickname: uniqueNick,
        memberCount: room.members.size,
        members: memberList,
      });

      console.log(`🔒 ${uniqueNick} joined private room: ${upperCode}`);
    });

    // ── Check room exists ────────────────────────────────────
    socket.on('check_private_room', ({ code }) => {
      const upperCode = (code || '').toUpperCase().trim();
      const room = privateRooms.get(upperCode);
      if (!room) { socket.emit('private_room_check', { exists: false }); return; }
      socket.emit('private_room_check', {
        exists: true, name: room.name,
        memberCount: room.members.size, maxMembers: room.maxMembers,
        hasPassword: !!room.password, isFull: room.members.size >= room.maxMembers,
      });
    });

    // ── Send message ─────────────────────────────────────────
    socket.on('private_room_message', ({ code, content }) => {
      const upperCode = (code || '').toUpperCase().trim();
      const room = privateRooms.get(upperCode);
      if (!room || !room.members.has(socket.id)) return;

      const trimmed = (content || '').trim().substring(0, 500);
      if (!trimmed) return;

      const msg = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        content: trimmed,
        nickname: socket.data.privateNickname || 'Anonymous',
        socketId: socket.id,
        timestamp: Date.now(),
        isAdmin: socket.id === room.createdBy,
      };

      room.messages.push(msg);
      if (room.messages.length > 100) room.messages.shift();

      io.to(`private_${upperCode}`).emit('private_room_new_message', { code: upperCode, message: msg });
    });

    // ── Typing ───────────────────────────────────────────────
    socket.on('private_room_typing_start', ({ code }) => {
      const upperCode = (code || '').toUpperCase().trim();
      socket.to(`private_${upperCode}`).emit('private_room_user_typing', {
        socketId: socket.id,
        nickname: socket.data.privateNickname || 'Anonymous',
      });
    });

    socket.on('private_room_typing_stop', ({ code }) => {
      const upperCode = (code || '').toUpperCase().trim();
      socket.to(`private_${upperCode}`).emit('private_room_user_stopped_typing', { socketId: socket.id });
    });

    // ── Kick member (host only) ─────────────────────────────
    socket.on('private_room_kick', ({ code, targetSocketId }) => {
      const upperCode = (code || '').toUpperCase().trim();
      const room = privateRooms.get(upperCode);
      if (!room) return;

      // Only host can kick
      if (room.createdBy !== socket.id) {
        socket.emit('private_room_error', { message: 'Only the host can remove members.' });
        return;
      }

      // Cannot kick yourself
      if (targetSocketId === socket.id) return;

      // Must be a member
      if (!room.members.has(targetSocketId)) return;

      const kickedNick = room.members.get(targetSocketId) || 'Anonymous';
      room.members.delete(targetSocketId);

      // Notify kicked user
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit('private_room_kicked', {
          message: 'You were removed from the room by the host.',
        });
        targetSocket.leave(`private_${upperCode}`);
        targetSocket.data.privateRoomCode = null;
      }

      // Notify remaining members
      const memberList = buildMemberList(room);
      io.to(`private_${upperCode}`).emit('private_room_user_left', {
        socketId: targetSocketId,
        nickname: kickedNick,
        memberCount: room.members.size,
        members: memberList,
        wasKicked: true,
      });

      console.log(`🔒 ${kickedNick} was kicked from room ${upperCode} by host`);
    });

    // ── Leave room ───────────────────────────────────────────
    socket.on('leave_private_room', ({ code }) => {
      const upperCode = (code || '').toUpperCase().trim();
      const room = privateRooms.get(upperCode);
      if (!room) return;

      const nick = socket.data.privateNickname || 'Anonymous';
      room.members.delete(socket.id);
      socket.leave(`private_${upperCode}`);
      socket.data.privateRoomCode = null;

      if (room.members.size === 0) {
        privateRooms.delete(upperCode);
      } else {
        io.to(`private_${upperCode}`).emit('private_room_user_left', {
          socketId: socket.id, nickname: nick,
          memberCount: room.members.size,
          members: buildMemberList(room),
        });
      }
    });

    // ── Disconnect cleanup ───────────────────────────────────
    socket.on('disconnect', () => {
      const code = socket.data.privateRoomCode;
      if (!code) return;
      const room = privateRooms.get(code);
      if (!room) return;

      const nick = socket.data.privateNickname || 'Anonymous';
      room.members.delete(socket.id);

      if (room.members.size === 0) {
        privateRooms.delete(code);
      } else {
        io.to(`private_${code}`).emit('private_room_user_left', {
          socketId: socket.id, nickname: nick,
          memberCount: room.members.size,
          members: buildMemberList(room),
        });
      }
    });
  });
};

module.exports = { initPrivateRooms };
