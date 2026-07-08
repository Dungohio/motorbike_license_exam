const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const licenseClassRoutes = require('./routes/licenseClass.routes');
const categoryRoutes = require('./routes/category.routes');
const questionRoutes = require('./routes/question.routes');
const practiceRoutes = require('./routes/practice.routes');
const examRoutes = require('./routes/exam.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middleware chung
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// Endpoint kiểm tra nhanh server sống hay không
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API đang hoạt động' });
});

// Gắn các nhóm route
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/license-classes', licenseClassRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/exams', examRoutes);

// Xử lý route không tồn tại và lỗi tập trung
app.use(notFound);
app.use(errorHandler);

module.exports = app;
