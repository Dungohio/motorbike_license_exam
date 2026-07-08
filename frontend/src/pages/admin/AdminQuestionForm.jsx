import { useEffect, useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const emptyForm = {
  licenseClass: '',
  category: '',
  content: '',
  imageUrl: '',
  options: ['', ''],
  correctIndex: 0,
  explanation: '',
  isCritical: false,
};

export default function AdminQuestionForm() {
  const { id } = useParams(); // có id => đang sửa
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([api.get('/license-classes'), api.get('/categories')]).then(([l, c]) => {
      setClasses(l.data);
      setCategories(c.data);
      // Đặt mặc định khi thêm mới
      if (!isEdit) {
        setForm((f) => ({
          ...f,
          licenseClass: l.data[0]?._id || '',
          category: c.data[0]?._id || '',
        }));
      }
    });

    if (isEdit) {
      api.get(`/questions/${id}`).then((res) => {
        const q = res.data;
        setForm({
          licenseClass: q.licenseClass?._id || q.licenseClass,
          category: q.category?._id || q.category,
          content: q.content,
          imageUrl: q.imageUrl || '',
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation || '',
          isCritical: q.isCritical,
        });
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const setOption = (idx, value) => {
    const options = [...form.options];
    options[idx] = value;
    setForm((f) => ({ ...f, options }));
  };

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, ''] }));

  const removeOption = (idx) => {
    if (form.options.length <= 2) return;
    const options = form.options.filter((_, i) => i !== idx);
    // Điều chỉnh lại correctIndex nếu cần
    let correctIndex = form.correctIndex;
    if (idx === correctIndex) correctIndex = 0;
    else if (idx < correctIndex) correctIndex -= 1;
    setForm((f) => ({ ...f, options, correctIndex }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) await api.put(`/questions/${id}`, form);
      else await api.post('/questions', form);
      navigate('/admin/questions');
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-brand mb-3">{isEdit ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h3>
      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label>Hạng bằng</Form.Label>
                <Form.Select
                  value={form.licenseClass}
                  onChange={(e) => setField('licenseClass', e.target.value)}
                  required
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>Hạng {c.code}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Chủ đề</Form.Label>
                <Form.Select
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  required
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Nội dung câu hỏi</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.content}
                onChange={(e) => setField('content', e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh minh họa (URL, không bắt buộc)</Form.Label>
              <Form.Control
                value={form.imageUrl}
                onChange={(e) => setField('imageUrl', e.target.value)}
                placeholder="https://..."
              />
            </Form.Group>

            <Form.Label>Các đáp án (chọn nút radio ở đáp án đúng)</Form.Label>
            {form.options.map((opt, idx) => (
              <InputGroup className="mb-2" key={idx}>
                <InputGroup.Radio
                  name="correctIndex"
                  checked={form.correctIndex === idx}
                  onChange={() => setField('correctIndex', idx)}
                />
                <Form.Control
                  value={opt}
                  onChange={(e) => setOption(idx, e.target.value)}
                  placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                  required
                />
                <Button
                  variant="outline-danger"
                  onClick={() => removeOption(idx)}
                  disabled={form.options.length <= 2}
                >
                  ✕
                </Button>
              </InputGroup>
            ))}
            <Button variant="outline-secondary" size="sm" className="mb-3" onClick={addOption}>
              + Thêm đáp án
            </Button>

            <Form.Group className="mb-3">
              <Form.Label>Giải thích đáp án (không bắt buộc)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.explanation}
                onChange={(e) => setField('explanation', e.target.value)}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Đây là câu điểm liệt (sai là trượt)"
              checked={form.isCritical}
              onChange={(e) => setField('isCritical', e.target.checked)}
              className="mb-3"
            />

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">Lưu</Button>
              <Button variant="outline-secondary" onClick={() => navigate('/admin/questions')}>
                Hủy
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
