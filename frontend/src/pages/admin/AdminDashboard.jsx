import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { ListCheck, Tags, CardChecklist, PlusLg, Speedometer2, People } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Lấy số liệu nhanh từ các endpoint sẵn có
    Promise.all([
      api.get('/questions', { params: { limit: 1 } }),
      api.get('/categories'),
      api.get('/license-classes'),
      api.get('/users', { params: { limit: 1 } }),
    ]).then(([q, c, l, u]) => {
      setStats({
        questions: q.data.total,
        categories: c.data.length,
        classes: l.data.length,
        users: u.data.total,
      });
    });
  }, []);

  if (!stats) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  const cards = [
    { label: 'Câu hỏi', value: stats.questions, icon: ListCheck, to: '/admin/questions', color: '#0d6efd' },
    { label: 'Chủ đề', value: stats.categories, icon: Tags, to: '/admin/categories', color: '#2a9d8f' },
    { label: 'Hạng bằng', value: stats.classes, icon: CardChecklist, to: '/admin/questions', color: '#f4a261' },
    { label: 'Tài khoản', value: stats.users, icon: People, to: '/admin/users', color: '#6f42c1' },
  ];

  return (
    <div>
      <h3 className="text-brand fw-bold mb-4">
        <Speedometer2 className="me-2" />Tổng quan quản trị
      </h3>

      <Row className="g-3 mb-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Col md={6} lg={3} key={c.label}>
              <Card as={Link} to={c.to} className="shadow-sm border-0 text-decoration-none h-100 feature-card">
                <Card.Body className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 56, height: 56, background: `${c.color}1a`, color: c.color }}
                  >
                    <Icon size={26} />
                  </div>
                  <div>
                    <div className="fs-3 fw-bold text-dark">{c.value}</div>
                    <div className="text-muted small">{c.label}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <div className="d-flex gap-2 flex-wrap">
        <Button as={Link} to="/admin/questions/new" variant="primary">
          <PlusLg className="me-2" />Thêm câu hỏi mới
        </Button>
        <Button as={Link} to="/admin/questions" variant="outline-primary">
          <ListCheck className="me-2" />Quản lý câu hỏi
        </Button>
        <Button as={Link} to="/admin/categories" variant="outline-primary">
          <Tags className="me-2" />Quản lý chủ đề
        </Button>
      </div>
    </div>
  );
}
