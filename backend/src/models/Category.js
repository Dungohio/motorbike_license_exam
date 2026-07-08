const mongoose = require('mongoose');

// Chủ đề câu hỏi: Khái niệm & quy tắc, Biển báo, Sa hình, Đạo đức lái xe...
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Vui lòng nhập tên chủ đề'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
