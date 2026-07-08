// Dữ liệu mẫu tham khảo bộ đề thi lý thuyết bằng lái xe máy tại Việt Nam.
// Dùng cho script seed để demo web chạy được ngay.

const licenseClasses = [
  {
    code: 'A1',
    name: 'Hạng A1 - Xe mô tô hai bánh 50cc đến dưới 175cc',
    description: 'Dành cho xe mô tô hai bánh có dung tích xi-lanh từ 50cc đến dưới 175cc.',
    examConfig: { numQuestions: 25, durationMinutes: 19, passScore: 21 },
  },
  {
    code: 'A2',
    name: 'Hạng A2 - Xe mô tô hai bánh từ 175cc trở lên',
    description: 'Dành cho xe mô tô hai bánh có dung tích xi-lanh từ 175cc trở lên.',
    examConfig: { numQuestions: 25, durationMinutes: 19, passScore: 23 },
  },
  {
    code: 'A3',
    name: 'Hạng A3 - Xe mô tô ba bánh',
    description: 'Dành cho xe mô tô ba bánh và các loại xe hạng A1.',
    examConfig: { numQuestions: 25, durationMinutes: 19, passScore: 21 },
  },
];

const categories = [
  { name: 'Khái niệm và quy tắc', description: 'Khái niệm, quy tắc giao thông đường bộ.' },
  { name: 'Biển báo giao thông', description: 'Nhận biết ý nghĩa các biển báo hiệu đường bộ.' },
  { name: 'Sa hình', description: 'Xử lý tình huống qua các bài sa hình.' },
  { name: 'Đạo đức và văn hóa giao thông', description: 'Đạo đức người lái xe, văn hóa giao thông.' },
];

