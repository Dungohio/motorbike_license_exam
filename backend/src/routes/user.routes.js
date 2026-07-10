const express = require('express');
const {
  updateProfile,
  changePassword,
  uploadAvatarImage,
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(protect);

router.put('/me', updateProfile);
router.put('/me/password', changePassword);

// Bọc multer để trả lỗi upload (sai định dạng, quá dung lượng) dạng JSON 400
router.post('/me/avatar', (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadAvatarImage);

module.exports = router;
