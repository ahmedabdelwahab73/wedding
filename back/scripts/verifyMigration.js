const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CustomPackageImage = require('../models/CustomPackageImage');

dotenv.config();

async function verify() {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		const groups = await CustomPackageImage.find();

		console.log(`Checking ${groups.length} groups...`);
		let localCount = 0;
		let cloudinaryCount = 0;

		groups.forEach(group => {
			group.images.forEach(img => {
				if (img.startsWith('/uploads/')) {
					localCount++;
					console.log(`❌ Local path found: ${img} in group ${group._id}`);
				} else if (img.includes('res.cloudinary.com')) {
					cloudinaryCount++;
				}
			});
		});

		console.log(`Summary:`);
		console.log(`- Local paths: ${localCount}`);
		console.log(`- Cloudinary paths: ${cloudinaryCount}`);

		if (localCount === 0) {
			console.log('✅ All images are on Cloudinary!');
		} else {
			console.log('❌ Some images are still on local storage.');
		}

	} catch (err) {
		console.error('Verification failed:', err);
	} finally {
		await mongoose.disconnect();
	}
}

verify();
