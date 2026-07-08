const mongoose = require('mongoose');
const Question = require('../models/Question');
const LicenseClass = require('../models/LicenseClass');
const ExamResult = require('../models/ExamResult');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/exams/generate  body: { licenseClass }
// Tạo đề thi gồm N câu ngẫu nhiên theo cấu hình của hạng bằng.
// KHÔNG trả correctIndex/explanation để tránh lộ đáp án.
const generateExam = asyncHandler(async (req, res) => {
  const { licenseClass } = req.body;
  if (!licenseClass) {
    return res.status(400).json({ message: 'Vui lòng chọn hạng bằng (licenseClass)' });
  }

  const lc = await LicenseClass.findById(licenseClass);
  if (!lc) return res.status(404).json({ message: 'Không tìm thấy hạng bằng' });

  const numQuestions = lc.examConfig.numQuestions;

  // Lấy ngẫu nhiên numQuestions câu thuộc hạng này
  const sampled = await Question.aggregate([
    { $match: { licenseClass: new mongoose.Types.ObjectId(licenseClass) } },
    { $sample: { size: numQuestions } },
    { $project: { correctIndex: 0, explanation: 0 } }, // ẩn đáp án
  ]);

  if (sampled.length === 0) {
    return res.status(400).json({ message: 'Hạng bằng này chưa có câu hỏi nào' });
  }

  res.json({
    licenseClass: { _id: lc._id, code: lc.code, name: lc.name },
    config: lc.examConfig,
    questions: sampled,
  });
});

// POST /api/exams/submit
// body: { licenseClass, answers: [{ question, selectedIndex }], startedAt, durationSeconds }
const submitExam = asyncHandler(async (req, res) => {
  const { licenseClass, answers, startedAt, durationSeconds } = req.body;

  if (!licenseClass || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: 'Dữ liệu bài thi không hợp lệ' });
  }

  const lc = await LicenseClass.findById(licenseClass);
  if (!lc) return res.status(404).json({ message: 'Không tìm thấy hạng bằng' });

  // Lấy đúng các câu hỏi user đã làm để chấm ở server
  const questionIds = answers.map((a) => a.question);
  const questions = await Question.find({ _id: { $in: questionIds } });
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  let score = 0;
  let failedByCritical = false;

  const detailedAnswers = answers.map((a) => {
    const q = questionMap.get(String(a.question));
    if (!q) return null; // bỏ qua câu không tồn tại

    const selectedIndex =
      a.selectedIndex === undefined || a.selectedIndex === null ? null : a.selectedIndex;
    const isCorrect = selectedIndex === q.correctIndex;

    if (isCorrect) score += 1;
    else if (q.isCritical) failedByCritical = true; // sai câu điểm liệt -> trượt

    return {
      question: q._id,
      content: q.content,
      options: q.options,
      selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect,
      isCritical: q.isCritical,
      explanation: q.explanation,
    };
  }).filter(Boolean);

  const total = detailedAnswers.length;
  const passed = score >= lc.examConfig.passScore && !failedByCritical;

  const result = await ExamResult.create({
    user: req.user._id,
    licenseClass: lc._id,
    answers: detailedAnswers,
    score,
    total,
    passed,
    failedByCritical,
    durationSeconds: durationSeconds || 0,
    startedAt: startedAt || null,
    submittedAt: new Date(),
  });

  res.status(201).json(result);
});

// GET /api/exams/history - lịch sử thi của chính user
const getHistory = asyncHandler(async (req, res) => {
  const results = await ExamResult.find({ user: req.user._id })
    .populate('licenseClass', 'code name')
    .select('-answers') // danh sách gọn, không cần chi tiết từng câu
    .sort({ createdAt: -1 });
  res.json(results);
});

// GET /api/exams/history/:id - chi tiết một lần thi
const getHistoryDetail = asyncHandler(async (req, res) => {
  const result = await ExamResult.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'licenseClass',
    'code name examConfig'
  );
  if (!result) return res.status(404).json({ message: 'Không tìm thấy lần thi' });
  res.json(result);
});

module.exports = { generateExam, submitExam, getHistory, getHistoryDetail };
