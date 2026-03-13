const express = require('express');
const router = express.Router();
const Package = require('../../models/Package');

// @route   GET /api/home/packages
// @desc    Get active packages for home page
router.get('/', async (req, res) => {
	try {
		// Only fetch active packages (active: 1)
		const packages = await Package.find({ active: 1 }).sort({ sort: 1, createdAt: -1 });
		res.json(packages);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/home/packages/details
// @desc    Get package details by ID in body
router.post('/details', async (req, res) => {
	try {
		const { packageId } = req.body;
		console.log('🔍 /api/home/packages/details - Received packageId:', packageId, 'Type:', typeof packageId);
		console.log('📦 Request Body:', JSON.stringify(req.body));

		if (!packageId || (typeof packageId === 'string' && packageId.trim() === '')) {
			console.log('⚠️  Validation Failed: packageId is missing or empty');
			return res.status(400).json({ message: 'packageId is required' });
		}

		let pkg;

		// Attempt to find by MongoDB ID first
		if (packageId.match(/^[0-9a-fA-F]{24}$/)) {
			pkg = await Package.findById(packageId);
		}

		// If not found or not a valid MongoDB ID, attempt to find by the numeric 'number' field
		if (!pkg) {
			pkg = await Package.findOne({ number: packageId });
		}

		if (!pkg) {
			console.log('❌ Package not found for identifier:', packageId);
			return res.status(404).json({ message: 'Package not found' });
		}

		console.log('✅ Found package:', pkg.name || pkg['name-ar']);
		res.json(pkg);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
