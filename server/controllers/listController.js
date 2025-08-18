const admin = require('firebase-admin');

exports.createList = async (req, res) => {
    const {boardId, name } = req.body;
    const db = admin.firestore();  

    try {
        const listRef = db.collection('lists').doc();
        await listRef.set({
            id: listRef.id,
            boardId,
            name,
            createdAt: new Date().toISOString()
        });
        res.status(201).json({message: 'List created successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.getListsByBoard = async (req, res) => {
    const { boardId } = req.params;
    const db = admin.firestore();

    try {
        const snapshot = await db.collection('lists')
            .where('boardId', '==' , boardId)
            .get();
        const lists = snapshot.docs.map(doc => doc.data());
        res.status(200).json(lists);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.removeList = async (req, res) => {
    const { listId } = req.params;
    const db = admin.firestore();

    try {
        await db.collection('lists').doc(listId).delete();
        res.status(200).json({message: 'List removed successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.updateListName = async (req, res) => {
    const {listId, name} = req.body;
    const db = admin.firestore();

    try {
        await db.collection('lists').doc(listId).update({name});
        res.status(200).json({message: 'List name updated successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.deleteList = async (req, res) => {
    const { id } = req.params;
    console.log('Delete request for list ID:', id);
    const db = admin.firestore();
    try {
        await db.collection('lists').doc(id).delete();
        console.log('List deleted:', id);
        res.status(204).send();
    } catch (error) {
        console.error('Delete error for list ID:', id, error);
        res.status(500).json({ error: error.message });
    }
};