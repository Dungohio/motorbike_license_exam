import { useEffect, useState, useCallback } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, ArrowRepeat, CheckCircleFill, InfoCircle } from 'react-bootstrap-icons';

// Chế độ flashcard: mặt trước là câu hỏi, bấm lật ra đáp án + giải thích.
export default function FlashcardMode({ questions }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const q = questions[index];

  const go = useCallback(
    (delta) => {
      setFlipped(false);
      setIndex((i) => Math.min(Math.max(i + delta, 0), questions.length - 1));
    },
    [questions.length]
  );

  // Điều khiển bằng bàn phím: ← → chuyển thẻ, Space lật
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <div>
      <div className="text-center small text-muted mb-2">
        Thẻ <strong>{index + 1}</strong>/{questions.length} · bấm vào thẻ để lật (phím Space), ← → để chuyển
      </div>

      <div className="flashcard-scene mb-3">
        <div
          className={`flashcard ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
          role="button"
        >
          {/* Mặt trước: câu hỏi */}
          <div className="flashcard-face flashcard-front">
            {q.isCritical && <Badge bg="danger" className="mb-2">Câu điểm liệt</Badge>}
            <div className="fs-5 fw-semibold">{q.content}</div>
            {q.imageUrl && <img src={q.imageUrl} alt="minh họa" className="question-image mt-3" />}
            <div className="text-muted small mt-3">
              <ArrowRepeat className="me-1" />Bấm để xem đáp án
            </div>
          </div>
          {/* Mặt sau: đáp án + giải thích */}
          <div className="flashcard-face flashcard-back">
            <div className="text-success fw-bold mb-2">
              <CheckCircleFill className="me-2" />
              {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}
            </div>
            {q.explanation && (
              <div className="small text-muted">
                <InfoCircle className="me-1" />{q.explanation}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-2">
        <Button variant="outline-primary" onClick={() => go(-1)} disabled={index === 0}>
          <ChevronLeft /> Trước
        </Button>
        <Button variant="outline-primary" onClick={() => go(1)} disabled={index === questions.length - 1}>
          Sau <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
