const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const cardController = require('../controllers/cardController');
const auth = require('../middleware/auth');

router.post('/', boardController.createBoard);
router.get('/', boardController.getBoards);



router.put('/:boardId/update-name', auth, boardController.updateBoardName);
router.delete('/:boardId/cards/:id', auth, cardController.removeCard);
router.delete('/:id', auth, boardController.deleteBoard);

module.exports = router;