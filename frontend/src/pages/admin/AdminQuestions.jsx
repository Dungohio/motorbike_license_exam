import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Badge, Pagination, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminQuestions() {
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ licenseClass: '', category: '' });
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/license-classes').then((res) => setClasses(res.data));
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (filters.licenseClass) params.licenseClass = filters.licenseClass;
    if (filters.category) params.category = filters.category;
    const res = await api.get('/questions', { params });
    setData(res.data);
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    await api.delete(`/questions/${id}`);
    load();
  };

  const onFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-brand mb-0">Quản lý câu hỏi</h3>
        <Button as={Link} to="/admin/questions/new" variant="primary">+ Thêm câu hỏi</Button>
      </div>

      <Row className="g-2 mb-3">
        <Col md={4}>
          <Form.Select name="licenseClass" value={filters.licenseClass} onChange={onFilter}>
            <option value="">-- Tất cả hạng bằng --</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>Hạng {c.code}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select name="category" value={filters.category} onChange={onFilter}>
            <option value="">-- Tất cả chủ đề --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table striped bordered hover responsive className="bg-white">
            <thead>
              <tr>
                <th>Nội dung</th>
                <th>Hạng</th>
                <th>Chủ đề</th>
                <th>Điểm liệt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((q) => (
                <tr key={q._id}>
                  <td>{q.content}</td>
                  <td>{q.licenseClass?.code}</td>
                  <td>{q.category?.name}</td>
                  <td>{q.isCritical && <Badge bg="danger">Có</Badge>}</td>
                  <td className="text-nowrap">
                    <Button
                      as={Link}
                      to={`/admin/questions/${q._id}/edit`}
                      size="sm"
                      variant="outline-primary"
                      className="me-1"
                    >
                      Sửa
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(q._id)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">Chưa có câu hỏi nào.</td>
                </tr>
              )}
            </tbody>
          </Table>

          {data.totalPages > 1 && (
            <Pagination>
              {Array.from({ length: data.totalPages }, (_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
