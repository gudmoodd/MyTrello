const { Server } = require('socket.io');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {


    socket.on('invite-member', async (data) => {
        if (data.board_owner_id === data.email_member) {
        return;
      }
      const admin = require('firebase-admin');
      const db = admin.firestore();
      const existingInvites = await db.collection('invitations')
        .where('boardId', '==', data.boardId)
        .where('email_member', '==', data.email_member)
        .get();
      if (!existingInvites.empty) {
        return;
      }
      const invite_id = `${data.boardId}_${data.email_member}_${Date.now()}`;
      await db.collection('invitations').doc(invite_id).set({
        invite_id,
        boardId: data.boardId,
        board_owner_id: data.board_owner_id,
        email_member: data.email_member,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      emitInvite(data.email_member, {
        invite_id,
        boardId: data.boardId,
        board_owner_id: data.board_owner_id,
        email_member: data.email_member,
        status: 'pending'
      });
    });

    socket.on('respond-invite', async (data) => {
      const admin = require('firebase-admin');
      const db = admin.firestore();
      await db.collection('invitations').doc(data.invite_id).update({
        status: data.status,
        respondedAt: new Date().toISOString(),
        member_id: data.member_id
      });
      io.emit('invite-response', data);
    });
  });
}

function emitInvite(email, invite) {
  if (io) {
    io.emit('board-invite', { email, invite });
  }
}

module.exports = { initSocket, emitInvite, get io() { return io; } };
