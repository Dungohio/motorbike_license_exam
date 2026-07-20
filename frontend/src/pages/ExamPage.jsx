import { useEffect, useState, useCallback } from 'react';
import { Form, Card, Button, Badge, Row, Col, Modal } from 'react-bootstrap';
import {
  ClockFill,
  ChevronLeft,
  ChevronRight,
  SendFill,
  PlayFill,
  ExclamationTriangleFill,
} from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [licenseClass, setLicenseClass] = useState('');

  const [exam, setExam] = useState(null); // { config, questions, licenseClass }
  const [current, setCurrent] = useState(0); // câu đang xem
  const [answers, setAnswers] = useState({}); // {questionId: selectedIndex}
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    api.get('/license-classes').then((res) => {
      setClasses(res.data);
      // Ưu tiên hạng bằng chọn sẵn từ trang chủ (nút"Thi hạng X")
      const preselected = location.state?.licenseClass;
      if (preselected) setLicenseClass(preselected);
      else if (res.data[0]) setLicenseClass(res.data[0]._id);
    });
  }, [location.state]);

  const startExam = async () => {
    const res = await api.post('/exams/generate', { licenseClass });
    setExam(res.data);
    setAnswers({});
    setCurrent(0);
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

  // Đồng hồ đếm ngược; hết giờ tự nộp
  useEffect(() => {
    if (!exam) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [exam, secondsLeft, handleSubmit]);

  const mmss = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /* ===== Màn hình chọn hạng bằng ===== */
  if (!exam) {
    const selected = classes.find((c) => c._id === licenseClass);
    return (
      <div>
        <h3 className="text-brand fw-bold mb-3">Thi thử</h3>
        <Card className="mx-auto" style={{ maxWidth: 520 }}>
          <Card.Body className="p-4">
            <Form.Label className="fw-semibold">Chọn hạng bằng muốn thi</Form.Label>
            <Form.Select
              value={licenseClass}
              onChange={(e) => setLicenseClass(e.target.value)}
              className="mb-3"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>Hạng {c.code} — {c.name}</option>
              ))}
            </Form.Select>

            {selected && (
              <div className="bg-light p-3 small mb-3">
                <div className="d-flex justify-content-between"><span>Số câu hỏi</span><strong>{selected.examConfig.numQuestions} câu</strong></div>
                <div className="d-flex justify-content-between"><span>Thời gian</span><strong>{selected.examConfig.durationMinutes} phút</strong></div>
                <div className="d-flex justify-content-between"><span>Điểm đậu</span><strong>≥ {selected.examConfig.passScore}/{selected.examConfig.numQuestions}</strong></div>
                <div className="text-danger mt-2">
                  <ExclamationTriangleFill className="me-1" />
                  Sai câu điểm liệt là trượt dù đủ điểm.
                </div>
              </div>
            )}

            <Button variant="primary" size="lg" className="w-100" onClick={startExam}>
              <PlayFill className="me-1" />Bắt đầu làm bài
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  /* ===== Màn hình làm bài ===== */
  const q = exam.questions[current];
  const answeredCount = Object.keys(answers).length;
  const unanswered = exam.questions.length - answeredCount;

  return (
    <div>
      <Row className="g-3">
        {/* Panel trái: đồng hồ + lưới số câu + nộp bài */}
        <Col lg={3}>
          <Card className="sticky-top" style={{ top: '1rem' }}>
            <Card.Body>
              <div className={`text-center exam-timer mb-3 ${secondsLeft < 60 ? 'text-danger' : 'text-brand'}`}>
                <ClockFill className="me-2" />{mmss(secondsLeft)}
              </div>

              <div className="qnum-grid mb-3">
                {exam.questions.map((question, i) => {
                  const cls = [
                    'qnum-btn',
                    answers[question._id] !== undefined ? 'answered' : '',
                    i === current ? 'current' : '',
                    question.isCritical ? 'critical' : '',
                  ].join(' ');
                  return (
                    <button key={question._id} type="button" className={cls} onClick={() => setCurrent(i)}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="small text-muted mb-3">
                <div><span className="d-inline-block me-2" style={{ width: 12, height: 12, background: '#0d6efd' }} />Đã trả lời ({answeredCount})</div>
                <div><span className="d-inline-block me-2 border" style={{ width: 12, height: 12, background: '#fff' }} />Chưa trả lời ({unanswered})</div>
                <div><span className="d-inline-block rounded-circle me-2" style={{ width: 8, height: 8, background: '#dc3545', marginLeft: 2, marginRight: 10 }} />Câu điểm liệt</div>
              </div>

              <Button variant="success" className="w-100" onClick={() => setShowConfirm(true)} disabled={submitting}>
                <SendFill className="me-2" />Nộp bài
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Câu hỏi hiện tại */}
        <Col lg={9}>
          <Card className="">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h5 className="fw-bold mb-0">
                  Câu {current + 1}<span className="text-muted fw-normal">/{exam.questions.length}</span>
                </h5>
                {q.isCritical && <Badge bg="danger">Điểm liệt</Badge>}
              </div>

              <p className="fs-5">{q.content}</p>
              {q.imageUrl && (
                <div className="text-center my-3">
                  <img src={q.imageUrl} alt="minh họa" className="question-image" />
                </div>
              )}

              <div className="d-grid gap-2 mt-3">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`answer-option ${answers[q._id] === idx ? 'selected' : ''}`}
                    onClick={() => setAnswers({ ...answers, [q._id]: idx })}
                  >
                    <span className="answer-letter">{String.fromCharCode(65 + idx)}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" onClick={() => setCurrent(current - 1)} disabled={current === 0}>
                  <ChevronLeft className="me-1" />Câu trước
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => setCurrent(current + 1)}
                  disabled={current === exam.questions.length - 1}
                >
                  Câu sau<ChevronRight className="ms-1" />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal xác nhận nộp bài */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Nộp bài thi?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn đã trả lời <strong>{answeredCount}/{exam.questions.length}</strong> câu.
          {unanswered > 0 && (
            <div className="text-danger mt-2">
              <ExclamationTriangleFill className="me-1" />
              Còn {unanswered} câu chưa trả lời — các câu bỏ trống sẽ bị tính là sai.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirm(false)}>
            Làm tiếp
          </Button>
          <Button variant="success" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
