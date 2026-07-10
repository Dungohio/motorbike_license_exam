const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Thư mục lưu ảnh upload: backend/uploads (tự tạo nếu chưa có)
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Tên file: avatar-<userId>-<timestamp>.<đuôi gốc>
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  },
});

// Chỉ nhận file ảnh, tối đa 2MB
const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)'));
  },
}).single('avatar');

module.exports = { uploadAvatar, UPLOAD_DIR };
