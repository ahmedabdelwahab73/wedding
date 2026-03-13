const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
	title: {
		type: String,
		default: '',
	},
	image: {
		type: String,
		required: true,
	}
}, {
	timestamps: true,
	collection: 'partners'
});

module.exports = mongoose.model('Partner', partnerSchema);
