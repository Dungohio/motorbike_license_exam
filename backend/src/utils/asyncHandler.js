// Bọc controller async để tự động chuyển lỗi sang errorHandler,
// tránh phải viết try/catch lặp lại ở mọi controller.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
