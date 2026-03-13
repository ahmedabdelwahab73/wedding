const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('../models/User');
const langMiddleware = require('../middleware/lang');
const authMiddleware = require('../middleware/auth');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
	origin: '*',
	credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic Route
app.get('/', (req, res) => {
	res.send('API is running...');
});

// Serve static files
app.use(express.static('public'));

// =============================================
// MongoDB Connection (Serverless Optimization)
// =============================================
const connectDB = require('../lib/db');

// Database Connection Middleware (Apply before routes)
let isSeeded = false;

const seedDefaultAdmin = async () => {
	if (isSeeded) return;
	try {
		const userCount = await User.countDocuments();
		if (userCount === 0) {
			console.log('🚀 No users found. Seeding default admin...');
			const admin = new User({
				username: 'admin',
				password: 'admin123',
				role: 'admin'
			});
			await admin.save();
			console.log('✅ Default admin user created successfully!');
			console.log('-----------------------------------');
			console.log('Username: admin');
			console.log('Password: admin123');
			console.log('-----------------------------------');
		}
		isSeeded = true;
	} catch (err) {
		console.error('❌ Error seeding default admin:', err.message);
	}
};

app.use(async (req, res, next) => {
	try {
		await connectDB();
		await seedDefaultAdmin();
		next();
	} catch (err) {
		next(err);
	}
});

// =============================================
// PUBLIC ROUTES
// =============================================
app.use('/api', langMiddleware);
app.use('/api/home', require('../routes/home/index'));
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/comments', require('../routes/commentRoutes'));
app.use('/api/partners', require('../routes/partnerRoutes'));
app.use('/api/custom-packages', require('../routes/customPackageRoutes'));
app.use('/api/logos', require('../routes/logoRoutes'));
app.use('/api/custom-package-images', require('../routes/home/customPackageImageRoutes'));

// =============================================
// PROTECTED ROUTES
// =============================================
app.use('/api/dashboard', authMiddleware);
app.use('/api/dashboard/sliders', require('../routes/dashboard/sliderRoutes'));
app.use('/api/dashboard/comments', require('../routes/dashboard/commentRoutes'));
app.use('/api/dashboard/partners', require('../routes/dashboard/partnerRoutes'));
app.use('/api/dashboard/packages', require('../routes/dashboard/packageRoutes'));
app.use('/api/dashboard/logos', require('../routes/dashboard/logoRoutes'));
app.use('/api/dashboard/custom-package-images', require('../routes/dashboard/customPackageImageRoutes'));
app.use('/api/users', authMiddleware, require('../routes/userRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
	console.error('❌ Server Error:', err.message);
	res.status(err.status || 500).json({
		message: err.message || 'Internal Server Error',
		error: process.env.NODE_ENV === 'development' ? err : {}
	});
});

// Export the app for Vercel
module.exports = app;

// Start server only if running locally (not as a Vercel function)
if (require.main === module || process.env.NODE_ENV !== 'production') {
	const PORT = process.env.PORT || 5000;
	const server = app.listen(PORT, () => {
		console.log(`🚀 Server is running locally on http://localhost:${PORT}`);
	});

	// Handle Graceful Shutdown
	const gracefulShutdown = async (signal) => {
		console.log(`\n🛑 Received ${signal}. Closing MongoDB connection...`);
		try {
			await mongoose.connection.close();
			console.log('✅ MongoDB connection closed.');
			process.exit(0);
		} catch (err) {
			console.error('❌ Error during shutdown:', err.message);
			process.exit(1);
		}
	};

	process.on('SIGINT', () => gracefulShutdown('SIGINT'));
	process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}