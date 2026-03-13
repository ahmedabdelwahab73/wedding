const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const path = require('path');
const fs = require('fs');

// @route   GET /api/dashboard/comments
// @desc    Get all comments for dashboard
router.get('/', async (req, res) => {
	try {
		const comments = await Comment.find().sort({ createdAt: -1 });
		res.json(comments);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// @route   PATCH /api/dashboard/comments/:id/publish
// @desc    Toggle publish status
router.patch('/:id/publish', async (req, res) => {
	try {
		const comment = await Comment.findById(req.params.id);
		if (!comment) {
			return res.status(404).json({ message: 'Comment not found' });
		}

		comment.publish = comment.publish === 1 ? 0 : 1;
		const updatedComment = await comment.save();
		res.json(updatedComment);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   DELETE /api/dashboard/comments/:id
// @desc    Delete comment
router.delete('/:id', async (req, res) => {
	try {
		const comment = await Comment.findById(req.params.id);
		if (!comment) {
			return res.status(404).json({ message: 'Comment not found' });
		}

		// Delete associated image file if it exists
		if (comment.image && comment.image.startsWith('/uploads/')) {
			const imagePath = path.join(__dirname, '../../public', comment.image);
			if (fs.existsSync(imagePath)) {
				try {
					fs.unlinkSync(imagePath);
				} catch (e) {
					console.error('Error deleting comment image:', e);
				}
			}
		}

		await comment.deleteOne();
		res.json({ message: 'Comment deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
