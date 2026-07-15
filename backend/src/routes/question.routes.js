const express = require('express');
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  uploadImage,
} = require('../controllers/question.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');
const { uploadQuestionImage } = require('../middlewares/upload.middleware');

const router = express.Router();

// Toàn bộ nhóm này chỉ dành cho admin
router.use(protect, adminOnly);

// Bọc multer để trả lỗi upload (sai định dạng, quá dung lượng) dạng JSON 400
router.post('/upload-image', (req, res, next) => {
  uploadQuestionImage(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadImage);

router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
