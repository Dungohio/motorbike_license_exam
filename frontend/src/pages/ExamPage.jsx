import { useEffect, useState, useCallback } from 'react';
import { Form, Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ExamPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [licenseClass, setLicenseClass] = useState('');

  const [exam, setExam] = useState(null); // { config, questions, licenseClass }
  const [answers, setAnswers] = useState({}); // {questionId: selectedIndex}
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/license-classes').then((res) => {
      setClasses(res.data);
      if (res.data[0]) setLicenseClass(res.data[0]._id);
    });
  }, []);

  const startExam = async () => {
    const res = await api.post('/exams/generate', { licenseClass });
    setExam(res.data);
    setAnswers({});
    setSecondsLeft(res.data.config.durationMinutes * 60);
    setStartedAt(new Date().toISOString());
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || submitting) return;
    setSubmitting(true);
    const durationSeconds = exam.config.durationMinutes * 60 - secondsLeft;
    const payload = {
      licenseClass: exam.licenseClass._id,
      startedAt,
      durationSeconds,
      answers: exam.questions.map((q) => ({
        question: q._id,
        selectedIndex: answers[q._id] ?? null,
      })),
    };
    const res = await api.post('/exams/submit', payload);
    navigate('/exam/result', { state: { result: res.data } });
  }, [exam, submitting, secondsLeft, startedAt, answers, navigate]);

  // Đồng hồ đếm ngược; hết giờ tự nộp bài
  useEffect(() => {
    if (!exam) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [exam, secondsLeft, handleSubmit]);

  const choose = (qId, idx) => setAnswers({ ...answers, [qId]: idx });

  const mmss = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Màn hình chọn hạng bằng trước khi thi
  if (!exam) {
    return (
      <div>
        <h3 className="text-brand mb-3">Thi thử</h3>
        <Card className="shadow-sm" style={{ maxWidth: 480 }}>
          <Card.Body>
            <Form.Label>Chọn hạng bằng muốn thi</Form.Label>
            <Form.Select
              value={licenseClass}
              onChange={(e) => setLicenseClass(e.target.value)}
              className="mb-3"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  Hạng {c.code} — {c.examConfig.numQuestions} câu / {c.examConfig.durationMinutes} phút
                </option>
              ))}
            </Form.Select>
            <Button variant="primary" onClick={startExam}>Bắt đầu làm bài</Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      {/* Thanh trạng thái: hạng, đã trả lời, đồng hồ */}
      <div className="d-flex justify-content-between align-items-center mb-3 sticky-top bg-white py-2">
        <div>
          <Badge bg="primary" className="me-2">Hạng {exam.licenseClass.code}</Badge>
          Đã trả lời: {answeredCount}/{exam.questions.length}
        </div>
        <div className={`exam-timer ${secondsLeft < 60 ? 'text-danger' : 'text-brand'}`}>
          ⏱ {mmss(secondsLeft)}
        </div>
      </div>

      {exam.questions.map((q, i) => (
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
              {q.options.map((opt, idx) => (
                <Button
                  key={idx}
                  variant={answers[q._id] === idx ? 'primary' : 'outline-secondary'}
                  className="text-start"
                  onClick={() => choose(q._id, idx)}
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                </Button>
              ))}
            </div>
          </Card.Body>
        </Card>
      ))}

      <Row className="mt-4">
        <Col>
          <Button variant="success" size="lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        </Col>
      </Row>
    </div>
  );
}
