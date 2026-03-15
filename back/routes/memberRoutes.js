const express = require('express');
const router = express.Router();
const {
	addMember,
	showMembers,
	getMemberInfo,
	toggleActive,
	deleteMember,
	loginMember,
	googleLogin
} = require('../controllers/memberController');

// Public routes for sign up and login
router.post('/add', addMember);
router.post('/login', loginMember);
router.post('/google-login', googleLogin);

// Protected routes (listing, info, active, delete)
// Note: You can add authMiddleware here if these should be admin-only
router.get('/', showMembers);
router.get('/info/:id', getMemberInfo);
router.put('/active/:id', toggleActive);
router.delete('/delete/:id', deleteMember);

module.exports = router;
