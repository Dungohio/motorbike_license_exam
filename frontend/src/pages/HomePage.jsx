import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/license-classes').then((res) => {
      setClasses(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h3 className="text-brand mb-1">Xin chào, {user?.name}!</h3>
      <p className="text-muted">Chọn hình thức học bên dưới để bắt đầu.</p>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>📚 Ôn tập theo chủ đề</Card.Title>
              <Card.Text>Luyện từng câu hỏi theo chủ đề, xem đáp án đúng và giải thích ngay.</Card.Text>
              <Button as={Link} to="/practice" variant="outline-primary">Vào ôn tập</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>📝 Thi thử</Card.Title>
              <Card.Text>Làm đề thi ngẫu nhiên có tính giờ, chấm điểm và lưu lịch sử.</Card.Text>
              <Button as={Link} to="/exam" variant="primary">Bắt đầu thi</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h5 className="text-brand">Các hạng bằng</h5>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Row className="g-3">
          {classes.map((c) => (
            <Col md={4} key={c._id}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Hạng {c.code}</Card.Title>
                  <Card.Text className="small text-muted">{c.description}</Card.Text>
                  <div className="small">
                    {c.examConfig.numQuestions} câu · {c.examConfig.durationMinutes} phút · đậu ≥{' '}
                    {c.examConfig.passScore}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
