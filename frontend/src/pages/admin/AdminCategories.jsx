import { useEffect, useState } from 'react';
import { Card, Form, Button, Table, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // category đang sửa, null = thêm mới
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api.put(`/categories/${editing._id}`, form);
      else await api.post('/categories', form);
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa chủ đề này?')) return;
    await api.delete(`/categories/${id}`);
    load();
  };

  return (
    <div>
      <h3 className="text-brand mb-3">Quản lý chủ đề</h3>
      <Row className="g-4">
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>{editing ? 'Sửa chủ đề' : 'Thêm chủ đề'}</h6>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label>Tên chủ đề</Form.Label>
                  <Form.Control
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary">{editing ? 'Cập nhật' : 'Thêm'}</Button>
                  {editing && (
                    <Button variant="outline-secondary" onClick={resetForm}>Hủy</Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={7}>
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Table striped bordered hover className="bg-white">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.description}</td>
                    <td className="text-nowrap">
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => startEdit(c)}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(c._id)}>
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </div>
  );
}
