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
const admin = require('firebase-admin'); 

exports.createCards = async (req, res) => {
    const {listId, title, description, assignTo} = req.body;
    const db = admin.firestore();

    try {
        const cardRef = db.collection('cards').doc();
        await cardRef.set({
            id: cardRef.id,
            listId,
            title,
            description,
            assignTo: assignTo || null,
            createdAt: new Date().toISOString()
        });
        res.status(201).json({message: 'Card created successfully', cardId: cardRef.id, listId});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
} 

exports.getCardsByList = async (req, res) => {
    const {listId} = req.params;
    const db = admin.firestore();

    try {
        const snapshot = await db.collection('cards')
            .where('listId', '==', listId)
            .get();
        const cards = snapshot.docs.map(doc => doc.data());
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.removeCard = async (req, res) => {
    const { boardId, id } = req.params;
    const db = admin.firestore();
    try {
        await db.collection('cards').doc(id).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.updateCard = async (req, res) => {
    const {cardID, title, description, assignTo} = req.body;
    const db = admin.firestore();

    try {
        await db.collection('cards').doc(cardID).update({
            ...(title && {title}),
            ...(description && {description}),
            ...(assignTo && {assignTo})
        })
        res.status(200).json({message: 'Card updated successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.moveCard = async (req, res) => {
    const {cardID, newListID} = req.body;
    const db = admin.firestore();

    try {
        await db.collection('cards').doc(cardID).update({listId: newListID});
        // Emit socket event for real-time update
        const { io } = require('../socket');
        io.emit('card-moved', { cardID, newListID });
        res.status(200).json({message: 'Card moved successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}