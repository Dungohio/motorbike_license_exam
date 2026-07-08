const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    licenseClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LicenseClass',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    content: { type: String, required: [true, 'Vui lòng nhập nội dung câu hỏi'], trim: true },
    imageUrl: { type: String, default: '' }, // ảnh biển báo / sa hình (không bắt buộc)
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: 'Câu hỏi phải có ít nhất 2 đáp án',
      },
    },
    correctIndex: {
      type: Number,
      required: true,
      validate: {
        // đáp án đúng phải nằm trong khoảng chỉ số của options
        validator: function (v) {
          return v >= 0 && v < this.options.length;
        },
        message: 'Chỉ số đáp án đúng không hợp lệ',
      },
    },
    explanation: { type: String, default: '' }, // giải thích đáp án
    isCritical: { type: Boolean, default: false }, // câu điểm liệt (sai là trượt)
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
