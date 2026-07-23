const Question = require('../models/Question');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/questions (admin) - có lọc theo hạng/chủ đề và phân trang
const getQuestions = asyncHandler(async (req, res) => {
  const { licenseClass, category, inExam, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (licenseClass) filter.licenseClass = licenseClass;
  if (category) filter.category = category;
  // Lọc theo trạng thái dùng trong đề thi.
  // Câu cũ chưa có field inExam được coi là đang bật, nên dùng $ne: false.
  if (inExam === 'true') filter.inExam = { $ne: false };
  else if (inExam === 'false') filter.inExam = false;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Question.find(filter)
      .populate('licenseClass', 'code name')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Question.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// GET /api/questions/:id (admin)
const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)
    .populate('licenseClass', 'code name')
    .populate('category', 'name slug');
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  res.json(question);
});

// POST /api/questions (admin)
const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create(req.body);
  res.status(201).json(question);
});

// PUT /api/questions/:id (admin)
const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  res.json(question);
});

// DELETE /api/questions/:id (admin)
const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  res.json({ message: 'Đã xóa câu hỏi' });
});

// POST /api/questions/upload-image (admin) - upload ảnh minh họa câu hỏi
// (form-data, field 'image'), trả về URL để gắn vào imageUrl
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn file ảnh (field: image)' });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// PATCH /api/questions/bulk-in-exam (admin)
// body: { ids: [questionId], inExam: true|false }
// Bật/tắt hàng loạt việc dùng câu hỏi trong đề thi.
const bulkSetInExam = asyncHandler(async (req, res) => {
  const { ids, inExam } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Vui lòng chọn ít nhất một câu hỏi' });
  }
  if (typeof inExam !== 'boolean') {
    return res.status(400).json({ message: "Trường 'inExam' phải là true hoặc false" });
  }

  const result = await Question.updateMany({ _id: { $in: ids } }, { inExam });
  res.json({
    message: inExam
      ? `Đã bật dùng trong đề thi cho ${result.modifiedCount} câu hỏi`
      : `Đã tắt dùng trong đề thi cho ${result.modifiedCount} câu hỏi`,
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  });
});

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  uploadImage,
  bulkSetInExam,
};
