import { useState } from 'react';
import { Card, Button, Badge, ProgressBar, Alert } from 'react-bootstrap';
import {
  ArrowRight,
  ArrowCounterclockwise,
  CheckCircleFill,
  XCircleFill,
  InfoCircle,
  Trophy,
} from 'react-bootstrap-icons';

// Chế độ trắc nghiệm: làm từng câu, chọn xong hiện đúng/sai + giải thích ngay.
export default function QuizMode({ questions }) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null); // đáp án đã chọn cho câu hiện tại
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const answered = chosen !== null;

  const choose = (idx) => {
    if (answered) return;
    setChosen(idx);
    if (idx === q.correctIndex) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setChosen(null);
  };

  const restart = () => {
    setIndex(0);
    setChosen(null);
    setCorrectCount(0);
    setFinished(false);
  };

  // Màn hình tổng kết cuối bài
  if (finished) {
    const percent = Math.round((correctCount / questions.length) * 100);
    return (
      <Card className="shadow-sm border-0 text-center mx-auto" style={{ maxWidth: 520 }}>
        <Card.Body className="py-5">
          <Trophy size={56} className="text-warning mb-3" />
          <h4 className="fw-bold">Hoàn thành bài ôn tập!</h4>
          <p className="fs-5 mb-1">
            Đúng <strong className="text-brand">{correctCount}/{questions.length}</strong> câu ({percent}%)
          </p>
          <p className="text-muted small">
            {percent >= 80 ? 'Rất tốt! Bạn đã sẵn sàng thi thử.' : 'Hãy ôn lại các câu sai rồi luyện thêm nhé.'}
          </p>
          <Button variant="primary" onClick={restart}>
            <ArrowCounterclockwise className="me-2" />Làm lại từ đầu
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 720 }}>
      {/* Tiến độ */}
      <div className="d-flex justify-content-between align-items-center mb-2 small">
        <span>Câu <strong>{index + 1}</strong>/{questions.length}</span>
        <span className="text-success">
          <CheckCircleFill className="me-1" />Đúng {correctCount}
        </span>
      </div>
      <ProgressBar now={((index + (answered ? 1 : 0)) / questions.length) * 100} className="mb-3" style={{ height: 8 }} />

      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="fw-bold">{q.content}</span>
            {q.isCritical && <Badge bg="danger" className="ms-2 flex-shrink-0">Điểm liệt</Badge>}
          </div>
          {q.imageUrl && (
            <div className="text-center my-3">
              <img src={q.imageUrl} alt="minh họa" className="question-image" />
            </div>
          )}
          <div className="d-grid gap-2 mt-3">
            {q.options.map((opt, idx) => {
              let cls = '';
              if (answered && idx === q.correctIndex) cls = 'correct';
              else if (answered && idx === chosen) cls = 'wrong';
              return (
                <button
                  key={idx}
                  type="button"
                  className={`answer-option ${cls}`}
                  onClick={() => choose(idx)}
                  disabled={answered}
                >
                  <span className="answer-letter">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <Alert variant={chosen === q.correctIndex ? 'success' : 'danger'} className="mt-3 mb-0">
              <div className="fw-bold mb-1">
                {chosen === q.correctIndex ? (
                  <><CheckCircleFill className="me-2" />Chính xác!</>
                ) : (
                  <><XCircleFill className="me-2" />Chưa đúng. Đáp án đúng là {String.fromCharCode(65 + q.correctIndex)}.</>
                )}
              </div>
              {q.explanation && (
                <div className="small"><InfoCircle className="me-1" />{q.explanation}</div>
              )}
            </Alert>
          )}
        </Card.Body>
      </Card>

      <div className="text-end mt-3">
        <Button variant="primary" onClick={next} disabled={!answered}>
          {index + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp'}
          <ArrowRight className="ms-2" />
        </Button>
      </div>
    </div>
  );
}
