import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spinner, Button, Alert } from 'react-bootstrap';
import api from '../api/axios';
import ResultDetail from '../components/ResultDetail';

export default function HistoryDetailPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/exams/history/${id}`)
      .then((res) => setResult(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Không tải được dữ liệu'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-brand mb-0">
          Chi tiết lần thi — Hạng {result.licenseClass?.code}
        </h3>
        <Button as={Link} to="/history" variant="outline-secondary" size="sm">
          ← Quay lại
        </Button>
      </div>
      <ResultDetail result={result} />
    </div>
  );
}
