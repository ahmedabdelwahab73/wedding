const express = require('express');
const router = express.Router();
const Slider = require('../../models/Slider');

// @route   GET /api/home/sliders
router.get('/', async (req, res) => {
	try {
		const { all } = req.query;
		const query = all === 'true' ? {} : { active: 1 };
		const sliders = await Slider.find(query).sort({ sort: 1 });

		const mappedSliders = sliders.map(slider => ({
			_id: slider._id,
			'title-ar': slider['title-ar'],
			'title-en': slider['title-en'],
			image: slider.image,
			link: slider.link,
			sort: slider.sort,
			active: slider.active
		}));

		res.json(mappedSliders);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/home/sliders
router.post('/', async (req, res) => {
	try {
		const newSlider = new Slider(req.body);
		const savedSlider = await newSlider.save();
		res.status(201).json(savedSlider);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   PUT /api/home/sliders/:id
router.put('/:id', async (req, res) => {
	try {
		const updatedSlider = await Slider.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!updatedSlider) return res.status(404).json({ message: 'Slider not found' });
		res.json(updatedSlider);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   DELETE /api/home/sliders/:id
router.delete('/:id', async (req, res) => {
	try {
		const deletedSlider = await Slider.findByIdAndDelete(req.params.id);
		if (!deletedSlider) return res.status(404).json({ message: 'Slider not found' });
		res.json({ message: 'Slider deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;