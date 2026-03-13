const CustomPackageImage = require('../models/CustomPackageImage');
const { destroyCloudinaryImage } = require('../middleware/cloudinaryUpload');
const path = require('path');
const fs = require('fs');

// POST /api/dashboard/custom-package-images
exports.addImage = async (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: 'الرجاء اختيار صورة واحدة على الأقل' });
		}

		let activeStatus = req.body.active !== undefined ? req.body.active === 'true' || req.body.active === true : true;

		// If this is the first item being added, force it to be active
		const count = await CustomPackageImage.countDocuments();
		if (count === 0) {
			activeStatus = true;
		}

		// If this new item is set to active, deactivate all others
		if (activeStatus) {
			await CustomPackageImage.updateMany({}, { active: false });
		}

		const imagePaths = req.files.map(file => file.path);

		const newGroup = new CustomPackageImage({
			images: imagePaths,
			active: activeStatus
		});
		await newGroup.save();

		res.status(201).json({
			message: `تم إضافة مجموعة مكونة من ${imagePaths.length} صور بنجاح`,
			group: newGroup
		});
	} catch (error) {
		console.error('Error adding custom package images:', error);
		res.status(500).json({ message: 'حدث خطأ أثناء إضافة الصور', error: error.message });
	}
};

// PUT /api/dashboard/custom-package-images/:id
exports.editImage = async (req, res) => {
	try {
		const { id } = req.params;
		const group = await CustomPackageImage.findById(id);

		if (!group) {
			return res.status(404).json({ message: 'المجموعة غير موجودة' });
		}

		if (req.files && req.files.length > 0) {
			const newImagePaths = req.files.map(file => file.path);
			// Save the newly uploaded URLs to a variable so we can append them later
			req.newUploadedPaths = newImagePaths;
		}

		// Handle retaining existing images / deleting some
		if (req.body.existingImages !== undefined) {
			// Frontend will pass a stringified array of URLs that are kept
			try {
				let keptImages = JSON.parse(req.body.existingImages);

				// Identify removed images
				const removedImages = group.images.filter(img => !keptImages.includes(img));

				// Unlink removed images
				for (const img of removedImages) {
					if (img.startsWith('/uploads/')) {
						const oldPath = path.join(__dirname, '..', 'public', img);
						if (fs.existsSync(oldPath)) {
							try { fs.unlinkSync(oldPath); } catch (e) { }
						}
					} else {
						await destroyCloudinaryImage(img);
					}
				}

				// Set the new base images array
				// If new files were uploaded, they were captured in req.newUploadedPaths
				const newPaths = req.newUploadedPaths || [];
				group.images = [...keptImages, ...newPaths];

			} catch (parseErr) {
				console.error("Error parsing existingImages", parseErr);
			}
		}

		if (req.body.active !== undefined) {
			const newActiveStatus = req.body.active === 'true' || req.body.active === true;

			// If trying to deactivate, ensure there's at least one other active item
			// Since we want exactly ONE active at all times, we shouldn't allow manual deactivation
			// Instead, turning another one ON turns this one OFF.
			if (newActiveStatus === false && group.active === true) {
				const activeCount = await CustomPackageImage.countDocuments({ active: true });
				if (activeCount <= 1) {
					return res.status(400).json({ message: 'لا يمكن تعطيل هذه المجموعة لأنها المجموعة الوحيدة المفعلة.' });
				}
			}

			// If activating this one, deactivate all others
			if (newActiveStatus === true && group.active === false) {
				await CustomPackageImage.updateMany({ _id: { $ne: id } }, { active: false });
			}

			group.active = newActiveStatus;
		}

		await group.save();

		res.json({
			message: 'تم تحديث المجموعة بنجاح',
			group: group
		});
	} catch (error) {
		console.error('Error updating custom package image group:', error);
		res.status(500).json({ message: 'حدث خطأ أثناء تحديث المجموعة', error: error.message });
	}
};

// GET /api/dashboard/custom-package-images
exports.showDashboard = async (req, res) => {
	try {
		const groups = await CustomPackageImage.find().sort({ createdAt: -1 });
		res.json(groups);
	} catch (error) {
		console.error('Error fetching custom package images (dashboard):', error);
		res.status(500).json({ message: 'حدث خطأ أثناء جلب الصور', error: error.message });
	}
};

// GET /api/home/custom-package-images
exports.showHome = async (req, res) => {
	try {
		const groups = await CustomPackageImage.find({ active: true }).sort({ createdAt: -1 });
		res.json(groups);
	} catch (error) {
		console.error('Error fetching custom package images (home):', error);
		res.status(500).json({ message: 'حدث خطأ أثناء جلب الصور', error: error.message });
	}
};

// DELETE /api/dashboard/custom-package-images/:id
exports.deleteImage = async (req, res) => {
	try {
		const { id } = req.params;

		const totalCount = await CustomPackageImage.countDocuments();
		if (totalCount <= 1) {
			return res.status(400).json({ message: 'لا يمكن حذف هذه المجموعة لأنها المجموعة الوحيدة المتبقية في النظام.' });
		}

		const group = await CustomPackageImage.findById(id);

		if (!group) {
			return res.status(404).json({ message: 'المجموعة غير موجودة' });
		}

		if (group.active) {
			return res.status(400).json({ message: 'لا يمكن حذف المجموعة المفعلة حالياً. يرجى تفعيل مجموعة أخرى أولاً.' });
		}

		// Delete all image files from the array
		if (group.images && group.images.length > 0) {
			for (const img of group.images) {
				if (img.startsWith('/uploads/')) {
					const imgPath = path.join(__dirname, '..', 'public', img);
					if (fs.existsSync(imgPath)) {
						try { fs.unlinkSync(imgPath); } catch (e) { }
					}
				} else {
					await destroyCloudinaryImage(img);
				}
			}
		}

		await CustomPackageImage.findByIdAndDelete(id);

		res.json({ message: 'تم حذف المجموعة بنجاح' });
	} catch (error) {
		console.error('Error deleting custom package image group:', error);
		res.status(500).json({ message: 'حدث خطأ أثناء حذف المجموعة', error: error.message });
	}
}
