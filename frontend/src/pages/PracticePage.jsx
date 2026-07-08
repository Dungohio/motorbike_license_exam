import { useEffect, useState } from 'react';
import { Form, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function PracticePage() {
  const [searchParams] = useSearchParams();
  const criticalMode = searchParams.get('critical') === 'true'; // vào từ mục "Ôn câu điểm liệt"
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [licenseClass, setLicenseClass] = useState('');
  const [category, setCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({}); // {questionId: chosenIndex}
  const [loading, setLoading] = useState(false);

  // Tải danh sách hạng bằng và chủ đề khi mở trang
  useEffect(() => {
    api.get('/license-classes').then((res) => {
      setClasses(res.data);
      if (res.data[0]) setLicenseClass(res.data[0]._id);
    });
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const loadQuestions = async () => {
    if (!licenseClass) return;
    setLoading(true);
    setSelected({});
    const params = { licenseClass };
    if (category) params.category = category;
    if (criticalMode) params.critical = 'true';
    const res = await api.get('/practice', { params });
    setQuestions(res.data);
    setLoading(false);
  };

  const choose = (qId, idx) => setSelected({ ...selected, [qId]: idx });

  return (
    <div>
      <h3 className="text-brand mb-3">
        {criticalMode ? 'Ôn câu điểm liệt' : 'Ôn tập theo chủ đề'}
      </h3>
      {criticalMode && (
        <Alert variant="danger" className="py-2">
          ⚠️ Đây là các câu <strong>điểm liệt</strong> — sai một câu khi thi thật là trượt.
          Hãy luyện đến khi đúng tuyệt đối!
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label>Hạng bằng</Form.Label>
              <Form.Select value={licenseClass} onChange={(e) => setLicenseClass(e.target.value)}>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>Hạng {c.code}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Chủ đề</Form.Label>
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">-- Tất cả chủ đề --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Button variant="primary" onClick={loadQuestions}>Xem câu hỏi</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && <Spinner animation="border" />}

      {!loading && questions.map((q, i) => {
        const chosen = selected[q._id];
        const answered = chosen !== undefined;
        return (
          <Card key={q._id} className="shadow-sm mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <strong>Câu {i + 1}</strong>
                {q.isCritical && <Badge bg="danger">Điểm liệt</Badge>}
              </div>
              <p className="mt-2">{q.content}</p>
              {q.imageUrl && (
                <img src={q.imageUrl} alt="minh họa" className="img-fluid mb-2" style={{ maxHeight: 180 }} />
              )}
              <div className="d-grid gap-2">
                {q.options.map((opt, idx) => {
                  let cls = '';
                  if (answered && idx === q.correctIndex) cls = 'option-correct';
                  else if (answered && idx === chosen) cls = 'option-wrong';
                  return (
                    <Button
                      key={idx}
                      variant="outline-secondary"
                      className={`text-start ${cls}`}
                      onClick={() => choose(q._id, idx)}
                      disabled={answered}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </Button>
                  );
                })}
              </div>
              {answered && q.explanation && (
                <div className="alert alert-info mt-3 mb-0">
                  <strong>Giải thích:</strong> {q.explanation}
                </div>
              )}
            </Card.Body>
          </Card>
        );
      })}

      {!loading && questions.length === 0 && (
        <p className="text-muted">Chọn hạng bằng và bấm “Xem câu hỏi” để bắt đầu ôn tập.</p>
      )}
    </div>
  );
}
