const Member = require('../models/Member');
const jwt = require('jsonwebtoken');

// Helper to generate tokens
const generateAccessToken = (member) => {
	return jwt.sign(
		{ id: member._id, email: member.email, firstName: member.firstName, role: 'member' },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: '15m' }
	);
};

const generateRefreshToken = (member) => {
	return jwt.sign(
		{ id: member._id },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: '7d' }
	);
};

// @desc    Add a new member (Sign Up)
// @route   POST /api/members/add
const addMember = async (req, res) => {
	try {
		const { firstName, lastName, businessName, email, password, service, referralCode } = req.body;

		// Check if member already exists
		const memberExists = await Member.findOne({ email });
		if (memberExists) {
			return res.status(400).json({ message: 'البريد الإلكتروني مسجل بالفعل' }); // Email already registered
		}

		const member = new Member({
			firstName,
			lastName,
			businessName,
			email,
			password,
			service,
			referralCode
		});

		// Create tokens
		const accessToken = generateAccessToken(member);
		const refreshToken = generateRefreshToken(member);

		// Save refresh token in DB
		member.refreshToken = refreshToken;
		await member.save();

		const memberData = member.toObject();
		delete memberData.password;
		delete memberData.refreshToken;

		res.status(201).json({ 
			message: 'تم إنشاء الحساب بنجاح',
			accessToken,
			refreshToken,
			member: memberData 
		}); // Account created successfully
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Show all members (not deleted)
// @route   GET /api/members
const showMembers = async (req, res) => {
	try {
		const members = await Member.find({ isDeleted: 0 }).select('-password');
		res.json(members);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get member info
// @route   GET /api/members/info/:id
const getMemberInfo = async (req, res) => {
	try {
		const member = await Member.findById(req.params.id).select('-password');
		if (!member || member.isDeleted === 1) {
			return res.status(404).json({ message: 'العضو غير موجود' }); // Member not found
		}
		res.json(member);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Toggle member active status
// @route   PUT /api/members/active/:id
const toggleActive = async (req, res) => {
	try {
		const member = await Member.findById(req.params.id);
		if (!member || member.isDeleted === 1) {
			return res.status(404).json({ message: 'العضو غير موجود' });
		}

		member.isActive = !member.isActive;
		await member.save();
		res.json({ message: 'تم تحديث الحالة بنجاح', isActive: member.isActive });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Soft delete member (toggle isDeleted between 0 and 1)
// @route   DELETE /api/members/delete/:id
const deleteMember = async (req, res) => {
	try {
		const member = await Member.findById(req.params.id);
		if (!member) {
			return res.status(404).json({ message: 'العضو غير موجود' });
		}

		// Toggle isDeleted (0 -> 1, 1 -> 0) as requested
		member.isDeleted = member.isDeleted === 0 ? 1 : 0;
		await member.save();
		res.json({ message: member.isDeleted === 1 ? 'تم الحذف بنجاح' : 'تم استعادة العضو بنجاح' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Login member
// @route   POST /api/members/login
const loginMember = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check for member
		const member = await Member.findOne({ email });
		if (!member || member.isDeleted === 1) {
			return res.status(401).json({ message: 'البريد الإلكتروني غير صحيح' }); // Email incorrect
		}

		// Check password
		const isMatch = await member.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ message: 'كلمة المرور غير صحيحة' }); // Password incorrect
		}

		// Create tokens
		const accessToken = generateAccessToken(member);
		const refreshToken = generateRefreshToken(member);

		// Save refresh token in DB
		member.refreshToken = refreshToken;
		await member.save();

		const memberData = member.toObject();
		delete memberData.password;
		delete memberData.refreshToken;

		res.json({
			message: 'تم تسجيل الدخول بنجاح',
			accessToken,
			refreshToken,
			member: memberData
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google Login / Sign Up
// @route   POST /api/members/google-login
const googleLogin = async (req, res) => {
	try {
		const { idToken, accessToken: oauthAccessToken, businessName, service } = req.body;

		if (!idToken && !oauthAccessToken) {
			return res.status(400).json({ message: 'Token is required' });
		}

		let email, given_name, family_name;

		if (idToken) {
			// Verify Google ID Token
			const ticket = await client.verifyIdToken({
				idToken,
				audience: process.env.GOOGLE_CLIENT_ID,
			});
			const payload = ticket.getPayload();
			email = payload.email;
			given_name = payload.given_name;
			family_name = payload.family_name;
		} else {
			// Verify with Access Token by calling Google API
			const axios = require('axios');
			const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
				headers: { Authorization: `Bearer ${oauthAccessToken}` }
			});
			email = userInfoRes.data.email;
			given_name = userInfoRes.data.given_name;
			family_name = userInfoRes.data.family_name;
		}

		let member = await Member.findOne({ email });

		if (!member) {
			// If member doesn't exist, create new one with provided business info
			if (!businessName || !service) {
				return res.status(400).json({ message: 'إكمال بيانات العمل مطلوب للتسجيل' });
			}

			member = new Member({
				firstName: given_name,
				lastName: family_name || '',
				email,
				password: Math.random().toString(36).slice(-10), // Random password for oauth users
				businessName,
				service,
				isActive: true
			});
			await member.save();
		} else if (member.isDeleted === 1) {
			return res.status(401).json({ message: 'العضوية محذوفة' });
		}

		// Generate tokens
		const accessToken = generateAccessToken(member);
		const refreshToken = generateRefreshToken(member);

		member.refreshToken = refreshToken;
		await member.save();

		const memberData = member.toObject();
		delete memberData.password;
		delete memberData.refreshToken;

		res.json({
			message: 'تم تسجيل الدخول بنجاح',
			accessToken,
			refreshToken,
			member: memberData
		});
	} catch (err) {
		console.error('Google login error:', err);
		res.status(500).json({ message: 'فشل التحقق من Google' });
	}
};

module.exports = {
	addMember,
	showMembers,
	getMemberInfo,
	toggleActive,
	deleteMember,
	loginMember,
	googleLogin
};
