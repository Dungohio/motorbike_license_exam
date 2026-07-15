import { Card, Badge } from 'react-bootstrap';
import { CheckCircleFill, InfoCircle } from 'react-bootstrap-icons';

// Chế độ tài liệu: đọc lướt toàn bộ câu hỏi, đáp án đúng tô xanh sẵn + giải thích.
export default function DocumentMode({ questions }) {
  return (
    <div className="mx-auto" style={{ maxWidth: 820 }}>
      {questions.map((q, i) => (
        <Card key={q._id} className="shadow-sm border-0 mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <span className="fw-bold">Câu {i + 1}. {q.content}</span>
              {q.isCritical && <Badge bg="danger" className="ms-2 flex-shrink-0">Điểm liệt</Badge>}
            </div>
            {q.imageUrl && (
              <div className="text-center my-3">
                <img src={q.imageUrl} alt="minh họa" className="question-image" />
              </div>
            )}
            <div className="d-grid gap-2 mt-3">
              {q.options.map((opt, idx) => (
                <div key={idx} className={`answer-option ${idx === q.correctIndex ? 'correct' : ''}`}>
                  <span className="answer-letter">{String.fromCharCode(65 + idx)}</span>
                  <span>
                    {opt}
                    {idx === q.correctIndex && <CheckCircleFill className="ms-2 text-success" />}
                  </span>
                </div>
              ))}
            </div>
            {q.explanation && (
              <div className="alert alert-info small mt-3 mb-0">
                <InfoCircle className="me-1" />{q.explanation}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
