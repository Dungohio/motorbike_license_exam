const express = require('express');
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/question.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

const router = express.Router();

// Toàn bộ nhóm này chỉ dành cho admin
router.use(protect, adminOnly);

router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
