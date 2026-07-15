import { useEffect, useState } from 'react';
import { Table, Badge, Button, Spinner, Card } from 'react-bootstrap';
import { Eye, ClockHistory, FileEarmarkText } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import cardHistory from '../assets/card-history.svg';

export default function HistoryPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams/history').then((res) => {
      setResults(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <h3 className="text-brand fw-bold mb-3">
        <ClockHistory className="me-2" />Lịch sử thi
      </h3>

      {results.length === 0 ? (
        <div className="text-center py-5">
          <img src={cardHistory} alt="" style={{ maxWidth: 260, opacity: 0.9 }} className="mb-3 rounded-3" />
          <p className="text-muted">Bạn chưa có lần thi nào.</p>
          <Button as={Link} to="/exam" variant="primary">
            <FileEarmarkText className="me-2" />Thi thử ngay
          </Button>
        </div>
      ) : (
        <Card className="shadow-sm border-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead>
              <tr className="table-light">
                <th>#</th>
                <th>Thời gian</th>
                <th>Hạng</th>
                <th>Điểm</th>
                <th>Kết quả</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r._id}>
                  <td className="text-muted">{i + 1}</td>
                  <td>{new Date(r.submittedAt || r.createdAt).toLocaleString('vi-VN')}</td>
                  <td><Badge bg="primary">{r.licenseClass?.code}</Badge></td>
                  <td className="fw-semibold">{r.score}/{r.total}</td>
                  <td>
                    <Badge bg={r.passed ? 'success' : 'danger'}>
                      {r.passed ? 'Đậu' : 'Trượt'}
                    </Badge>
                    {r.failedByCritical && (
                      <Badge bg="warning" text="dark" className="ms-1">Điểm liệt</Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <Button as={Link} to={`/history/${r._id}`} size="sm" variant="outline-primary">
                      <Eye className="me-1" />Xem lại
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
