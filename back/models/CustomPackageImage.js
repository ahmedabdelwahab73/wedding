const mongoose = require('mongoose');

const customPackageImageSchema = new mongoose.Schema({
	images: [{
		type: String,
		required: true
	}],
	active: {
		type: Boolean,
		default: true
	}
}, { timestamps: true });

module.exports = mongoose.model('CustomPackageImage', customPackageImageSchema);
