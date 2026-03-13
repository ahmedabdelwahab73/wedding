const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CustomPackageImage = require('../models/CustomPackageImage');

dotenv.config();

async function inspect() {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		const group = await CustomPackageImage.findById('67c79e60f7d564e17fc011c3');
		if (group) {
			console.log('GROUP FOUND:', group._id);
			console.log('IMAGES:', JSON.stringify(group.images, null, 2));
			group.images.forEach((img, i) => {
				console.log(`Image ${i}: [${img}] startsWith /uploads/: ${img.startsWith('/uploads/')}`);
			});
		} else {
			console.log('GROUP NOT FOUND');
		}
	} catch (err) {
		console.error(err);
	} finally {
		await mongoose.disconnect();
	}
}

inspect();
