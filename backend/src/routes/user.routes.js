const express = require('express');
const { updateProfile, changePassword } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.put('/me', updateProfile);
router.put('/me/password', changePassword);

module.exports = router;
