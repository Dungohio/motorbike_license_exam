import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Badge, Pagination, Spinner, Card, Modal } from 'react-bootstrap';
import { PlusLg, PencilSquare, Trash, ListCheck, ExclamationTriangleFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminQuestions() {
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ licenseClass: '', category: '' });
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // câu hỏi đang chờ xác nhận xóa

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

  const confirmDelete = async () => {
    await api.delete(`/questions/${deleting._id}`);
    setDeleting(null);
    load();
  };

  const onFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="text-brand fw-bold mb-0">
          <ListCheck className="me-2" />Quản lý câu hỏi
          <Badge bg="secondary" className="ms-2 fs-6">{data.total}</Badge>
        </h3>
        <Button as={Link} to="/admin/questions/new" variant="primary">
          <PlusLg className="me-2" />Thêm câu hỏi
        </Button>
      </div>

      <Card className="mb-3">
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col md={4}>
              <Form.Select name="licenseClass" value={filters.licenseClass} onChange={onFilter}>
                <option value="">Tất cả hạng bằng</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>Hạng {c.code}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select name="category" value={filters.category} onChange={onFilter}>
                <option value="">Tất cả chủ đề</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <Card className="">
            <Table responsive className="mb-0 align-middle">
              <thead>
                <tr className="table-light">
                  <th style={{ minWidth: 320 }}>Nội dung</th>
                  <th>Hạng</th>
                  <th>Chủ đề</th>
                  <th>Điểm liệt</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((q) => (
                  <tr key={q._id}>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: 420 }} title={q.content}>
                        {q.content}
                      </div>
                    </td>
                    <td><Badge bg="primary">{q.licenseClass?.code}</Badge></td>
                    <td><Badge bg="info" text="dark">{q.category?.name}</Badge></td>
                    <td>
                      {q.isCritical && (
                        <Badge bg="danger"><ExclamationTriangleFill className="me-1" />Có</Badge>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      <Button
                        as={Link}
                        to={`/admin/questions/${q._id}/edit`}
                        size="sm"
                        variant="outline-primary"
                        className="me-1"
                        title="Sửa câu hỏi"
                      >
                        <PencilSquare />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        title="Xóa câu hỏi"
                        onClick={() => setDeleting(q)}
                      >
                        <Trash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Chưa có câu hỏi nào khớp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>

          {data.totalPages > 1 && (
            <Pagination className="mt-3">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}

      {/* Modal xác nhận xóa */}
      <Modal show={!!deleting} onHide={() => setDeleting(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 text-danger">
            <Trash className="me-2" />Xóa câu hỏi?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">Bạn chắc chắn muốn xóa câu hỏi này? Hành động không thể hoàn tác.</p>
          <div className="bg-light p-2 small text-muted">{deleting?.content}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleting(null)}>Hủy</Button>
          <Button variant="danger" onClick={confirmDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
