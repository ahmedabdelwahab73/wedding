const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	businessName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	service: {
		type: String,
		required: true,
	},
	referralCode: {
		type: String,
		default: '',
	},
	refreshToken: {
		type: String,
		default: '',
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	isDeleted: {
		type: Number,
		default: 0, // 0 for active, 1 for deleted
	},
}, {
	timestamps: true,
	collection: 'members'
});

// Hash password before saving
memberSchema.pre('save', async function () {
	if (!this.isModified('password')) return;

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	} catch (err) {
		throw err;
	}
});

// Method to compare password
memberSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Member', memberSchema);
