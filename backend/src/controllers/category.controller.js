const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

// Tạo slug đơn giản từ tên (bỏ dấu tiếng Việt, thay khoảng trắng bằng gạch nối)
function toSlug(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // bỏ dấu thanh tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// POST /api/categories (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Vui lòng nhập tên chủ đề' });

  const category = await Category.create({ name, description, slug: toSlug(name) });
  res.status(201).json(category);
});

// PUT /api/categories/:id (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const update = {};
  if (name !== undefined) {
    update.name = name;
    update.slug = toSlug(name);
  }
  if (description !== undefined) update.description = description;

  const category = await Category.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!category) return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
  res.json(category);
});

// DELETE /api/categories/:id (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
  res.json({ message: 'Đã xóa chủ đề' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
