import { Alert, Card, Badge, ProgressBar } from 'react-bootstrap';
import {
  TrophyFill,
  XCircleFill,
  CheckCircleFill,
  InfoCircle,
  ExclamationTriangleFill,
} from 'react-bootstrap-icons';

// Hiển thị kết quả chi tiết một lần thi: tổng kết + xem lại từng câu.
export default function ResultDetail({ result }) {
  const percent = Math.round((result.score / result.total) * 100);

  return (
    <div>
      <Alert variant={result.passed ? 'success' : 'danger'}>
        <div className="d-flex align-items-center gap-3">
          {result.passed ? <TrophyFill size={40} /> : <XCircleFill size={40} />}
          <div className="flex-grow-1">
            <h4 className="mb-1">{result.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}</h4>
            <div>
              Số câu đúng: <strong>{result.score}/{result.total}</strong> ({percent}%)
              {result.passScore != null && (
                <span className="ms-2">· Điểm đạt: ≥ {result.passScore}/{result.total}</span>
              )}
            </div>
            {result.durationMinutes && (
              <div className="small">Thời gian làm bài: {result.durationMinutes} phút</div>
            )}
            {result.failedByCritical && (
              <div className="mt-1">
                <ExclamationTriangleFill className="me-1" />
                Lý do không đạt: trả lời sai câu điểm liệt.
              </div>
            )}
          </div>
        </div>
        <ProgressBar
          now={percent}
          variant={result.passed ? 'success' : 'danger'}
          className="mt-3"
          style={{ height: 8 }}
        />
      </Alert>

      {result.answers.map((a, i) => (
        <Card key={i} className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <span className="fw-bold">Câu {i + 1}. {a.content}</span>
              <span className="flex-shrink-0 ms-2">
                {a.isCritical && <Badge bg="danger" className="me-1">Điểm liệt</Badge>}
                <Badge bg={a.isCorrect ? 'success' : 'danger'}>
                  {a.isCorrect ? 'Đúng' : 'Sai'}
                </Badge>
              </span>
            </div>
            <div className="d-grid gap-2 mt-3">
              {a.options.map((opt, idx) => {
                let cls = '';
                if (idx === a.correctIndex) cls = 'correct';
                else if (idx === a.selectedIndex) cls = 'wrong';
                return (
                  <div key={idx} className={`answer-option ${cls}`}>
                    <span className="answer-letter">{String.fromCharCode(65 + idx)}</span>
                    <span>
                      {opt}
                      {idx === a.correctIndex && <CheckCircleFill className="ms-2 text-success" />}
                      {idx === a.selectedIndex && idx !== a.correctIndex && (
                        <span className="ms-2 small text-danger">(bạn chọn)</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            {a.selectedIndex === null && (
              <div className="text-muted small mt-2">Bạn chưa trả lời câu này.</div>
            )}
            {a.explanation && (
              <div className="alert alert-info small mt-3 mb-0">
                <InfoCircle className="me-1" />{a.explanation}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
