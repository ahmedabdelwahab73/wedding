const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	body: {
		type: String,
		default: '',
	},
	rate: {
		type: Number,
		default: 0,
	},
	publish: {
		type: Number,
		default: 0, // 0 = unpublished, 1 = published
	},
	image: {
		type: String,
		default: '',
	}
}, {
	timestamps: true,
	collection: 'comments'
});

module.exports = mongoose.model('Comment', commentSchema);
