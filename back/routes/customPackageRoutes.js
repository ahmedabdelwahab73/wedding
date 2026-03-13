const express = require('express');
const router = express.Router();
const customPackageController = require('../controllers/customPackageController');
const authMiddleware = require('../middleware/auth');

// Public route to get custom packages (used by frontend client)
router.get('/', customPackageController.getSections);

// Protected routes for dashboard
router.post('/', authMiddleware, customPackageController.createSection);
router.put('/:id', authMiddleware, customPackageController.updateSection);
router.delete('/:id', authMiddleware, customPackageController.deleteSection);

module.exports = router;
