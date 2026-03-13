const express = require('express');
const router = express.Router();

// =============================================
// Home Page Public Routes (no auth needed)
// =============================================

// Slider — show active sliders for home page
router.use('/sliders', require('./sliderRoutes'));
// Packages — show active packages for home page
router.use('/packages', require('./packageRoutes'));

module.exports = router;
