import { useEffect, useState } from 'react';
import { Card, Form, Button, Table, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { Tags, PlusLg, PencilSquare, Trash, XLg } from 'react-bootstrap-icons';
import api from '../../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // category đang sửa, null = thêm mới
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null); // category chờ xác nhận xóa

  const load = () => {
    api.get('/categories').then((res) => {
      setCategories(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '' });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Vui lòng nhập tên chủ đề');
      return;
    }
    try {
      if (editing) await api.put(`/categories/${editing._id}`, form);
      else await api.post('/categories', form);
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    }
  };

  const confirmDelete = async () => {
    await api.delete(`/categories/${deleting._id}`);
    setDeleting(null);
    load();
  };

  return (
    <div>
      <h3 className="text-brand fw-bold mb-3">
        <Tags className="me-2" />Quản lý chủ đề
      </h3>

      <Row className="g-4">
        <Col md={5} lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold">
              {editing ? (
                <><PencilSquare className="me-2" />Sửa chủ đề</>
              ) : (
                <><PlusLg className="me-2" />Thêm chủ đề</>
              )}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" className="py-2">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold">Tên chủ đề</Form.Label>
                  <Form.Control
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Biển báo giao thông"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary">
                    {editing ? 'Cập nhật' : 'Thêm'}
                  </Button>
                  {editing && (
                    <Button variant="outline-secondary" onClick={resetForm}>
                      <XLg className="me-1" />Hủy
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={7} lg={8}>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <Card className="shadow-sm border-0">
              <Table hover responsive className="mb-0 align-middle">
                <thead>
                  <tr className="table-light">
                    <th>Tên</th>
                    <th>Mô tả</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c._id}>
                      <td className="fw-semibold">{c.name}</td>
                      <td className="text-muted small">{c.description}</td>
                      <td className="text-end text-nowrap">
                        <Button size="sm" variant="outline-primary" className="me-1" title="Sửa" onClick={() => startEdit(c)}>
                          <PencilSquare />
                        </Button>
                        <Button size="sm" variant="outline-danger" title="Xóa" onClick={() => setDeleting(c)}>
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-4">Chưa có chủ đề nào.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal xác nhận xóa */}
      <Modal show={!!deleting} onHide={() => setDeleting(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 text-danger">
            <Trash className="me-2" />Xóa chủ đề?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Xóa chủ đề <strong>{deleting?.name}</strong>? Các câu hỏi thuộc chủ đề này sẽ không bị xóa
          nhưng cần được gán lại chủ đề khác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleting(null)}>Hủy</Button>
          <Button variant="danger" onClick={confirmDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
