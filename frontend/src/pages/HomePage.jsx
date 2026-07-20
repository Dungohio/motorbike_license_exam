import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Table, Accordion, Badge } from 'react-bootstrap';
import { ExclamationTriangleFill, LightbulbFill } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import cardPractice from '../assets/card-practice.png';
import cardExam from '../assets/card-exam.png';
import cardCritical from '../assets/card-critical.svg';
import cardHistory from '../assets/card-history.svg';

const TIPS = [
  {
    title: 'Nắm chắc câu điểm liệt trước tiên',
    body: 'Chỉ cần sai 1 câu điểm liệt là trượt dù tổng điểm đủ. Hãy vào mục"Ôn câu điểm liệt" và luyện đến khi đúng 100% trước khi thi thử.',
  },
  {
    title: 'Học theo chủ đề, không học tràn lan',
    body: 'Chia nhỏ theo chủ đề: khái niệm & quy tắc → biển báo → sa hình → đạo đức. Nắm chắc từng phần rồi mới chuyển phần tiếp theo.',
  },
  {
    title: 'Mẹo với câu biển báo',
    body: 'Biển tròn đỏ là CẤM, tam giác vàng là NGUY HIỂM, tròn xanh là HIỆU LỆNH, vuông/chữ nhật xanh là CHỈ DẪN. Nhớ 4 nhóm này là xử lý được đa số câu biển báo.',
  },
  {
    title: 'Phân bố thời gian khi thi',
    body: 'Trung bình mỗi câu chỉ có ~45 giây. Câu nào chắc chắn làm ngay, câu phân vân đánh dấu bỏ qua rồi quay lại sau, tránh sa lầy một câu quá lâu.',
  },
  {
    title: 'Thi thử nhiều lần trước ngày thi thật',
    body: 'Hãy thi thử đến khi ĐẬU liên tục 5 lần liền. Xem lại kỹ các câu sai trong phần lịch sử thi để không lặp lại lỗi cũ.',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/license-classes').then((res) => setClasses(res.data));
    api.get('/exams/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const features = [
    {
      img: cardPractice,
      title: 'Ôn tập theo chủ đề',
      desc: 'Luyện từng câu theo chủ đề, xem ngay đáp án đúng kèm giải thích chi tiết.',
      to: '/practice',
      btn: 'Vào ôn tập',
      variant: 'outline-primary',
    },
    {
      img: cardExam,
      title: 'Thi thử như thật',
      desc: 'Đề ngẫu nhiên đúng cấu trúc từng hạng, có đếm giờ và chấm điểm tự động.',
      to: '/exam',
      btn: 'Bắt đầu thi',
      variant: 'primary',
    },
    {
      img: cardCritical,
      title: 'Ôn câu điểm liệt',
      desc: 'Tuyển tập câu điểm liệt — trả lời sai một câu là không đạt bài thi.',
      to: '/practice?critical=true',
      btn: 'Luyện ngay',
      variant: 'outline-danger',
    },
    {
      img: cardHistory,
      title: 'Lịch sử & thống kê',
      desc: stats
        ? `Bạn đã thi ${stats.attempts} lần · tỉ lệ đậu ${stats.passRate}% · điểm TB ${stats.avgScorePercent}%.`
        : 'Xem lại toàn bộ các lần thi và tiến bộ của bạn theo thời gian.',
      to: '/history',
      btn: 'Xem lịch sử',
      variant: 'outline-success',
    },
  ];

  return (
    <div>
      {/* ===== Hero banner ===== */}
      <div className="hero-banner overflow-hidden mb-5">
        <div className="hero-overlay">
          <h1 className="hero-title">Tự tin thi đậu lý thuyết<br />bằng lái xe máy</h1>
          <p className="hero-subtitle">
            Ôn luyện theo bộ đề chuẩn Việt Nam · Xin chào, {user?.name}
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <Button as={Link} to="/exam" size="lg" variant="light" className="fw-bold text-brand">
              Thi thử ngay
            </Button>
            <Button as={Link} to="/practice" size="lg" variant="outline-light">
              Ôn tập
            </Button>
          </div>
        </div>
      </div>

      {/* ===== 4 mục chức năng ===== */}
      <h4 className="text-brand fw-bold mb-3">Bạn muốn học gì hôm nay?</h4>
      <Row className="g-4 mb-5">
        {features.map((f) => (
          <Col md={6} lg={3} key={f.title}>
            <Card className="h-100 feature-card">
              <Card.Img variant="top" src={f.img} alt={f.title} className="feature-img" />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-6 fw-bold">{f.title}</Card.Title>
                <Card.Text className="small text-muted flex-grow-1">{f.desc}</Card.Text>
                <Button as={Link} to={f.to} variant={f.variant} size="sm">
                  {f.btn}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== Các hạng bằng ===== */}
      <h4 className="text-brand fw-bold mb-3">Chọn hạng bằng của bạn</h4>
      <Row className="g-3 mb-5">
        {classes.map((c) => (
          <Col md={4} key={c._id}>
            <Card className="h-100 license-card">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <div className="license-badge me-3">{c.code}</div>
                  <div className="small text-muted">{c.description}</div>
                </div>
                <div className="small mb-3">
                  <Badge bg="light" text="dark" className="me-1">{c.examConfig.numQuestions} câu</Badge>
                  <Badge bg="light" text="dark" className="me-1">{c.examConfig.durationMinutes} phút</Badge>
                  <Badge bg="light" text="dark">Đậu ≥ {c.examConfig.passScore}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/exam', { state: { licenseClass: c._id } })}
                >
                  Thi hạng {c.code}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== Mẹo thi & quy định ===== */}
      <h4 className="text-brand fw-bold mb-3">Quy định & mẹo thi</h4>
      <Row className="g-4">
        <Col lg={5}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white fw-bold">
              Cấu trúc đề thi từng hạng
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0 align-middle" hover>
                <thead>
                  <tr className="table-light">
                    <th>Hạng</th>
                    <th>Số câu</th>
                    <th>Thời gian</th>
                    <th>Điểm đậu</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => (
                    <tr key={c._id}>
                      <td className="fw-bold text-brand">{c.code}</td>
                      <td>{c.examConfig.numQuestions} câu</td>
                      <td>{c.examConfig.durationMinutes} phút</td>
                      <td>≥ {c.examConfig.passScore}/{c.examConfig.numQuestions}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="p-3 small text-muted">
                <ExclamationTriangleFill className="text-danger me-1" />
                Với mọi hạng: trả lời sai <strong>câu điểm liệt</strong> sẽ bị trượt
                dù tổng điểm vẫn đạt yêu cầu.
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Accordion defaultActiveKey="0">
            {TIPS.map((tip, i) => (
              <Accordion.Item eventKey={String(i)} key={i}>
                <Accordion.Header>
                  <LightbulbFill className="text-warning me-2" />{tip.title}
                </Accordion.Header>
                <Accordion.Body className="small">{tip.body}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
    </div>
  );
}
