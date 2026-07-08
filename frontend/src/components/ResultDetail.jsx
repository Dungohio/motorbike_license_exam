import { Alert, Card, Badge } from 'react-bootstrap';

// Hiển thị kết quả chi tiết một lần thi: tổng kết + xem lại từng câu.
export default function ResultDetail({ result }) {
  return (
    <div>
      <Alert variant={result.passed ? 'success' : 'danger'}>
        <h4 className="mb-1">{result.passed ? '🎉 ĐẬU' : '❌ TRƯỢT'}</h4>
        <div>
          Số câu đúng: <strong>{result.score}/{result.total}</strong>
        </div>
        {result.failedByCritical && <div>Lý do trượt: sai câu điểm liệt.</div>}
      </Alert>

      {result.answers.map((a, i) => (
        <Card key={i} className="shadow-sm mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <strong>Câu {i + 1}</strong>
              <span>
                {a.isCritical && <Badge bg="danger" className="me-1">Điểm liệt</Badge>}
                <Badge bg={a.isCorrect ? 'success' : 'danger'}>
                  {a.isCorrect ? 'Đúng' : 'Sai'}
                </Badge>
              </span>
            </div>
            <p className="mt-2">{a.content}</p>
            <div className="d-grid gap-2">
              {a.options.map((opt, idx) => {
                let cls = '';
                if (idx === a.correctIndex) cls = 'option-correct';
                else if (idx === a.selectedIndex) cls = 'option-wrong';
                return (
                  <div key={idx} className={`border rounded p-2 ${cls}`}>
                    {String.fromCharCode(65 + idx)}. {opt}
                    {idx === a.correctIndex && ' ✔'}
                    {idx === a.selectedIndex && idx !== a.correctIndex && ' (bạn chọn)'}
                  </div>
                );
              })}
            </div>
            {a.selectedIndex === null && (
              <div className="text-muted small mt-2">Bạn chưa trả lời câu này.</div>
            )}
            {a.explanation && (
              <div className="alert alert-info mt-3 mb-0">
                <strong>Giải thích:</strong> {a.explanation}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
