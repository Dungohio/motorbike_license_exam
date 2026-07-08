const express = require('express');
const { getPracticeQuestions } = require('../controllers/practice.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, getPracticeQuestions);

module.exports = router;
