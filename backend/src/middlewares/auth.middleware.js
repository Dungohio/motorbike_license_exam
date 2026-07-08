const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kiểm tra JWT trong header Authorization: Bearer <token>
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Chưa đăng nhập (thiếu token)' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    req.user = user; // gắn user vào request để controller dùng
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

// Chỉ cho phép admin đi tiếp (dùng sau protect)
function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
}

module.exports = { protect, adminOnly };
