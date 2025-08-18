const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const auth = require('../middleware/auth');

router.post('/', auth, listController.createList);
router.get('/:boardId', auth, listController.getListsByBoard);
router.delete('/:listId', auth, listController.removeList);
router.put('/update-name', auth, listController.updateListName);
// DELETE /lists/:id - delete a list
router.delete('/:id', auth, listController.deleteList);

module.exports = router;