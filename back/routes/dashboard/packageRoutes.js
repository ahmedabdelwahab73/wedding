const express = require('express');
const router = express.Router();
const Package = require('../../models/Package');
const { createUploadMiddleware, destroyCloudinaryImage } = require('../../middleware/cloudinaryUpload');
const fs = require('fs');

const packageUpload = createUploadMiddleware('packages').fields([
	{ name: 'default_image', maxCount: 1 },
	{ name: 'gallery', maxCount: 50 }
]);

// @route   GET /api/dashboard/packages
// @desc    Get all packages
router.get('/', async (req, res) => {
	try {
		const packages = await Package.find().sort({ sort: 1, createdAt: -1 });
		res.json(packages);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// @route   POST /api/dashboard/packages
// @desc    Create new package
router.post('/', packageUpload, async (req, res) => {
	try {
		const {
			'name-ar': nameAr,
			'name-en': nameEn,
			'subname-ar': subnameAr,
			'subname-en': subnameEn,
			number,
			price,
			offer,
			sort,
			active,
			mostseller,
			rate,
		} = req.body;

		// Parse JSON strings back to arrays
		const pointAr = req.body['point-ar'] ? JSON.parse(req.body['point-ar']) : [];
		const pointEn = req.body['point-en'] ? JSON.parse(req.body['point-en']) : [];

		let default_image = '';
		let images = [];

		if (req.files) {
			if (req.files.default_image && req.files.default_image.length > 0) {
				default_image = req.files.default_image[0].path;
			}
			if (req.files.gallery && req.files.gallery.length > 0) {
				images = req.files.gallery.map(file => file.path);
			}
		}

		if (sort !== undefined) {
			const existingSort = await Package.findOne({ sort: parseInt(sort) });
			if (existingSort && parseInt(sort) !== 0) {
				return res.status(400).json({ message: 'رقم الترتيب هذا مستخدم بالفعل في باقة أخرى' });
			}
		}

		const newPackage = new Package({
			'name-ar': nameAr,
			'name-en': nameEn,
			'subname-ar': subnameAr,
			'subname-en': subnameEn,
			number,
			price: parseFloat(price) || 0,
			offer: parseFloat(offer) || 0,
			sort: parseInt(sort) || 0,
			active: active !== undefined ? parseInt(active) : 1,
			mostseller: mostseller !== undefined ? parseInt(mostseller) : 0,
			rate: parseFloat(rate) || 0,
			default_image,
			images,
			'point-ar': pointAr,
			'point-en': pointEn
		});

		const savedPackage = await newPackage.save();
		res.status(201).json(savedPackage);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   PUT /api/dashboard/packages/:id
// @desc    Update a package
router.put('/:id', packageUpload, async (req, res) => {
	try {
		const pkg = await Package.findById(req.params.id);
		if (!pkg) {
			return res.status(404).json({ message: 'Package not found' });
		}

		const {
			'name-ar': nameAr,
			'name-en': nameEn,
			'subname-ar': subnameAr,
			'subname-en': subnameEn,
			number,
			price,
			offer,
			sort,
			active,
			mostseller,
			rate,
			deletedImages
		} = req.body;

		if (nameAr !== undefined) pkg['name-ar'] = nameAr;
		if (nameEn !== undefined) pkg['name-en'] = nameEn;
		if (subnameAr !== undefined) pkg['subname-ar'] = subnameAr;
		if (subnameEn !== undefined) pkg['subname-en'] = subnameEn;
		if (number !== undefined) pkg.number = number;
		if (price !== undefined) pkg.price = parseFloat(price);
		if (offer !== undefined) pkg.offer = parseFloat(offer);
		if (sort !== undefined) {
			const parsedSort = parseInt(sort);
			if (parsedSort !== pkg.sort && parsedSort !== 0) {
				const existingSort = await Package.findOne({ sort: parsedSort });
				if (existingSort) {
					return res.status(400).json({ message: 'رقم الترتيب هذا مستخدم بالفعل في باقة أخرى' });
				}
			}
			pkg.sort = parsedSort;
		}
		if (active !== undefined) pkg.active = parseInt(active);
		if (mostseller !== undefined) pkg.mostseller = parseInt(mostseller);
		if (rate !== undefined) pkg.rate = parseFloat(rate);

		if (req.body['point-ar']) pkg['point-ar'] = JSON.parse(req.body['point-ar']);
		if (req.body['point-en']) pkg['point-en'] = JSON.parse(req.body['point-en']);

		// Handle deleted images
		if (deletedImages) {
			const deletedImgsArray = JSON.parse(deletedImages);
			pkg.images = pkg.images.filter(img => !deletedImgsArray.includes(img));

			// Physically delete
			for (const img of deletedImgsArray) {
				if (img.startsWith('/uploads/')) {
					const oldPath = require('path').join(__dirname, '../../public', img);
					if (fs.existsSync(oldPath)) {
						try { fs.unlinkSync(oldPath); } catch (e) { }
					}
				} else {
					await destroyCloudinaryImage(img);
				}
			}
		}

		// Handle new files
		if (req.files) {
			if (req.files.default_image && req.files.default_image.length > 0) {
				if (pkg.default_image) {
					await destroyCloudinaryImage(pkg.default_image);
				}
				pkg.default_image = req.files.default_image[0].path;
			}
			if (req.files.gallery && req.files.gallery.length > 0) {
				const newGalleryImgs = req.files.gallery.map(f => f.path);
				// limit to 50
				const totalImgs = pkg.images.concat(newGalleryImgs);
				pkg.images = totalImgs.slice(0, 50);
			}
		}

		const updatedPackage = await pkg.save();
		res.json(updatedPackage);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   PATCH /api/dashboard/packages/:id/active
// @desc    Toggle active status
router.patch('/:id/active', async (req, res) => {
	try {
		const pkg = await Package.findById(req.params.id);
		if (!pkg) {
			return res.status(404).json({ message: 'Package not found' });
		}
		pkg.active = pkg.active === 1 ? 0 : 1;
		const updatedPackage = await pkg.save();
		res.json(updatedPackage);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   PATCH /api/dashboard/packages/:id/mostseller
// @desc    Toggle most requested status
router.patch('/:id/mostseller', async (req, res) => {
	try {
		const pkg = await Package.findById(req.params.id);
		if (!pkg) {
			return res.status(404).json({ message: 'Package not found' });
		}
		pkg.mostseller = pkg.mostseller === 1 ? 0 : 1;
		const updatedPackage = await pkg.save();
		res.json(updatedPackage);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// @route   DELETE /api/dashboard/packages/:id
// @desc    Delete package
router.delete('/:id', async (req, res) => {
	try {
		const pkg = await Package.findById(req.params.id);
		if (!pkg) {
			return res.status(404).json({ message: 'Package not found' });
		}

		if (pkg.default_image) {
			if (pkg.default_image.startsWith('/uploads/')) {
				const imagePath = require('path').join(__dirname, '../../public', pkg.default_image);
				if (fs.existsSync(imagePath)) {
					try { fs.unlinkSync(imagePath); } catch (e) { }
				}
			} else {
				await destroyCloudinaryImage(pkg.default_image);
			}
		}

		if (pkg.images && pkg.images.length > 0) {
			for (const img of pkg.images) {
				if (img.startsWith('/uploads/')) {
					const imgPath = require('path').join(__dirname, '../../public', img);
					if (fs.existsSync(imgPath)) {
						try { fs.unlinkSync(imgPath); } catch (e) { }
					}
				} else {
					await destroyCloudinaryImage(img);
				}
			}
		}

		await pkg.deleteOne();
		res.json({ message: 'Package deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
