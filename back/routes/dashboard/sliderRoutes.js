const express = require('express');
const router = express.Router();
const Slider = require('../../models/Slider');
const { createUploadMiddleware, destroyCloudinaryImage } = require('../../middleware/cloudinaryUpload');
const fs = require('fs');

// Cloudinary Upload Configuration
const upload = createUploadMiddleware('sliders');

// =============================================
// DASHBOARD Slider Routes (auth + lang required)
// =============================================

// @route   GET /api/dashboard/sliders
// @desc    Get all sliders for dashboard
router.get('/', async (req, res) => {
	try {
		const sliders = await Slider.find().sort({ sort: 1 });
		res.json(sliders);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/dashboard/sliders
// @desc    Add new slider
router.post('/', upload.single('image'), async (req, res) => {
	try {
		const { sort, active, link } = req.body;
		const titleAr = req.body['title-ar'];
		const titleEn = req.body['title-en'];

		if (!req.file) {
			return res.status(400).json({ message: 'Please upload an image' });
		}

		// Check for unique sort
		if (sort !== undefined) {
			const existingSort = await Slider.findOne({ sort: parseInt(sort) });
			if (existingSort) {
				return res.status(400).json({ message: 'رقم الترتيب هذا مستخدم بالفعل، يرجى اختيار رقم آخر' });
			}
		}

		// Save the Cloudinary URL
		const imagePath = req.file.path;

		const slider = new Slider({
			'title-ar': titleAr,
			'title-en': titleEn,
			image: imagePath,
			link: link || '',
			sort: sort !== undefined ? parseInt(sort) : 1,
			active: active !== undefined ? parseInt(active) : 1,
		});

		const newSlider = await slider.save();
		res.status(201).json(newSlider);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   PUT /api/dashboard/sliders/:id
// @desc    Full update slider
router.put('/:id', upload.single('image'), async (req, res) => {
	try {
		const { sort, active, link } = req.body;
		const titleAr = req.body['title-ar'];
		const titleEn = req.body['title-en'];

		const slider = await Slider.findById(req.params.id);
		if (!slider) {
			return res.status(404).json({ message: 'Slider not found' });
		}

		// Check for unique sort (excluding current slider)
		if (sort !== undefined && parseInt(sort) !== slider.sort) {
			const existingSort = await Slider.findOne({
				sort: parseInt(sort),
				_id: { $ne: req.params.id }
			});
			if (existingSort) {
				return res.status(400).json({ message: 'رقم الترتيب هذا مستخدم في سلايدر آخر، يرجى اختيار رقم آخر' });
			}
		}

		if (titleAr !== undefined) slider['title-ar'] = titleAr;
		if (titleEn !== undefined) slider['title-en'] = titleEn;
		if (link !== undefined) slider.link = link;
		if (sort !== undefined) slider.sort = parseInt(sort);
		if (active !== undefined) slider.active = parseInt(active);

		// If a new image is uploaded
		if (req.file) {
			// Delete old image if it exists
			if (slider.image) {
				if (slider.image.startsWith('/uploads/')) {
					// local file
					const oldPath = require('path').join(__dirname, '../../public', slider.image);
					if (fs.existsSync(oldPath)) {
						try { fs.unlinkSync(oldPath); } catch (e) { }
					}
				} else {
					// cloudinary file
					await destroyCloudinaryImage(slider.image);
				}
			}
			slider.image = req.file.path;
		}

		const updatedSlider = await slider.save();
		res.json(updatedSlider);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   PATCH /api/dashboard/sliders/:id
// @desc    Partial update slider (for status toggling, etc)
router.patch('/:id', async (req, res) => {
	try {
		const { sort, active, link } = req.body;
		const titleAr = req.body['title-ar'];
		const titleEn = req.body['title-en'];

		const slider = await Slider.findById(req.params.id);
		if (!slider) {
			return res.status(404).json({ message: 'Slider not found' });
		}

		// Check for unique sort if being updated
		if (sort !== undefined && parseInt(sort) !== slider.sort) {
			const existingSort = await Slider.findOne({
				sort: parseInt(sort),
				_id: { $ne: req.params.id }
			});
			if (existingSort) {
				return res.status(400).json({ message: 'رقم الترتيب هذا مستخدم في سلايدر آخر، يرجى اختيار رقم آخر' });
			}
		}

		if (titleAr !== undefined) slider['title-ar'] = titleAr;
		if (titleEn !== undefined) slider['title-en'] = titleEn;
		if (link !== undefined) slider.link = link;
		if (sort !== undefined) slider.sort = parseInt(sort);
		if (active !== undefined) slider.active = parseInt(active);

		const updatedSlider = await slider.save();
		res.json(updatedSlider);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   PATCH /api/dashboard/sliders/:id/active
// @desc    Toggle active status
router.patch('/:id/active', async (req, res) => {
	try {
		const slider = await Slider.findById(req.params.id);
		if (!slider) {
			return res.status(404).json({ message: 'Slider not found' });
		}

		slider.active = slider.active === 1 ? 0 : 1;
		const updatedSlider = await slider.save();
		res.json(updatedSlider);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   DELETE /api/dashboard/sliders/:id
// @desc    Delete slider
router.delete('/:id', async (req, res) => {
	try {
		const slider = await Slider.findById(req.params.id);
		if (!slider) {
			return res.status(404).json({ message: 'Slider not found' });
		}

		// Delete associated image file
		if (slider.image) {
			if (slider.image.startsWith('/uploads/')) {
				const imagePath = require('path').join(__dirname, '../../public', slider.image);
				if (fs.existsSync(imagePath)) {
					try { fs.unlinkSync(imagePath); } catch (e) { }
				}
			} else {
				await destroyCloudinaryImage(slider.image);
			}
		}

		await slider.deleteOne();
		res.json({ message: 'Slider deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
