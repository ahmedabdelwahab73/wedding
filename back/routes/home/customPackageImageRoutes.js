const express = require('express');
const router = express.Router();
const customPackageImageController = require('../../controllers/customPackageImageController');

// Routes for public home page
router.get('/', customPackageImageController.showHome);

module.exports = router;
