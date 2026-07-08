# Web Ôn Thi Lý Thuyết Bằng Lái Xe Máy

Dự án môn **SDN302** — website ôn luyện và thi thử lý thuyết bằng lái xe máy (hạng A1, A2, A3),
gồm hai vai trò **User** và **Admin**.

- **Backend:** Node.js + Express + Mongoose (MongoDB), xác thực JWT.
- **Frontend:** React (Vite) + React-Bootstrap, tông màu trắng – xanh nước biển.
- **Kiểm thử API:** Postman (có sẵn collection + environment trong thư mục `postman/`).

## Tính năng

**User**
- Đăng ký / đăng nhập.
- Ôn tập theo chủ đề: xem câu hỏi kèm đáp án đúng và giải thích.
- Thi thử: đề ngẫu nhiên theo hạng bằng, có đếm giờ, chấm điểm tự động.
- Xem kết quả và lịch sử các lần thi của mình.

**Admin**
- Thêm / sửa / xóa câu hỏi (lọc theo hạng bằng, chủ đề, phân trang).
- Quản lý chủ đề câu hỏi.
- Bảng điều khiển thống kê nhanh.

## Cấu trúc thư mục

```
Project_SDN302/
├── backend/     # API Express + Mongoose
│   └── src/
│       ├── config/       # kết nối MongoDB
│       ├── models/       # User, LicenseClass, Category, Question, ExamResult
│       ├── controllers/  # xử lý logic
│       ├── routes/       # định nghĩa endpoint
│       ├── middlewares/  # xác thực JWT, phân quyền, xử lý lỗi
│       └── seed/         # tạo dữ liệu mẫu
├── frontend/    # React (Vite) + React-Bootstrap
│   └── src/
│       ├── api/          # axios instance
│       ├── context/      # AuthContext
│       ├── components/   # Navbar, ProtectedRoute, ResultDetail...
│       └── pages/        # trang user & admin
├── postman/     # collection + environment để test API
└── README.md
```

## Yêu cầu môi trường

- Node.js 18+
- MongoDB đang chạy (local `mongodb://127.0.0.1:27017` hoặc MongoDB Atlas)

## Cài đặt & chạy

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
# Sửa MONGODB_URI, JWT_SECRET trong .env nếu cần

npm run seed              # tạo admin, hạng bằng, chủ đề và câu hỏi mẫu
npm run dev               # chạy server tại http://localhost:5000
```

Tài khoản tạo sẵn sau khi seed:

| Vai trò | Email               | Mật khẩu |
|---------|---------------------|----------|
| Admin   | admin@example.com   | admin123 |
| User    | user@example.com    | user123  |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # chạy tại http://localhost:5173
```

Frontend đã cấu hình proxy `/api` sang backend nên không cần chỉnh CORS khi phát triển.

## Kiểm thử API bằng Postman

1. Mở Postman → **Import** hai file trong thư mục `postman/`:
   - `MotorbikeLicenseExam.postman_collection.json`
   - `MotorbikeLicenseExam.postman_environment.json`
2. Chọn environment **Motorbike License Exam - Local**.
3. Gọi request **Auth → Login (Admin)** hoặc **Login (User)** — token sẽ tự lưu vào biến `{{token}}`.
4. Các request khác dùng token này để gọi các API cần đăng nhập / quyền admin.

## Danh sách API

| Method | Endpoint                     | Quyền  | Mô tả                                  |
|--------|------------------------------|--------|----------------------------------------|
| POST   | `/api/auth/register`         | -      | Đăng ký                                |
| POST   | `/api/auth/login`            | -      | Đăng nhập, trả JWT                     |
| GET    | `/api/auth/me`               | User   | Thông tin user hiện tại                |
| GET    | `/api/license-classes`       | -      | Danh sách hạng bằng                    |
| GET    | `/api/categories`            | -      | Danh sách chủ đề                       |
| POST   | `/api/categories`            | Admin  | Thêm chủ đề                            |
| PUT    | `/api/categories/:id`        | Admin  | Sửa chủ đề                             |
| DELETE | `/api/categories/:id`        | Admin  | Xóa chủ đề                             |
| GET    | `/api/questions`             | Admin  | Danh sách câu hỏi (lọc + phân trang)   |
| GET    | `/api/questions/:id`         | Admin  | Chi tiết câu hỏi                       |
| POST   | `/api/questions`             | Admin  | Thêm câu hỏi                           |
| PUT    | `/api/questions/:id`         | Admin  | Sửa câu hỏi                            |
| DELETE | `/api/questions/:id`         | Admin  | Xóa câu hỏi                            |
| GET    | `/api/practice`              | User   | Câu hỏi ôn tập (kèm đáp án)            |
| POST   | `/api/exams/generate`        | User   | Tạo đề thi ngẫu nhiên (ẩn đáp án)      |
| POST   | `/api/exams/submit`          | User   | Nộp bài, chấm điểm, lưu lịch sử        |
| GET    | `/api/exams/history`         | User   | Lịch sử thi của mình                   |
| GET    | `/api/exams/history/:id`     | User   | Chi tiết một lần thi                   |

## Ghi chú học thuật

- Backend theo mô hình **Model – Controller – Route**, mỗi file một nhiệm vụ rõ ràng, dễ review.
- Việc **chấm điểm được thực hiện hoàn toàn ở server**; API tạo đề thi không trả đáp án đúng để tránh gian lận.
- Kết quả mỗi lần thi được lưu **snapshot** nội dung câu hỏi, nên vẫn xem lại chính xác dù câu hỏi gốc bị sửa/xóa.
- Câu hỏi mẫu được tham khảo theo bộ đề thi lý thuyết bằng lái xe máy tại Việt Nam.
