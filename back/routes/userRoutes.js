const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
router.get('/', async (req, res) => {
	try {
		const users = await User.find().select('-password');
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/users
// @desc    Create a user
router.post('/', async (req, res) => {
	const { username, password, role } = req.body;

	try {
		// Check if user exists
		let userExists = await User.findOne({ username });
		if (userExists) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const user = new User({
			username,
			password, // Will be hashed by pre-save hook
			role: role || 'admin'
		});

		const newUser = await user.save();
		const userResponse = newUser.toObject();
		delete userResponse.password;

		res.status(201).json(userResponse);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   PUT /api/users/update-credentials
// @desc    Update user username and password
router.put('/update-credentials', authMiddleware, async (req, res) => {
	try {
		const { currentPassword, newUsername, newPassword } = req.body;

		// Find user by id from token
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Verify current password
		const isMatch = await user.comparePassword(currentPassword);
		if (!isMatch) {
			return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' }); // Current password incorrect
		}

		// Update username if provided and different
		if (newUsername && newUsername !== user.username) {
			// Check if new username is already taken
			const usernameExists = await User.findOne({ username: newUsername });
			if (usernameExists) {
				return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' }); // Username already exists
			}
			user.username = newUsername;
		}

		// Update password if provided
		if (newPassword) {
			user.password = newPassword; // Will be hashed by pre-save hook
		}

		await user.save();

		res.json({ message: 'تم تحديث البيانات بنجاح' }); // Credentials updated successfully
	} catch (err) {
		console.error('Update credentials error:', err);
		res.status(500).json({ message: 'حدث خطأ في الخادم' }); // Server error
	}
});

module.exports = router;
