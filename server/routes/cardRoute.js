const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const auth = require('../middleware/auth');

router.post('/', auth, cardController.createCards);
router.get('/:listId', auth, cardController.getCardsByList);
router.delete('/boards/:boardId/cards/:id', auth, cardController.removeCard);
router.put('/update', auth, cardController.updateCard);
router.put('/move', auth, cardController.moveCard);
router.put('/:cardId/update-name', auth, cardController.updateCardName);
module.exports = router;