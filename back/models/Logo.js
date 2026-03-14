const mongoose = require('mongoose');

const logoSchema = new mongoose.Schema({
	image: {
		type: String,
		required: true,
	},
	active: {
		type: Number,
		default: 1,
	}
}, {
	timestamps: true,
	collection: 'logos'
});

module.exports = mongoose.model('Logo', logoSchema);
