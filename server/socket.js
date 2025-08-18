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
      // Prevent self-invitation
      if (data.board_owner_id === data.email_member) {
        return;
      }
      const admin = require('firebase-admin');
      const db = admin.firestore();
      // Check for existing invitation for this board and email
      const existingInvites = await db.collection('invitations')
        .where('boardId', '==', data.boardId)
        .where('email_member', '==', data.email_member)
        .get();
      if (!existingInvites.empty) {
        // Already invited, do not send again
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
      // Update invitation status in Firestore
      const admin = require('firebase-admin');
      const db = admin.firestore();
      await db.collection('invitations').doc(data.invite_id).update({
        status: data.status,
        respondedAt: new Date().toISOString(),
        member_id: data.member_id
      });
      // Notify board owner (broadcast for now)
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
