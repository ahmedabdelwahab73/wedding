const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from the back directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedAdmin = async () => {
	try {
		const MONGO_URI = process.env.MONGO_URI;
		if (!MONGO_URI) {
			throw new Error('MONGO_URI is not defined in .env file');
		}

		console.log('⏳ Connecting to MongoDB...');
		await mongoose.connect(MONGO_URI);
		console.log('✅ Connected successfully');

		const username = 'admin';
		const password = 'adminpassword123'; // User should change this after login

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			console.log(`⚠️ User "${username}" already exists.`);
		} else {
			const admin = new User({
				username,
				password,
				role: 'admin'
			});
			await admin.save();
			console.log('🚀 Admin user created successfully!');
			console.log('-----------------------------------');
			console.log(`Username: ${username}`);
			console.log(`Password: ${password}`);
			console.log('-----------------------------------');
			console.log('⚠️ Please change your password after logging in.');
		}

		await mongoose.disconnect();
		process.exit(0);
	} catch (err) {
		console.error('❌ Error seeding admin:', err.message);
		process.exit(1);
	}
};

seedAdmin();
