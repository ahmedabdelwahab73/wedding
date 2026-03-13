const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { Readable } = require('stream');
const sharp = require('sharp');

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates an upload middleware instance using Cloudinary
 * @param {string} folderName - The folder name in Cloudinary where images will be saved
 * @returns {multer.Instance} - The configured multer instance
 */
const createUploadMiddleware = (folderName) => {
	const storage = new CloudinaryStorage({
		cloudinary: cloudinary,
		params: {
			folder: `mimo/${folderName}`, // Organize in a 'mimo' main folder
			allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
			// Automatically compress and resize to optimize upload and delivery speed
			// transformation: [{ width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }]
		},
	});

	return multer({
		storage: storage,
		limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
	});
};

const multerMemoryUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 50 * 1024 * 1024 }
});

const uploadBufferToCloudinary = async (buffer, folderName) => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: `mimo/${folderName}`,
				allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
			},
			(error, result) => {
				if (error) reject(error);
				else resolve(result.secure_url);
			}
		);
		Readable.from(buffer).pipe(uploadStream);
	});
};

/**
 * Extracts the public_id from a Cloudinary URL and deletes the image.
 * @param {string} imageUrl The full Cloudinary URL
 */
const destroyCloudinaryImage = async (imageUrl) => {
	try {
		if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) return;

		const parts = imageUrl.split('/');
		const uploadIndex = parts.indexOf('upload');
		if (uploadIndex !== -1) {
			let publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
			if (/^v\d+$/.test(parts[uploadIndex + 1])) {
				publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
			}
			const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // remove extension
			await cloudinary.uploader.destroy(publicId);
		}
	} catch (error) {
		console.error('Error destroying Cloudinary image:', error);
	}
};

module.exports = {
	cloudinary,
	createUploadMiddleware,
	destroyCloudinaryImage,
	multerMemoryUpload,
	uploadBufferToCloudinary
};
