import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Lấy các số liệu nhanh từ các endpoint sẵn có
    Promise.all([
      api.get('/questions', { params: { limit: 1 } }),
      api.get('/categories'),
      api.get('/license-classes'),
    ]).then(([q, c, l]) => {
      setStats({
        questions: q.data.total,
        categories: c.data.length,
        classes: l.data.length,
      });
    });
  }, []);

  if (!stats) return <Spinner animation="border" />;

  const cards = [
    { label: 'Câu hỏi', value: stats.questions, to: '/admin/questions' },
    { label: 'Chủ đề', value: stats.categories, to: '/admin/categories' },
    { label: 'Hạng bằng', value: stats.classes, to: '/admin/questions' },
  ];

  return (
    <div>
      <h3 className="text-brand mb-3">Bảng điều khiển quản trị</h3>
      <Row className="g-3 mb-4">
        {cards.map((c) => (
          <Col md={4} key={c.label}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <div className="display-6 text-brand">{c.value}</div>
                <div className="text-muted">{c.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="d-flex gap-2">
        <Button as={Link} to="/admin/questions" variant="primary">Quản lý câu hỏi</Button>
        <Button as={Link} to="/admin/categories" variant="outline-primary">Quản lý chủ đề</Button>
      </div>
    </div>
  );
}
