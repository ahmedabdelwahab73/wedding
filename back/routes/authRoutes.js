const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate tokens
const generateAccessToken = (user) => {
	return jwt.sign(
		{ id: user._id, username: user.username, role: user.role },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: '15m' }
	);
};

const generateRefreshToken = (user) => {
	return jwt.sign(
		{ id: user._id },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: '7d' }
	);
};

// @route   POST /api/auth/login
// @desc    Login user & get tokens
router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body;

		console.log('Login attempt for:', username);

		// Check for user
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(401).json({ message: 'اسم المستخدم غير صحيح' });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ message: 'كلمة المرور غير صحيحة' });
		}

		// Create tokens
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		// Save refresh token in DB
		user.refreshToken = refreshToken;
		await user.save();

		res.json({
			accessToken,
			refreshToken,
			user: {
				id: user._id,
				username: user.username,
				role: user.role
			}
		});
	} catch (err) {
		console.error('Login error:', err);
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).json({ message: 'Refresh token required' });
		}

		const user = await User.findOne({ refreshToken });
		if (!user) {
			return res.status(403).json({ message: 'Invalid refresh token' });
		}

		jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
			if (err) {
				return res.status(403).json({ message: 'Invalid refresh token' });
			}

			if (user._id.toString() !== decoded.id) {
				return res.status(403).json({ message: 'Invalid refresh token' });
			}

			const accessToken = generateAccessToken(user);
			res.json({ accessToken });
		});
	} catch (err) {
		console.error('Refresh error:', err);
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/auth/logout
router.post('/logout', async (req, res) => {
	try {
		const { refreshToken } = req.body;

		const user = await User.findOne({ refreshToken });
		if (user) {
			user.refreshToken = '';
			await user.save();
		}

		res.json({ message: 'Logged out successfully' });
	} catch (err) {
		console.error('Logout error:', err);
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;