const express = require('express');
const {
  generateExam,
  submitExam,
  getHistory,
  getHistoryDetail,
  getStats,
} = require('../controllers/exam.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Toàn bộ chức năng thi đều yêu cầu đăng nhập
router.use(protect);

router.post('/generate', generateExam);
router.post('/submit', submitExam);
router.get('/stats', getStats);
router.get('/history', getHistory);
router.get('/history/:id', getHistoryDetail);

module.exports = router;
