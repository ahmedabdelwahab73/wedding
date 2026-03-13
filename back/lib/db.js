const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
	throw new Error('Please define the MONGO_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless invocations in production.
 */
let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
			maxPoolSize: 10, // Limit connections per serverless instance
			serverSelectionTimeoutMS: 5000,
		};

		cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
			console.log('✅ Connected to MongoDB Backend');
			return mongoose;
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

module.exports = connectDB;
