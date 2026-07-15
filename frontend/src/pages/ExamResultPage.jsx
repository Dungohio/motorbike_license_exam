import { useLocation, Link, Navigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { ArrowRepeat, ClockHistory } from 'react-bootstrap-icons';
import ResultDetail from '../components/ResultDetail';

export default function ExamResultPage() {
  const location = useLocation();
  const result = location.state?.result;

  // Nếu vào thẳng trang này mà không có dữ liệu -> quay về trang chủ
  if (!result) return <Navigate to="/" replace />;

  return (
    <div>
      <h3 className="text-brand fw-bold mb-3">Kết quả bài thi</h3>
      <ResultDetail result={result} />
      <div className="d-flex gap-2 mt-3">
        <Button as={Link} to="/exam" variant="primary">
          <ArrowRepeat className="me-2" />Thi lại
        </Button>
        <Button as={Link} to="/history" variant="outline-secondary">
          <ClockHistory className="me-2" />Xem lịch sử thi
        </Button>
      </div>
    </div>
  );
}
