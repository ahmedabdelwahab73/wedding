const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');

// @route   GET /api/partners
// @desc    Public endpoint to list all partners/brands
router.get('/', async (req, res) => {
	try {
		const partners = await Partner.find().sort({ createdAt: -1 });
		res.json(partners);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
