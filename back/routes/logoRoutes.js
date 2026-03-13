const express = require('express');
const router = express.Router();
const Logo = require('../models/Logo');

// @route   GET /api/logos
// @desc    Public endpoint to get active logos
router.get('/', async (req, res) => {
	try {
		const logos = await Logo.find({ active: 1 }).sort({ createdAt: -1 });
		res.json(logos);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
