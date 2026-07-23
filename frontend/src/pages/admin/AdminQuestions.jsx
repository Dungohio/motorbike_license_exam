import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Form, Row, Col, Badge, Pagination, Spinner, Card, Modal, Alert } from 'react-bootstrap';
import {
  PlusLg, PencilSquare, Trash, ListCheck, ExclamationTriangleFill, CheckLg, XLg,
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminQuestions() {
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ licenseClass: '', category: '', inExam: '' });
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // câu hỏi đang chờ xác nhận xóa
  const [selected, setSelected] = useState([]); // id các câu đang được tích chọn
  const [notice, setNotice] = useState(''); // thông báo sau thao tác hàng loạt

  useEffect(() => {
    api.get('/license-classes').then((res) => setClasses(res.data));
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (filters.licenseClass) params.licenseClass = filters.licenseClass;
    if (filters.category) params.category = filters.category;
    if (filters.inExam) params.inExam = filters.inExam;
    const res = await api.get('/questions', { params });
    setData(res.data);
    setSelected([]); // đổi trang/bộ lọc thì bỏ chọn
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

  /* ----- Tích chọn ----- */
  const toggleOne = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const allOnPageSelected =
    data.items.length > 0 && data.items.every((q) => selected.includes(q._id));

  const toggleAllOnPage = () =>
    setSelected(allOnPageSelected ? [] : data.items.map((q) => q._id));

  /* ----- Bật/tắt dùng trong đề thi ----- */
  const setInExam = async (ids, inExam) => {
    const res = await api.patch('/questions/bulk-in-exam', { ids, inExam });
    setNotice(res.data.message);
    load();
  };

  const inExamCount = data.items.filter((q) => q.inExam !== false).length;

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
            <Col md={4}>
              <Form.Select name="inExam" value={filters.inExam} onChange={onFilter}>
                <option value="">Tất cả trạng thái đề thi</option>
                <option value="true">Đang dùng trong đề thi</option>
                <option value="false">Không dùng trong đề thi</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {notice && (
        <Alert variant="success" dismissible onClose={() => setNotice('')} className="py-2">
          {notice}
        </Alert>
      )}

      {/* Thanh thao tác hàng loạt, chỉ hiện khi có câu được tích */}
      {selected.length > 0 && (
        <Card className="mb-3 border-primary">
          <Card.Body className="py-2 d-flex align-items-center flex-wrap gap-2">
            <span className="fw-semibold">Đã chọn {selected.length} câu</span>
            <Button size="sm" variant="success" onClick={() => setInExam(selected, true)}>
              <CheckLg className="me-1" />Dùng trong đề thi
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={() => setInExam(selected, false)}>
              <XLg className="me-1" />Không dùng trong đề thi
            </Button>
            <Button size="sm" variant="link" onClick={() => setSelected([])}>Bỏ chọn</Button>
          </Card.Body>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <Card className="">
            <Table responsive className="mb-0 align-middle">
              <thead>
                <tr className="table-light">
                  <th style={{ width: 44 }}>
                    <Form.Check
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleAllOnPage}
                      title="Chọn tất cả câu trong trang"
                    />
                  </th>
                  <th style={{ minWidth: 300 }}>Nội dung</th>
                  <th>Hạng</th>
                  <th>Chủ đề</th>
                  <th>Điểm liệt</th>
                  <th>Dùng trong đề thi</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((q) => (
                  <tr key={q._id} className={selected.includes(q._id) ? 'table-primary' : ''}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selected.includes(q._id)}
                        onChange={() => toggleOne(q._id)}
                      />
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: 380 }} title={q.content}>
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
                    <td>
                      <Form.Check
                        type="switch"
                        checked={q.inExam !== false}
                        onChange={() => setInExam([q._id], q.inExam === false)}
                        title={q.inExam !== false ? 'Đang dùng trong đề thi' : 'Không dùng trong đề thi'}
                      />
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
                    <td colSpan={7} className="text-center text-muted py-4">
                      Chưa có câu hỏi nào khớp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>

          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <span className="small text-muted">
              Trang này: {inExamCount}/{data.items.length} câu đang dùng trong đề thi
            </span>
            {data.totalPages > 1 && (
              <Pagination className="mb-0">
                {Array.from({ length: data.totalPages }, (_, i) => (
                  <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            )}
          </div>
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
