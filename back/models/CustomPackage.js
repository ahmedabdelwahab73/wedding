const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
	pointAr: { type: String, required: true },
	pointEn: { type: String, required: true },
	price: { type: Number, required: true },
});

const CustomPackageSchema = new mongoose.Schema({
	sectionNameAr: { type: String, required: true },
	sectionNameEn: { type: String, required: true },
	options: [OptionSchema],
	active: { type: Boolean, default: true },
	sort: { type: Number, default: 0 }
}, {
	timestamps: true
});

module.exports = mongoose.model('CustomPackage', CustomPackageSchema);
