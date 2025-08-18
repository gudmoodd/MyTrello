const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/taskController');
const auth = require('../middleware/auth');


router.get('/boards/:boardId/cards/:id/tasks', auth, tasksController.getTasks);
router.post('/boards/:boardId/cards/:id/tasks', auth, tasksController.createTask);
router.get('/boards/:boardId/cards/:id/tasks/:taskId', auth, tasksController.getTask);
router.put('/boards/:boardId/cards/:id/tasks/:taskId', auth, tasksController.updateTask);
router.delete('/boards/:boardId/cards/:id/tasks/:taskId', auth, tasksController.deleteTask);


// router.post('/boards/:boardId/cards/:id/tasks/:taskId/assign', auth, tasksController.assignMember);
// router.get('/boards/:boardId/cards/:id/tasks/:taskId/assign', auth, tasksController.getAssignedMembers);
// router.delete('/boards/:boardId/cards/:id/tasks/:taskId/assign/:memberId', auth, tasksController.removeAssignment);

// router.post('/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach', auth, tasksController.attachGithub);
// router.get('/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments', auth, tasksController.getGithubAttachments);
// router.delete('/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId', auth, tasksController.removeGithubAttachment);

module.exports = router;