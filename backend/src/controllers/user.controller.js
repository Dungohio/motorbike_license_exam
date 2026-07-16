const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const ExamResult = require('../models/ExamResult');
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
  // Cùng luật mật khẩu với đăng ký: ≥6 ký tự, có chữ hoa và ký tự đặc biệt
  if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/.test(newPassword)) {
    return res.status(400).json({
      message: 'Mật khẩu mới tối thiểu 6 ký tự, gồm ít nhất 1 chữ HOA và 1 ký tự đặc biệt (ví dụ @, #, !)',
    });
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

/* ================= Quản lý tài khoản (admin) ================= */

// GET /api/users?search=&page=&limit= (admin) - danh sách user + số lần thi
const getUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (search) {
    // Tìm theo tên hoặc email, không phân biệt hoa thường
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  // Đếm số lần thi của từng user trong trang hiện tại
  const counts = await ExamResult.aggregate([
    { $match: { user: { $in: users.map((u) => u._id) } } },
    { $group: { _id: '$user', attempts: { $sum: 1 } } },
  ]);
  const attemptsByUser = new Map(counts.map((c) => [String(c._id), c.attempts]));

  res.json({
    items: users.map((u) => ({
      ...u.toJSON(),
      examAttempts: attemptsByUser.get(String(u._id)) || 0,
    })),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// PUT /api/users/:id/role (admin) - đổi vai trò user<->admin
const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: "Vai trò phải là 'user' hoặc 'admin'" });
  }
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({ message: 'Không thể tự đổi vai trò của chính mình' });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
  res.json({ user });
});

// PUT /api/users/:id/lock (admin) - khóa / mở khóa tài khoản
const toggleLock = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({ message: 'Không thể tự khóa tài khoản của chính mình' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

  user.isLocked = !user.isLocked;
  await user.save();
  res.json({ user });
});

// DELETE /api/users/:id (admin) - xóa tài khoản + toàn bộ lịch sử thi
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({ message: 'Không thể tự xóa tài khoản của chính mình' });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

  // Dọn dữ liệu liên quan: lịch sử thi + ảnh avatar đã upload
  await ExamResult.deleteMany({ user: user._id });
  if ((user.avatar || '').startsWith('/uploads/')) {
    fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(user.avatar))).catch(() => {});
  }

  res.json({ message: 'Đã xóa tài khoản và lịch sử thi liên quan' });
});

module.exports = {
  updateProfile,
  changePassword,
  uploadAvatarImage,
  getUsers,
  changeRole,
  toggleLock,
  deleteUser,
};
