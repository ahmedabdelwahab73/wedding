const CustomPackage = require('../models/CustomPackage');

// Get all sections
exports.getSections = async (req, res) => {
	try {
		const sections = await CustomPackage.find().sort({ sort: 1, createdAt: -1 });
		res.json(sections);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Create a new section
exports.createSection = async (req, res) => {
	try {
		const { sectionNameAr, sectionNameEn, options, active, sort } = req.body;
		const newSection = new CustomPackage({
			sectionNameAr,
			sectionNameEn,
			options: options || [],
			active: active !== undefined ? active : true,
			sort: sort || 0
		});

		const savedSection = await newSection.save();
		res.status(201).json(savedSection);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// Update a section
exports.updateSection = async (req, res) => {
	try {
		const updatedSection = await CustomPackage.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true, runValidators: true }
		);

		if (!updatedSection) {
			return res.status(404).json({ message: 'Section not found' });
		}

		res.json(updatedSection);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// Delete a section
exports.deleteSection = async (req, res) => {
	try {
		const deletedSection = await CustomPackage.findByIdAndDelete(req.params.id);

		if (!deletedSection) {
			return res.status(404).json({ message: 'Section not found' });
		}

		res.json({ message: 'Section deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
