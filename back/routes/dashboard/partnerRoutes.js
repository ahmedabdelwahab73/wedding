const express = require('express');
const router = express.Router();
const Partner = require('../../models/Partner');
const { createUploadMiddleware, destroyCloudinaryImage } = require('../../middleware/cloudinaryUpload');
const fs = require('fs');

// Cloudinary Storage Configuration for partners
const upload = createUploadMiddleware('partners');

// @route   GET /api/dashboard/partners
router.get('/', async (req, res) => {
	try {
		const partners = await Partner.find().sort({ createdAt: -1 });
		res.json(partners);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/dashboard/partners
router.post('/', upload.single('image'), async (req, res) => {
	try {
		const { title } = req.body;
		if (!req.file) {
			return res.status(400).json({ message: 'Please upload an image' });
		}

		const partner = new Partner({
			title: title || '',
			image: req.file.path
		});

		const newPartner = await partner.save();
		res.status(201).json(newPartner);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   DELETE /api/dashboard/partners/:id
router.delete('/:id', async (req, res) => {
	try {
		const partner = await Partner.findById(req.params.id);
		if (!partner) return res.status(404).json({ message: 'Partner not found' });

		if (partner.image) {
			if (partner.image.startsWith('/uploads/')) {
				const imagePath = require('path').join(__dirname, '../../public', partner.image);
				if (fs.existsSync(imagePath)) {
					try { fs.unlinkSync(imagePath); } catch (e) { }
				}
			} else {
				await destroyCloudinaryImage(partner.image);
			}
		}

		await partner.deleteOne();
		res.json({ message: 'Partner deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
