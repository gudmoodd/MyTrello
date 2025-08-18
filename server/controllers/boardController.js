const admin = require('firebase-admin');
const mailer = require('../ultils/mailer');
exports.updateBoardName = async (req, res) => {
    const { boardId } = req.params;
    const { name } = req.body;
    const db = admin.firestore();
    try {
        await db.collection('boards').doc(boardId).update({ name });
        res.status(200).json({ message: 'Board name updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.inviteMember = async (req, res) => {
    res.status(410).json({ error: 'Use socket.io for inviting members.' });
};
exports.inviteMember = this.inviteMember;
exports.acceptInvite = async (req, res) => {
    const { invite_id, card_id, member_id, status } = req.body;
    const { boardId, id } = req.params;
    const db = admin.firestore();
    try {
        await db.collection('invitations').doc(invite_id).update({
            status,
            respondedAt: new Date().toISOString(),
            card_id,
            member_id
        });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createBoard = async (req, res) => {
    const {name , ownerEmail} = req.body;
    const db = admin.firestore();

    try {
        const boardRef = db.collection('boards').doc();
        await boardRef.set({
            id: boardRef.id,
            name, 
            ownerEmail,
            members: [ownerEmail],
            createAt: new Date().toISOString()
        })
        res.status(201).json({message: 'Board created successfully', boardId: boardRef.id});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.getBoards = async (req, res) => {
    const { email } = req.query;
    const db = admin.firestore();
    try {
        const ownerSnapshot = await db.collection('boards')
            .where('ownerEmail', '==', email)
            .get();
        const ownerBoards = ownerSnapshot.docs.map(doc => doc.data());
        const memberSnapshot = await db.collection('boards')
            .where('members', 'array-contains', email)
            .get();
        const memberBoards = memberSnapshot.docs.map(doc => doc.data());

        const inviteSnapshot = await db.collection('invitations')
            .where('member_id', '==', email)
            .where('status', '==', 'accepted')
            .get();
        const invitedBoardIds = inviteSnapshot.docs.map(doc => doc.data().boardId);
        let invitedBoards = [];
        if (invitedBoardIds.length > 0) {
            const boardPromises = invitedBoardIds.map(id => db.collection('boards').doc(id).get());
            const boardDocs = await Promise.all(boardPromises);
            invitedBoards = boardDocs.filter(doc => doc.exists).map(doc => doc.data());
        }

        const allBoards = [...ownerBoards, ...memberBoards, ...invitedBoards];
        const uniqueBoards = Array.from(new Map(allBoards.map(b => [b.id, b])).values());
        res.status(200).json(uniqueBoards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.addMember = async (req, res) => {
    const {boardId , email} = req.body;
    const db = admin.firestore();
    try {
        const boardRef = db.collection('boards').doc(boardId);
        await boardRef.update({
            members: admin.firestore.FieldValue.arrayUnion(email)
        });
        res.status(200).json({message: 'Member added successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.updateCardName = async (req, res) => {
    const { cardId } = req.params;
    const { name } = req.body;
    const db = admin.firestore();
    try {
        await db.collection('cards').doc(cardId).update({ title: name });
        res.status(200).json({ message: 'Card name updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBoard = async (req, res) => {
    const { id } = req.params;
    console.log('Delete request for board ID:', id);
    const db = admin.firestore();
    try {
        await db.collection('boards').doc(id).delete();
        console.log('Board deleted:', id);
        res.status(204).send();
    } catch (error) {
        console.error('Delete error for board ID:', id, error);
        res.status(500).json({ error: error.message });
    }
};
