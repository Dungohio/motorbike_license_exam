const mongoose = require('mongoose');
const Question = require('../models/Question');
const LicenseClass = require('../models/LicenseClass');
const ExamResult = require('../models/ExamResult');
const asyncHandler = require('../utils/asyncHandler');

const MAX_DURATION_MINUTES = 180;

// Tính số câu đúng tối thiểu để đạt khi người dùng tự chọn số câu.
// Giữ nguyên tỉ lệ chuẩn của hạng bằng, ví dụ A1: 21/25 = 84%
// -> thi 10 câu thì cần đúng ceil(10 * 0.84) = 9 câu.
function computePassScore(examConfig, total) {
  const ratio = examConfig.passScore / examConfig.numQuestions;
  return Math.min(Math.max(Math.ceil(total * ratio), 1), total);
}

// POST /api/exams/generate  body: { licenseClass, numQuestions?, durationMinutes? }
// Tạo đề thi ngẫu nhiên; người dùng có thể tự chọn số câu và thời gian,
// không truyền thì dùng cấu hình mặc định của hạng bằng.
// KHÔNG trả correctIndex/explanation để tránh lộ đáp án.
const generateExam = asyncHandler(async (req, res) => {
  const { licenseClass, numQuestions, durationMinutes } = req.body;
  if (!licenseClass) {
    return res.status(400).json({ message: 'Vui lòng chọn hạng bằng (licenseClass)' });
  }

  const lc = await LicenseClass.findById(licenseClass);
  if (!lc) return res.status(404).json({ message: 'Không tìm thấy hạng bằng' });

  // Số câu hiện có của hạng này, dùng làm giới hạn trên
  const available = await Question.countDocuments({ licenseClass });
  if (available === 0) {
    return res.status(400).json({ message: 'Hạng bằng này chưa có câu hỏi nào' });
  }

  // Số câu: mặc định theo hạng, không vượt quá số câu đang có
  let count = numQuestions === undefined ? lc.examConfig.numQuestions : Number(numQuestions);
  if (!Number.isInteger(count) || count < 1) {
    return res.status(400).json({ message: 'Số câu hỏi phải là số nguyên lớn hơn 0' });
  }
  if (count > available) {
    return res.status(400).json({
      message: `Hạng ${lc.code} hiện chỉ có ${available} câu hỏi, không thể tạo đề ${count} câu`,
    });
  }

  // Thời gian làm bài: mặc định theo hạng
  const minutes =
    durationMinutes === undefined ? lc.examConfig.durationMinutes : Number(durationMinutes);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_DURATION_MINUTES) {
    return res.status(400).json({
      message: `Thời gian làm bài phải từ 1 đến ${MAX_DURATION_MINUTES} phút`,
    });
  }

  const sampled = await Question.aggregate([
    { $match: { licenseClass: new mongoose.Types.ObjectId(licenseClass) } },
    { $sample: { size: count } },
    { $project: { correctIndex: 0, explanation: 0 } }, // ẩn đáp án
  ]);

  res.json({
    licenseClass: { _id: lc._id, code: lc.code, name: lc.name },
    config: {
      numQuestions: sampled.length,
      durationMinutes: minutes,
      passScore: computePassScore(lc.examConfig, sampled.length),
    },
    defaultConfig: lc.examConfig, // cấu hình chuẩn của hạng, để client đối chiếu
    availableQuestions: available,
    questions: sampled,
  });
});

// POST /api/exams/submit
// body: { licenseClass, answers: [{ question, selectedIndex }], startedAt,
//         durationSeconds, durationMinutes }
const submitExam = asyncHandler(async (req, res) => {
  const { licenseClass, answers, startedAt, durationSeconds, durationMinutes } = req.body;

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
  // Server tự tính lại điểm đạt theo số câu thực tế, không tin giá trị client gửi
  const passScore = computePassScore(lc.examConfig, total);
  const passed = score >= passScore && !failedByCritical;

  const result = await ExamResult.create({
    user: req.user._id,
    licenseClass: lc._id,
    answers: detailedAnswers,
    score,
    total,
    passScore,
    passed,
    failedByCritical,
    durationMinutes: durationMinutes || undefined,
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

// GET /api/exams/stats - thống kê học tập của chính user
const getStats = asyncHandler(async (req, res) => {
  const results = await ExamResult.find({ user: req.user._id })
    .select('score total passed submittedAt createdAt')
    .sort({ createdAt: -1 });

  const attempts = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  // Điểm trung bình tính theo % số câu đúng để so sánh được giữa các hạng
  const avgScorePercent =
    attempts === 0
      ? 0
      : Math.round(
          (results.reduce((sum, r) => sum + r.score / r.total, 0) / attempts) * 100
        );

  res.json({
    attempts,
    passedCount,
    passRate: attempts === 0 ? 0 : Math.round((passedCount / attempts) * 100),
    avgScorePercent,
    lastExamAt: attempts === 0 ? null : results[0].submittedAt || results[0].createdAt,
  });
});

module.exports = { generateExam, submitExam, getHistory, getHistoryDetail, getStats };
