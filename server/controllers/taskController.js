const admin = require('firebase-admin');

// 1. Retrieve All Tasks of a card
exports.getTasks = async (req, res) => {
    const { boardId, id } = req.params;
    const db = admin.firestore();
    try {
        const snapshot = await db.collection('tasks').where('cardId', '==', id).get();
        const tasks = snapshot.docs.map(doc => doc.data());
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Create a New Task within a card
exports.createTask = async (req, res) => {
    const { boardId, id } = req.params;
    const { title, description, status } = req.body;
    const db = admin.firestore();
    if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'User email not found in token. Please log in again.' });
    }
    try {
        const taskRef = db.collection('tasks').doc();
        await taskRef.set({
            id: taskRef.id,
            cardId: id,
            title,
            description,
            status,
            ownerId: req.user.email
        });
        res.status(201).json({
            id: taskRef.id,
            cardId: id,
            ownerId: req.user.email,
            title,
            description,
            status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Retrieve Task Details within a card
exports.getTask = async (req, res) => {
    const { boardId, id, taskId } = req.params;
    const db = admin.firestore();
    try {
        const doc = await db.collection('tasks').doc(taskId).get();
        if (!doc.exists) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json(doc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Update Task Details within a card
exports.updateTask = async (req, res) => {
    const { boardId, id, taskId } = req.params;
    const { title, description, status } = req.body;
    const db = admin.firestore();
    try {
        await db.collection('tasks').doc(taskId).update({
            ...(title && { title }),
            ...(description && { description }),
            ...(status && { status })
        });
        res.status(200).json({ id: taskId, cardId: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Delete a Task within a card
exports.deleteTask = async (req, res) => {
    const { boardId, id, taskId } = req.params;
    const db = admin.firestore();
    try {
        await db.collection('tasks').doc(taskId).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Assign Member to a Task
exports.assignMember = async (req, res) => {
    const { boardId, id, taskId } = req.params;
    const { memberId } = req.body;
    const db = admin.firestore();
    try {
        await db.collection('taskAssignments').add({ taskId, memberId });
        res.status(201).json({ taskId, memberId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Retrieve Assigned Members of a Task
exports.getAssignedMembers = async (req, res) => {
    const { boardId, id, taskId } = req.params;
    const db = admin.firestore();
    try {
        const snapshot = await db.collection('taskAssignments').where('taskId', '==', taskId).get();
        const members = snapshot.docs.map(doc => doc.data());
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Remove Member Assignment from a Task
exports.removeAssignment = async (req, res) => {
    const { boardId, id, taskId, memberId } = req.params;
    const db = admin.firestore();
    try {
        const snapshot = await db.collection('taskAssignments')
            .where('taskId', '==', taskId)
            .where('memberId', '==', memberId)
            .get();
        const batch = db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 10. Attach GitHub Pull Request, Commit, or Issue to a Task
exports.attachGithub = async (req, res) => {
    const { boardId, cardId, taskId } = req.params;
    const { type, number } = req.body;
    const db = admin.firestore();
    try {
        const ref = db.collection('githubAttachments').doc();
        await ref.set({
            attachmentId: ref.id,
            taskId,
            type,
            number
        });
        res.status(201).json({
            taskId,
            attachmentId: ref.id,
            type,
            number
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 11. Retrieve Attached GitHub Attachments of a Task
exports.getGithubAttachments = async (req, res) => {
    const { boardId, cardId, taskId } = req.params;
    const db = admin.firestore();
    try {
        const snapshot = await db.collection('githubAttachments').where('taskId', '==', taskId).get();
        const attachments = snapshot.docs.map(doc => doc.data());
        res.status(200).json(attachments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 12. Remove GitHub Attachment from a Task
exports.removeGithubAttachment = async (req, res) => {
    const { boardId, cardId, taskId, attachmentId } = req.params;
    const db = admin.firestore();
    try {
        await db.collection('githubAttachments').doc(attachmentId).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
