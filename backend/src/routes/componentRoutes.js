const express = require('express');
const router = express.Router();
const {
  getComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent
} = require('../controllers/componentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getComponents);
router.get('/:id', getComponentById);
router.post('/', authMiddleware, createComponent);
router.put('/:id', authMiddleware, updateComponent);
router.delete('/:id', authMiddleware, deleteComponent);

module.exports = router;
