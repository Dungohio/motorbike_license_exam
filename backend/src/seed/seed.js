// Script khởi tạo dữ liệu mẫu: chạy bằng `npm run seed`.
// Xóa dữ liệu cũ rồi tạo lại admin, hạng bằng, chủ đề và câu hỏi mẫu.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const LicenseClass = require('../models/LicenseClass');
const Category = require('../models/Category');
const Question = require('../models/Question');
const ExamResult = require('../models/ExamResult');

const { licenseClasses, categories, questions } = require('./seedData');

function toSlug(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seed() {
  await connectDB();

  // Xóa toàn bộ dữ liệu cũ để seed sạch
  await Promise.all([
    User.deleteMany({}),
    LicenseClass.deleteMany({}),
    Category.deleteMany({}),
    Question.deleteMany({}),
    ExamResult.deleteMany({}),
  ]);
  console.log('Đã xóa dữ liệu cũ');

  // Tạo tài khoản admin từ biến môi trường
  const adminPasswordHash = await User.hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
  await User.create({
    name: process.env.ADMIN_NAME || 'Administrator',
    email: (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
    passwordHash: adminPasswordHash,
    role: 'admin',
  });

  // Tạo một tài khoản user mẫu để test nhanh
  const userPasswordHash = await User.hashPassword('user123');
  await User.create({
    name: 'Người dùng mẫu',
    email: 'user@example.com',
    passwordHash: userPasswordHash,
    role: 'user',
  });
  console.log('Đã tạo tài khoản admin và user mẫu');

  // Tạo hạng bằng và chủ đề, lưu map để tra ObjectId theo code/tên
  const createdClasses = await LicenseClass.insertMany(licenseClasses);
  const classByCode = new Map(createdClasses.map((c) => [c.code, c._id]));

  const createdCategories = await Category.insertMany(
    categories.map((c) => ({ ...c, slug: toSlug(c.name) }))
  );
  const categoryByName = new Map(createdCategories.map((c) => [c.name, c._id]));
  console.log('Đã tạo hạng bằng và chủ đề');

  // Chuyển câu hỏi mẫu sang dạng có ObjectId tham chiếu
  const questionDocs = questions.map((q) => ({
    licenseClass: classByCode.get(q.classCode),
    category: categoryByName.get(q.categoryName),
    content: q.content,
    imageUrl: q.imageUrl || '',
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation || '',
    isCritical: q.isCritical || false,
  }));
  await Question.insertMany(questionDocs);
  console.log(`Đã tạo ${questionDocs.length} câu hỏi mẫu`);

  console.log('\n=== SEED HOÀN TẤT ===');
  console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@example.com'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  console.log('User : user@example.com / user123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed thất bại:', err);
  process.exit(1);
});
