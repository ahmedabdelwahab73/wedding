const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		default: 'admin',
	},
	refreshToken: {
		type: String,
		default: '',
	},
}, {
	timestamps: true,
	collection: 'dash-auth'
});

// Hash password before saving
userSchema.pre('save', async function () {
	if (!this.isModified('password')) return;

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	} catch (err) {
		throw err;
	}
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
