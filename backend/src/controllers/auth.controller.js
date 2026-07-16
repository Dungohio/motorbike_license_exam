const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Tạo JWT từ id user
function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mật khẩu: tối thiểu 6 ký tự, ít nhất 1 chữ hoa và 1 ký tự đặc biệt
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;
const PASSWORD_RULE =
  'Mật khẩu tối thiểu 6 ký tự, gồm ít nhất 1 chữ HOA và 1 ký tự đặc biệt (ví dụ @, #, !)';

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đủ tên, email và mật khẩu' });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ message: 'Họ tên phải có ít nhất 2 ký tự' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Email không đúng định dạng' });
  }
  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({ message: PASSWORD_RULE });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user);
  res.status(201).json({ user, token });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }
  if (user.isLocked) {
    return res.status(403).json({ message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' });
  }

  const token = signToken(user);
  res.json({ user, token });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, me };