// Mỗi câu tham chiếu category theo tên và licenseClass theo code.
// correctIndex là chỉ số (bắt đầu từ 0) của đáp án đúng trong options.
const questions = [
  {
    classCode: 'A1',
    categoryName: 'Khái niệm và quy tắc',
    content: '“Phương tiện giao thông cơ giới đường bộ” gồm những loại nào dưới đây?',
    options: [
      'Xe ô tô, máy kéo, xe mô tô hai bánh, xe mô tô ba bánh, xe gắn máy.',
      'Xe đạp, xe xích lô, xe lăn dùng cho người khuyết tật.',
      'Xe máy chuyên dùng.',
    ],
    correctIndex: 0,
    explanation: 'Phương tiện giao thông cơ giới đường bộ gồm ô tô, máy kéo, mô tô, xe gắn máy...',
    isCritical: false,
  },
  {
    classCode: 'A1',
    categoryName: 'Khái niệm và quy tắc',
    content: 'Khi điều khiển xe mô tô hai bánh, người lái xe có được sử dụng ô (dù), điện thoại di động không?',
    options: [
      'Được sử dụng nếu cần thiết.',
      'Không được sử dụng.',
      'Chỉ được sử dụng điện thoại di động.',
    ],
    correctIndex: 1,
    explanation: 'Người lái mô tô hai bánh không được sử dụng ô, điện thoại di động khi đang chạy xe.',
    isCritical: true,
  },
  {
    classCode: 'A1',
    categoryName: 'Khái niệm và quy tắc',
    content: 'Người lái xe mô tô, xe gắn máy có nồng độ cồn trong máu hoặc hơi thở thì bị xử lý thế nào?',
    options: [
      'Được phép điều khiển xe nếu nồng độ cồn thấp.',
      'Bị nghiêm cấm điều khiển xe.',
      'Chỉ bị nhắc nhở.',
    ],
    correctIndex: 1,
    explanation: 'Luật nghiêm cấm điều khiển xe khi trong máu hoặc hơi thở có nồng độ cồn.',
    isCritical: true,
  },
  {
    classCode: 'A1',
    categoryName: 'Khái niệm và quy tắc',
    content: 'Trên đường có nhiều làn đường, người lái xe mô tô phải đi như thế nào?',
    options: [
      'Đi bất kỳ làn nào tùy thích.',
      'Đi đúng làn đường quy định cho xe mô tô và theo tín hiệu, biển báo.',
      'Chỉ được đi làn ngoài cùng bên trái.',
    ],
    correctIndex: 1,
    explanation: 'Phải đi đúng làn đường, phần đường quy định và tuân thủ biển báo, vạch kẻ đường.',
    isCritical: false,
  },
  {
    classCode: 'A1',
    categoryName: 'Khái niệm và quy tắc',
    content: 'Khi muốn chuyển hướng, người lái xe phải làm gì để bảo đảm an toàn?',
    options: [
      'Giảm tốc độ và có tín hiệu báo hướng rẽ.',
      'Tăng tốc độ và chuyển hướng ngay.',
      'Chuyển hướng mà không cần báo hiệu.',
    ],
    correctIndex: 0,
    explanation: 'Trước khi chuyển hướng phải giảm tốc độ và bật tín hiệu báo hướng rẽ.',
    isCritical: true,
  },
  {
    classCode: 'A1',
    categoryName: 'Biển báo giao thông',
    content: 'Biển báo hình tròn, viền đỏ, nền trắng có ý nghĩa chung là gì?',
    options: [
      'Biển báo nguy hiểm.',
      'Biển báo cấm.',
      'Biển chỉ dẫn.',
    ],
    correctIndex: 1,
    explanation: 'Biển báo cấm thường có dạng hình tròn, viền đỏ, nền trắng, biểu thị điều cấm.',
    isCritical: false,
  },
  {
    classCode: 'A1',
    categoryName: 'Biển báo giao thông',
    content: 'Biển báo hình tam giác đều, viền đỏ, nền vàng có ý nghĩa gì?',
    options: [
      'Biển báo cấm.',
      'Biển báo nguy hiểm, cảnh báo.',
      'Biển hiệu lệnh.',
    ],
    correctIndex: 1,
    explanation: 'Biển báo nguy hiểm có dạng tam giác đều, viền đỏ, nền vàng để cảnh báo nguy hiểm phía trước.',
    isCritical: false,
  },
  {
    classCode: 'A1',
    categoryName: 'Biển báo giao thông',
    content: 'Biển báo hình tròn, nền xanh lam, hình vẽ màu trắng có ý nghĩa gì?',
    options: [
      'Biển báo cấm.',
      'Biển hiệu lệnh phải thi hành.',
      'Biển báo nguy hiểm.',
    ],
    correctIndex: 1,
    explanation: 'Biển hiệu lệnh có dạng hình tròn, nền xanh lam, thể hiện điều bắt buộc phải thi hành.',
    isCritical: false,
  },
  {
    classCode: 'A1',
    categoryName: 'Sa hình',
    content: 'Khi đến gần nơi đường giao nhau không có tín hiệu đèn, thứ tự nhường đường đúng là?',
    options: [
      'Xe nào tới trước đi trước, nhường đường cho xe đến từ bên phải khi cùng lúc.',
      'Xe lớn luôn được đi trước.',
      'Xe bên trái được đi trước.',
    ],
    correctIndex: 0,
    explanation: 'Tại nơi đường giao nhau cùng cấp, phải nhường đường cho xe đến từ bên phải.',
    isCritical: false,
  },
  {
    classCode: 'A1',
    categoryName: 'Sa hình',
    content: 'Xe nào phải nhường đường trong trường hợp có xe ưu tiên đang phát tín hiệu?',
    options: [
      'Tất cả các xe phải nhường đường cho xe ưu tiên.',
      'Chỉ xe cùng chiều mới phải nhường.',
      'Không xe nào phải nhường.',
    ],
    correctIndex: 0,
    explanation: 'Khi có xe ưu tiên đang phát tín hiệu, các xe khác phải nhường đường.',
    isCritical: true,
  },
  {
    classCode: 'A1',
    categoryName: 'Đạo đức và văn hóa giao thông',
    content: 'Người lái xe cần có thái độ như thế nào khi tham gia giao thông?',
    options: [
      'Nhường nhịn, giúp đỡ người khác, tuân thủ luật giao thông.',
      'Tranh giành đường để đi nhanh hơn.',
      'Chỉ quan tâm đến lợi ích của bản thân.',
    ],
    correctIndex: 0,
    explanation: 'Người lái xe cần có văn hóa giao thông: nhường nhịn, giúp đỡ và tuân thủ luật.',
    isCritical: false,
  },
  {
    classCode: 'A1',
    categoryName: 'Đạo đức và văn hóa giao thông',
    content: 'Khi gặp người đi bộ qua đường tại nơi có vạch kẻ đường dành cho người đi bộ, người lái xe phải làm gì?',
    options: [
      'Nhấn còi để người đi bộ tránh.',
      'Giảm tốc độ và nhường đường cho người đi bộ.',
      'Tăng tốc vượt qua nhanh.',
    ],
    correctIndex: 1,
    explanation: 'Phải giảm tốc độ, nhường đường cho người đi bộ tại nơi có vạch kẻ đường dành cho họ.',
    isCritical: true,
  },
  {
    classCode: 'A2',
    categoryName: 'Khái niệm và quy tắc',
    content: 'Người đủ bao nhiêu tuổi trở lên được cấp giấy phép lái xe hạng A2?',
    options: ['16 tuổi', '18 tuổi', '21 tuổi'],
    correctIndex: 1,
    explanation: 'Người đủ 18 tuổi trở lên được cấp giấy phép lái xe hạng A2.',
    isCritical: false,
  },
  {
    classCode: 'A2',
    categoryName: 'Biển báo giao thông',
    content: 'Biển báo cấm đi ngược chiều có đặc điểm nào?',
    options: [
      'Hình tròn nền đỏ, có vạch trắng nằm ngang ở giữa.',
      'Hình tam giác nền vàng.',
      'Hình vuông nền xanh.',
    ],
    correctIndex: 0,
    explanation: 'Biển cấm đi ngược chiều là hình tròn nền đỏ, ở giữa có một vạch trắng nằm ngang.',
    isCritical: false,
  },
  {
    classCode: 'A3',
    categoryName: 'Khái niệm và quy tắc',
    content: 'Giấy phép lái xe hạng A3 cho phép điều khiển loại xe nào?',
    options: [
      'Xe mô tô ba bánh và các loại xe của hạng A1.',
      'Chỉ xe ô tô con.',
      'Chỉ xe tải.',
    ],
    correctIndex: 0,
    explanation: 'Hạng A3 cấp cho người lái xe mô tô ba bánh và các xe thuộc hạng A1.',
    isCritical: false,
  },
];

module.exports = { licenseClasses, categories, questions };
