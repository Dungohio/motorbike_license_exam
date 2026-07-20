const mongoose = require("mongoose");

// Chi tiết một câu trong lần thi. Lưu snapshot nội dung để xem lại được
// dù câu hỏi gốc sau này bị sửa hoặc xóa.
const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    content: String,
    options: [String],
    selectedIndex: { type: Number, default: null },
    correctIndex: Number,
    isCorrect: Boolean,
    isCritical: Boolean,
    explanation: String,
  },
  { _id: false },
);

const examResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    licenseClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LicenseClass",
      required: true,
    },
    answers: [answerSchema],
    score: { type: Number, required: true }, // số câu đúng
    total: { type: Number, required: true }, // tổng số câu
    passed: { type: Boolean, required: true },
    failedByCritical: { type: Boolean, default: false }, // trượt do sai câu điểm liệt
    durationSeconds: { type: Number, default: 0 }, // thời gian đã làm
    startedAt: Date,
    submittedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("ExamResult", examResultSchema);
