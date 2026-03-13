const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Set upload directory - Use /tmp for Vercel as it is the only writable directory
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const uploadDir = isVercel
	? path.join('/tmp', 'uploads')
	: path.join(__dirname, '..', 'public', 'uploads');

// Ensure uploads directory exists
try {
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}
} catch (err) {
	console.warn(`⚠️ Warning: Could not create uploads directory at ${uploadDir}:`, err.message);
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + '-' + uniqueSuffix + ext);
	}
});

const localUpload = multer({
	storage: storage,
	limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|webp|gif/;
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = allowedTypes.test(file.mimetype);

		if (extname && mimetype) {
			return cb(null, true);
		} else {
			cb(new Error('الرجاء رفع صور فقط (jpeg, jpg, png, webp, gif)!'));
		}
	}
});

module.exports = localUpload;
