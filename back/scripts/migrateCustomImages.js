const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CustomPackageImage = require('../models/CustomPackageImage');
const { cloudinary } = require('../middleware/cloudinaryUpload');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');
const sharp = require('sharp');

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const uploadBufferToCloudinary = async (buffer, folderName, originalFilename) => {
	// Compress and optimize
	const optimizedBuffer = await sharp(buffer)
		.resize({ width: 8000, withoutEnlargement: true })
		.webp({ quality: 100 })
		.toBuffer();

	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: `mimo/${folderName}`,
				allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
				public_id: path.parse(originalFilename).name // Use original filename as public_id base
			},
			(error, result) => {
				if (error) reject(error);
				else resolve(result.secure_url);
			}
		);
		Readable.from(optimizedBuffer).pipe(uploadStream);
	});
};

async function migrate() {
	try {
		console.log('⏳ Connecting to MongoDB...');
		await mongoose.connect(MONGO_URI);
		console.log('✅ Connected to MongoDB');

		const groups = await CustomPackageImage.find();
		console.log(`🔍 Found ${groups.length} image groups to check`);

		let updatedCount = 0;
		let skipCount = 0;
		let totalImagesMigrated = 0;

		for (const group of groups) {
			let needsUpdate = false;
			const updatedImages = [];

			console.log(`Checking group: ${group._id}`);

			for (const imgPath of group.images) {
				// Check if it's a local path (either starts with /uploads/ or uploads/)
				if (imgPath.includes('uploads/') && !imgPath.includes('res.cloudinary.com')) {
					console.log(`   📦 Migrating local image: ${imgPath}`);

					// Cleanup path for fs - remove leading slash if present, then find it in public/
					const relativePath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
					const fullPath = path.resolve(__dirname, '..', 'public', relativePath);
					console.log(`      📂 Checking path: ${fullPath}`);
					const exists = fs.existsSync(fullPath);
					console.log(`      📂 Exists: ${exists}`);

					if (exists) {
						try {
							const buffer = fs.readFileSync(fullPath);
							const cloudinaryUrl = await uploadBufferToCloudinary(buffer, 'custom-packages', path.basename(fullPath));
							updatedImages.push(cloudinaryUrl);
							needsUpdate = true;
							totalImagesMigrated++;
							console.log(`      ✅ Uploaded to Cloudinary: ${cloudinaryUrl}`);
						} catch (uploadErr) {
							console.error(`      ❌ Failed to upload ${imgPath}:`, uploadErr.message);
							updatedImages.push(imgPath);
						}
					} else {
						console.warn(`      ⚠️ File not found locally: ${fullPath}`);
						updatedImages.push(imgPath);
					}
				} else {
					console.log(`   ℹ️ Already Cloudinary or not local: ${imgPath}`);
					updatedImages.push(imgPath);
				}
			}

			if (needsUpdate) {
				group.images = updatedImages;
				await group.save();
				updatedCount++;
				console.log(`   💾 Updated group ID: ${group._id}`);
			} else {
				skipCount++;
				console.log(`   ⏭️ Group ${group._id} skip (no local images)`);
			}
		}

		console.log('--- Migration Summary ---');
		console.log(`Groups checked: ${groups.length}`);
		console.log(`Groups updated: ${updatedCount}`);
		console.log(`Groups skipped: ${skipCount}`);
		console.log(`Total images migrated: ${totalImagesMigrated}`);
		console.log('-------------------------');

	} catch (err) {
		console.error('❌ Migration failed:', err);
	} finally {
		await mongoose.disconnect();
		console.log('👋 Disconnected from MongoDB');
	}
}

migrate();
