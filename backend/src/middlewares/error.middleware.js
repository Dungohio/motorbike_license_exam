// Route không khớp -> trả 404
function notFound(req, res, next) {
  res.status(404).json({ message: `Không tìm thấy đường dẫn: ${req.originalUrl}` });
}

// Xử lý lỗi tập trung cho toàn app
function errorHandler(err, req, res, next) {
  console.error(err);

  // Lỗi id không hợp lệ của Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Id không hợp lệ' });
  }
  // Lỗi validate của Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  // Trùng khóa duy nhất (ví dụ email đã tồn tại)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `Giá trị '${field}' đã tồn tại` });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Lỗi máy chủ' });
}

module.exports = { notFound, errorHandler };
