const express = require('express');
const {
  updateProfile,
  changePassword,
  uploadAvatarImage,
  getUsers,
  changeRole,
  toggleLock,
  deleteUser,
} = require('../controllers/user.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(protect);

/* ----- Hồ sơ của chính mình ----- */
router.put('/me', updateProfile);
router.put('/me/password', changePassword);

// Bọc multer để trả lỗi upload (sai định dạng, quá dung lượng) dạng JSON 400
router.post('/me/avatar', (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadAvatarImage);

/* ----- Quản lý tài khoản (admin) ----- */
router.get('/', adminOnly, getUsers);
router.put('/:id/role', adminOnly, changeRole);
router.put('/:id/lock', adminOnly, toggleLock);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
