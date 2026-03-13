const express = require('express');
const router = express.Router();
const customPackageImageController = require('../../controllers/customPackageImageController');
const { createUploadMiddleware } = require('../../middleware/cloudinaryUpload');

const upload = createUploadMiddleware('custom-packages');

// Routes
router.get('/', customPackageImageController.showDashboard);
router.post('/', upload.array('images', 100), customPackageImageController.addImage);
router.put('/:id', upload.array('images', 100), customPackageImageController.editImage);
router.delete('/:id', customPackageImageController.deleteImage);

module.exports = router;
