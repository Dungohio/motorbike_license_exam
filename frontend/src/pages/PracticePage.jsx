import { useEffect, useState } from 'react';
import { Form, Row, Col, Card, Button, Spinner, Alert, Nav } from 'react-bootstrap';
import {
  UiChecksGrid,
  JournalText,
  ExclamationTriangleFill,
  Search,
} from 'react-bootstrap-icons';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import QuizMode from '../components/practice/QuizMode';
import DocumentMode from '../components/practice/DocumentMode';

const MODES = [
  { key: 'quiz', label: 'Trắc nghiệm', icon: UiChecksGrid },
  { key: 'document', label: 'Tài liệu', icon: JournalText },
];

export default function PracticePage() {
  const [searchParams] = useSearchParams();
  const criticalOnly = searchParams.get('critical') === 'true';

  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [licenseClass, setLicenseClass] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('quiz');
  const [questions, setQuestions] = useState(null); // null = chưa tải
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/license-classes').then((res) => {
      setClasses(res.data);
      if (res.data[0]) setLicenseClass(res.data[0]._id);
    });
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  // Đổi giữa "Ôn tập" và "Câu điểm liệt" trên sidebar thì tải lại từ đầu
  useEffect(() => {
    setQuestions(null);
  }, [criticalOnly]);

  const loadQuestions = async () => {
    if (!licenseClass) return;
    setLoading(true);
    const params = { licenseClass };
    if (category) params.category = category;
    if (criticalOnly) params.critical = 'true';
    const res = await api.get('/practice', { params });
    setQuestions(res.data);
    setLoading(false);
  };

  const ModeComponent = { quiz: QuizMode, document: DocumentMode }[mode];

  return (
    <div>
      <h3 className="text-brand fw-bold mb-3">
        {criticalOnly ? 'Ôn câu điểm liệt' : 'Ôn tập'}
      </h3>

      {criticalOnly && (
        <Alert variant="danger" className="py-2">
          <ExclamationTriangleFill className="me-2" />
          Theo quy định, trả lời sai một câu <strong>điểm liệt</strong> trong bài thi sẽ không đạt
          dù tổng điểm đủ yêu cầu.
        </Alert>
      )}

      {/* Bộ lọc + chọn chế độ */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="small fw-semibold">Hạng bằng</Form.Label>
              <Form.Select value={licenseClass} onChange={(e) => setLicenseClass(e.target.value)}>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>Hạng {c.code}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-semibold">Chủ đề</Form.Label>
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Tất cả chủ đề</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Button variant="primary" onClick={loadQuestions} disabled={loading}>
                <Search className="me-2" />
                {loading ? 'Đang tải...' : 'Bắt đầu ôn'}
              </Button>
            </Col>
          </Row>

          <Nav variant="pills" className="mt-3 gap-2" activeKey={mode} onSelect={(k) => setMode(k)}>
            {MODES.map((m) => {
              const Icon = m.icon;
              return (
                <Nav.Item key={m.key}>
                  <Nav.Link eventKey={m.key} className="d-flex align-items-center gap-2 py-1 px-3">
                    <Icon size={15} />{m.label}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
        </Card.Body>
      </Card>

      {loading && (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      )}

      {!loading && questions === null && (
        <div className="text-center text-muted py-5">
          <JournalText size={48} className="mb-3 opacity-50" />
          <p>Chọn hạng bằng, chủ đề và bấm <strong>Bắt đầu ôn</strong> để tải câu hỏi.</p>
        </div>
      )}

      {!loading && questions !== null && questions.length === 0 && (
        <Alert variant="warning">Không có câu hỏi nào khớp bộ lọc này.</Alert>
      )}

      {!loading && questions !== null && questions.length > 0 && (
        <ModeComponent questions={questions} key={`${mode}-${questions.length}`} />
      )}
    </div>
  );
}
