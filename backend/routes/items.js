const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getItems, createItem, updateItem, deleteItem, getSimilarItems, reportItem } = require('../controllers/itemsController');

router.get('/', getItems);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.get('/:id/similar', getSimilarItems);
router.post('/:id/report', auth, reportItem);

module.exports = router;
