const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    licenseClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LicenseClass",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Vui lòng nhập nội dung câu hỏi"],
      trim: true,
    },
    imageUrl: { type: String, default: "" },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: "Câu hỏi phải có ít nhất 2 đáp án",
      },
    },
    correctIndex: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 0 && v < this.options.length;
        },
        message: "Chỉ số đáp án đúng không hợp lệ",
      },
    },
    explanation: { type: String, default: "" },
    isCritical: { type: Boolean, default: false }, // câu điểm liệt (sai là trượt)
    // Admin bật/tắt câu này có được đưa vào đề thi hay không.
    // Tắt thì vẫn dùng để ôn tập, chỉ không xuất hiện trong bài thi.
    inExam: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Question", questionSchema);
