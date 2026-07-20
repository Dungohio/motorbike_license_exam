import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import cardPractice from '../assets/card-practice.png';
import cardExam from '../assets/card-exam.png';
import cardCritical from '../assets/card-critical.svg';
import cardHistory from '../assets/card-history.svg';

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

    </div>
  );
}
