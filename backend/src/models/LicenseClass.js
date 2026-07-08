const mongoose = require('mongoose');

// Hạng bằng lái xe máy (A1, A2, A3...). Mỗi hạng có cấu hình đề thi riêng.
const licenseClassSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    examConfig: {
      numQuestions: { type: Number, required: true, default: 25 }, // số câu mỗi đề
      durationMinutes: { type: Number, required: true, default: 19 }, // thời gian làm bài
      passScore: { type: Number, required: true, default: 21 }, // số câu đúng tối thiểu để đậu
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LicenseClass', licenseClassSchema);
