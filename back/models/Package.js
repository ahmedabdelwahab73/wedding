const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
	'name-ar': { type: String, required: true },
	'name-en': { type: String, required: true },
	'subname-ar': { type: String },
	'subname-en': { type: String },
	number: { type: String },
	sort: { type: Number, default: 0 },
	price: { type: Number, required: true },
	offer: { type: Number, default: 0 },
	active: { type: Number, default: 1 },
	mostseller: { type: Number, default: 0 },
	rate: { type: Number, default: 0 },
	default_image: { type: String },
	images: [{ type: String }],
	'point-ar': [{ type: String }],
	'point-en': [{ type: String }],
	point: [{ type: String }],
}, {
	timestamps: true
});

module.exports = mongoose.model('Package', PackageSchema);
