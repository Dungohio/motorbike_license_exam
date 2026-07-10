const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { UPLOAD_DIR } = require('../middlewares/upload.middleware');

// PUT /api/users/me - sửa tên hiển thị và avatar
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const update = {};
  if (name !== undefined) {
    if (!name.trim()) return res.status(400).json({ message: 'Tên không được để trống' });
    update.name = name.trim();
  }
  if (avatar !== undefined) update.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });
  res.json({ user });
});

// PUT /api/users/me/password - đổi mật khẩu (xác nhận mật khẩu cũ trước)
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  // req.user không chứa passwordHash (đã bị loại ở middleware) nên phải query lại
  const user = await User.findById(req.user._id);
  if (!(await user.comparePassword(oldPassword))) {
    return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();
  res.json({ message: 'Đổi mật khẩu thành công' });
});

// POST /api/users/me/avatar - upload ảnh đại diện từ máy (form-data, field 'avatar')
const uploadAvatarImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn file ảnh (field: avatar)' });
  }

  // Xóa ảnh upload cũ (nếu có) để không rác ổ đĩa
  const current = req.user.avatar || '';
  if (current.startsWith('/uploads/')) {
    const oldPath = path.join(UPLOAD_DIR, path.basename(current));
    fs.promises.unlink(oldPath).catch(() => {});
  }

  const avatarUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  );
  res.json({ user });
});

module.exports = { updateProfile, changePassword, uploadAvatarImage };
