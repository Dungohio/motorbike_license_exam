const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Thư mục lưu ảnh upload: backend/uploads (tự tạo nếu chưa có)
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Chỉ nhận file ảnh, tối đa 2MB — dùng chung cho avatar và ảnh câu hỏi
const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif, svg)'));
};

// Tạo middleware upload 1 ảnh với tiền tố tên file cho trước
function makeImageUploader(prefix, field) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const owner = req.user ? `-${req.user._id}` : '';
      cb(null, `${prefix}${owner}-${Date.now()}${ext}`);
    },
  });
  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: imageFileFilter,
  }).single(field);
}

const uploadAvatar = makeImageUploader('avatar', 'avatar');
const uploadQuestionImage = makeImageUploader('question', 'image');

module.exports = { uploadAvatar, uploadQuestionImage, UPLOAD_DIR };
