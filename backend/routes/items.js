const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getItems, createItem, updateItem, deleteItem, getSimilarItems, reportItem, getMyItems, resolveItem, verifyClaim } = require('../controllers/itemsController');

router.get('/', getItems);
router.get('/my-items', auth, getMyItems); // Must come before /:id otherwise 'my-items' matches :id
router.post('/', createItem); // Or auth, createItem depending on if we require login to post, assume auth on frontend, but good practice auth
router.put('/:id', auth, updateItem);
router.put('/:id/resolve', auth, resolveItem);
router.post('/:id/verify-claim', auth, verifyClaim);
router.delete('/:id', auth, deleteItem);
router.get('/:id/similar', getSimilarItems);
router.post('/:id/report', auth, reportItem);

module.exports = router;
