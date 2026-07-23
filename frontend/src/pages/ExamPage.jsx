import { useEffect, useState, useCallback } from "react";
import {
  Form,
  Card,
  Button,
  Badge,
  Row,
  Col,
  Modal,
  Alert,
  InputGroup,
} from "react-bootstrap";
import {
  ClockFill,
  ChevronLeft,
  ChevronRight,
  SendFill,
  PlayFill,
  ExclamationTriangleFill,
  ArrowCounterclockwise,
  QuestionCircle,
} from "react-bootstrap-icons";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

const MAX_DURATION = 180;

export default function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [licenseClass, setLicenseClass] = useState("");

  const [numQuestions, setNumQuestions] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [available, setAvailable] = useState(null); // số câu hiện có của hạng đang chọn
  const [setupError, setSetupError] = useState("");
  const [starting, setStarting] = useState(false);

  const [exam, setExam] = useState(null); // { config, questions, licenseClass }
  const [current, setCurrent] = useState(0); // câu đang xem
  const [answers, setAnswers] = useState({}); // {questionId: selectedIndex}
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    api.get("/license-classes").then((res) => {
      setClasses(res.data);
      const preselected = location.state?.licenseClass;
      if (preselected) setLicenseClass(preselected);
      else if (res.data[0]) setLicenseClass(res.data[0]._id);
    });
  }, [location.state]);

  const selectedClass = classes.find((c) => c._id === licenseClass);

  useEffect(() => {
    if (!selectedClass) return;
    setNumQuestions(String(selectedClass.examConfig.numQuestions));
    setDurationMinutes(String(selectedClass.examConfig.durationMinutes));
    setSetupError("");
    // Đếm số câu được phép đưa vào đề thi (đã trừ các câu admin tắt)
    setAvailable(null);
    api
      .get("/exams/available", { params: { licenseClass: selectedClass._id } })
      .then((res) => setAvailable(res.data.available))
      .catch(() => setAvailable(null));
  }, [selectedClass]);

  const resetToDefault = () => {
    if (!selectedClass) return;
    setNumQuestions(String(selectedClass.examConfig.numQuestions));
    setDurationMinutes(String(selectedClass.examConfig.durationMinutes));
    setSetupError("");
  };

  // Điểm đạt tính theo tỉ lệ chuẩn của hạng, khớp cách tính ở server
  const previewPassScore = () => {
    const n = parseInt(numQuestions, 10);
    if (!selectedClass || !Number.isInteger(n) || n < 1) return null;
    const ratio =
      selectedClass.examConfig.passScore /
      selectedClass.examConfig.numQuestions;
    return Math.min(Math.max(Math.ceil(n * ratio), 1), n);
  };

  const startExam = async () => {
    setSetupError("");
    const n = parseInt(numQuestions, 10);
    const m = parseInt(durationMinutes, 10);

    if (!Number.isInteger(n) || n < 1) {
      setSetupError("Số câu hỏi phải là số nguyên lớn hơn 0");
      return;
    }
    if (available !== null && n > available) {
      setSetupError(
        `Hạng ${selectedClass?.code} hiện chỉ có ${available} câu hỏi`,
      );
      return;
    }
    if (!Number.isInteger(m) || m < 1 || m > MAX_DURATION) {
      setSetupError(`Thời gian làm bài phải từ 1 đến ${MAX_DURATION} phút`);
      return;
    }

    setStarting(true);
    try {
      const res = await api.post("/exams/generate", {
        licenseClass,
        numQuestions: n,
        durationMinutes: m,
      });
      setExam(res.data);
      setAnswers({});
      setCurrent(0);
      setSecondsLeft(res.data.config.durationMinutes * 60);
      setStartedAt(new Date().toISOString());
    } catch (err) {
      setSetupError(err.response?.data?.message || "Không tạo được đề thi");
    } finally {
      setStarting(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || submitting) return;
    setSubmitting(true);
    const durationSeconds = exam.config.durationMinutes * 60 - secondsLeft;
    const payload = {
      licenseClass: exam.licenseClass._id,
      startedAt,
      durationSeconds,
      durationMinutes: exam.config.durationMinutes,
      answers: exam.questions.map((q) => ({
        question: q._id,
        selectedIndex: answers[q._id] ?? null,
      })),
    };
    const res = await api.post("/exams/submit", payload);
    navigate("/exam/result", { state: { result: res.data } });
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
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ===== Màn hình thiết lập đề thi ===== */
  if (!exam) {
    const pass = previewPassScore();
    const isDefault =
      selectedClass &&
      Number(numQuestions) === selectedClass.examConfig.numQuestions &&
      Number(durationMinutes) === selectedClass.examConfig.durationMinutes;

    return (
      <div>
        <h3 className="text-brand fw-bold mb-3">Thi thử</h3>
        <Card className="mx-auto" style={{ maxWidth: 560 }}>
          <Card.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label>Hạng bằng muốn thi</Form.Label>
              <Form.Select
                value={licenseClass}
                onChange={(e) => setLicenseClass(e.target.value)}
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    Hạng {c.code} — {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col sm={6}>
                <Form.Label>Nhập số câu hỏi</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min={1}
                    max={available ?? undefined}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                  />
                  <InputGroup.Text>câu</InputGroup.Text>
                </InputGroup>
                <Form.Text muted>
                  {available === null
                    ? "Đang tải số câu khả dụng..."
                    : `Hạng ${selectedClass?.code} có ${available} câu dùng được cho đề thi`}
                </Form.Text>
              </Col>
              <Col sm={6}>
                <Form.Label>Thời gian làm bài</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min={1}
                    max={MAX_DURATION}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  />
                  <InputGroup.Text>phút</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>

            {setupError && (
              <Alert variant="danger" className="py-2">
                {setupError}
              </Alert>
            )}

            <div className="bg-light p-3 small mb-3">
              <div className="fw-semibold mb-2">Tóm tắt bài thi</div>
              <div className="d-flex justify-content-between">
                <span>Số câu hỏi</span>
                <strong>{numQuestions || "0"} câu</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Thời gian</span>
                <strong>{durationMinutes || "0"} phút</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Điểm đạt</span>
                <strong>{pass ? `≥ ${pass}/${numQuestions}` : "0"}</strong>
              </div>
              <div className="text-danger mt-2">
                <ExclamationTriangleFill className="me-1" />
                Trả lời sai câu điểm liệt là không đạt dù đủ điểm.
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-100"
              onClick={startExam}
              disabled={starting}
            >
              <PlayFill className="me-1" />
              {starting ? "Đang tạo đề..." : "Bắt đầu làm bài"}
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
          <Card className="sticky-top" style={{ top: "1rem" }}>
            <Card.Body>
              <div
                className={`text-center exam-timer mb-3 ${secondsLeft < 60 ? "text-danger" : "text-brand"}`}
              >
                <ClockFill className="me-2" />
                {mmss(secondsLeft)}
              </div>

              <div className="qnum-grid mb-3">
                {exam.questions.map((question, i) => {
                  const cls = [
                    "qnum-btn",
                    answers[question._id] !== undefined ? "answered" : "",
                    i === current ? "current" : "",
                    question.isCritical ? "critical" : "",
                  ].join(" ");
                  return (
                    <button
                      key={question._id}
                      type="button"
                      className={cls}
                      onClick={() => setCurrent(i)}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="small text-muted mb-3">
                <div>
                  <span
                    className="d-inline-block me-2"
                    style={{ width: 12, height: 12, background: "#0d6efd" }}
                  />
                  Đã trả lời ({answeredCount})
                </div>
                <div>
                  <span
                    className="d-inline-block me-2 border"
                    style={{ width: 12, height: 12, background: "#fff" }}
                  />
                  Chưa trả lời ({unanswered})
                </div>
                <div>
                  <span
                    className="d-inline-block rounded-circle me-2"
                    style={{
                      width: 8,
                      height: 8,
                      background: "#dc3545",
                      marginLeft: 2,
                      marginRight: 10,
                    }}
                  />
                  Câu điểm liệt
                </div>
              </div>

              <Button
                variant="success"
                className="w-100"
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
              >
                <SendFill className="me-2" />
                Nộp bài
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
                  Câu {current + 1}
                  <span className="text-muted fw-normal">
                    /{exam.questions.length}
                  </span>
                </h5>
                {q.isCritical && <Badge bg="danger">Điểm liệt</Badge>}
              </div>

              <p className="fs-5">{q.content}</p>
              {q.imageUrl && (
                <div className="text-center my-3">
                  <img
                    src={q.imageUrl}
                    alt="minh họa"
                    className="question-image"
                  />
                </div>
              )}

              <div className="d-grid gap-2 mt-3">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`answer-option ${answers[q._id] === idx ? "selected" : ""}`}
                    onClick={() => setAnswers({ ...answers, [q._id]: idx })}
                  >
                    <span className="answer-letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              <div className="d-flex justify-content-between mt-4">
                <Button
                  variant="outline-secondary"
                  onClick={() => setCurrent(current - 1)}
                  disabled={current === 0}
                >
                  <ChevronLeft className="me-1" />
                  Câu trước
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => setCurrent(current + 1)}
                  disabled={current === exam.questions.length - 1}
                >
                  Câu sau
                  <ChevronRight className="ms-1" />
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
          Bạn đã trả lời{" "}
          <strong>
            {answeredCount}/{exam.questions.length}
          </strong>{" "}
          câu.
          {unanswered > 0 && (
            <div className="text-danger mt-2">
              <ExclamationTriangleFill className="me-1" />
              Còn {unanswered} câu chưa trả lời — các câu bỏ trống sẽ bị tính là
              sai.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirm(false)}
          >
            Làm tiếp
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
