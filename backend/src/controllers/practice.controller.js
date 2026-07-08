const Question = require('../models/Question');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/practice?licenseClass=&category=
// Chế độ ôn tập: trả câu hỏi KÈM đáp án đúng + giải thích để người dùng học.
const getPracticeQuestions = asyncHandler(async (req, res) => {
  const { licenseClass, category } = req.query;
  if (!licenseClass) {
    return res.status(400).json({ message: 'Vui lòng chọn hạng bằng (licenseClass)' });
  }

  const filter = { licenseClass };
  if (category) filter.category = category;

  const questions = await Question.find(filter)
    .populate('category', 'name slug')
    .sort({ createdAt: 1 });

  res.json(questions);
});

module.exports = { getPracticeQuestions };
