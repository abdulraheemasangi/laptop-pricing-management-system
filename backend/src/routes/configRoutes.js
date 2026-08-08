const express = require('express');
const router = express.Router();
const {
  createConfiguration,
  getConfigurations,
  getConfigurationById,
  updateConfigurationStatus,
  deleteConfiguration
} = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getConfigurations);
router.get('/:id', getConfigurationById);
router.post('/', authMiddleware, createConfiguration);
router.patch('/:id/status', authMiddleware, updateConfigurationStatus);
router.delete('/:id', authMiddleware, deleteConfiguration);

module.exports = router;
