import { useEffect, useState } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function HistoryPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams/history').then((res) => {
      setResults(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-brand mb-3">Lịch sử thi</h3>
      {results.length === 0 ? (
        <p className="text-muted">Bạn chưa có lần thi nào. Hãy vào “Thi thử” để bắt đầu.</p>
      ) : (
        <Table striped bordered hover responsive className="bg-white">
          <thead>
            <tr>
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
                <td>{i + 1}</td>
                <td>{new Date(r.submittedAt || r.createdAt).toLocaleString('vi-VN')}</td>
                <td>{r.licenseClass?.code}</td>
                <td>{r.score}/{r.total}</td>
                <td>
                  <Badge bg={r.passed ? 'success' : 'danger'}>
                    {r.passed ? 'Đậu' : 'Trượt'}
                  </Badge>
                </td>
                <td>
                  <Button as={Link} to={`/history/${r._id}`} size="sm" variant="outline-primary">
                    Xem lại
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
