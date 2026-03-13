const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { createUploadMiddleware } = require('../middleware/cloudinaryUpload');
const fs = require('fs');

// Cloudinary Storage Configuration for comments
const upload = createUploadMiddleware('comments');

// @route   GET /api/comments
// @desc    Public endpoint to list all published comments
router.get('/', async (req, res) => {
	try {
		const comments = await Comment.find({ publish: 1 }).sort({ createdAt: -1 });
		res.json(comments);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/comments/add
// @desc    Public endpoint to add a comment
router.post('/add', upload.single('image'), async (req, res) => {
	try {
		const { name, body, rate } = req.body;

		if (!name || name.trim() === '') {
			return res.status(400).json({ message: 'Name is required' });
		}

		let imagePath = '';
		if (req.file) {
			imagePath = req.file.path;
		}

		const comment = new Comment({
			name: name.trim(),
			body: body || '',
			rate: rate !== undefined ? parseInt(rate) : 0,
			image: imagePath,
			publish: 0 // Default to unpublished
		});

		const newComment = await comment.save();
		res.status(201).json(newComment);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

module.exports = router;
