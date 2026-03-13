const express = require('express');
const router = express.Router();
const Logo = require('../../models/Logo');
const { createUploadMiddleware, destroyCloudinaryImage } = require('../../middleware/cloudinaryUpload');
const fs = require('fs');

// Cloudinary Storage Configuration for logos
const upload = createUploadMiddleware('logos');

// @route   GET /api/dashboard/logos
router.get('/', async (req, res) => {
	try {
		const logos = await Logo.find().sort({ createdAt: -1 });
		res.json(logos);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/dashboard/logos
router.post('/', upload.fields([{ name: 'imageLight', maxCount: 1 }, { name: 'imageDark', maxCount: 1 }]), async (req, res) => {
	try {
		if (!req.files || !req.files['imageLight'] || !req.files['imageDark']) {
			return res.status(400).json({ message: 'Please upload both light and dark mode images' });
		}

		// Read active from body or default to 1 (active)
		const isActive = req.body.active !== undefined ? Number(req.body.active) : 1;

		if (isActive === 1) {
			// Set all other logos to inactive before saving this active one
			await Logo.updateMany({}, { $set: { active: 0 } });
		}

		const logo = new Logo({
			imageLight: req.files['imageLight'][0].path,
			imageDark: req.files['imageDark'][0].path,
			active: isActive
		});

		const newLogo = await logo.save();
		res.status(201).json(newLogo);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   PATCH /api/dashboard/logos/:id/active
router.patch('/:id/active', async (req, res) => {
	try {
		const logo = await Logo.findById(req.params.id);
		if (!logo) return res.status(404).json({ message: 'Logo not found' });

		if (logo.active === 1) {
			return res.status(400).json({ message: 'This logo is already active.' });
		}

		// Set all other logos to inactive
		await Logo.updateMany(
			{ _id: { $ne: logo._id } },
			{ $set: { active: 0 } }
		);

		// Activate this one
		logo.active = 1;
		const updatedLogo = await logo.save();

		res.json(updatedLogo);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   DELETE /api/dashboard/logos/:id
router.delete('/:id', async (req, res) => {
	try {
		const logo = await Logo.findById(req.params.id);
		if (!logo) return res.status(404).json({ message: 'Logo not found' });

		const deleteImage = async (imgPath) => {
			if (imgPath) {
				if (imgPath.startsWith('/uploads/')) {
					const imagePath = require('path').join(__dirname, '../../public', imgPath);
					if (fs.existsSync(imagePath)) {
						try { fs.unlinkSync(imagePath); } catch (e) { console.error(e) }
					}
				} else {
					await destroyCloudinaryImage(imgPath);
				}
			}
		};

		await deleteImage(logo.imageLight);
		await deleteImage(logo.imageDark);

		await logo.deleteOne();
		res.json({ message: 'Logo deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
