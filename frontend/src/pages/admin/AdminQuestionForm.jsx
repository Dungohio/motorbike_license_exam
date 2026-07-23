import { useEffect, useRef, useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { Save, XLg, PlusLg, Trash, PencilSquare, Image, Upload } from 'react-bootstrap-icons';
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
  inExam: true,
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([api.get('/license-classes'), api.get('/categories')]).then(([l, c]) => {
      setClasses(l.data);
      setCategories(c.data);
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
          inExam: q.inExam !== false,
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
    // Điều chỉnh lại correctIndex khi xóa đáp án
    let correctIndex = form.correctIndex;
    if (idx === correctIndex) correctIndex = 0;
    else if (idx < correctIndex) correctIndex -= 1;
    setForm((f) => ({ ...f, options, correctIndex }));
  };

  // Upload ảnh minh họa từ máy -> server trả URL gắn vào imageUrl
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/questions/upload-image', formData);
      setField('imageUrl', res.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
      e.target.value = ''; // cho phép chọn lại cùng file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.content.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (form.options.some((o) => !o.trim())) {
      setError('Không được để trống đáp án nào');
      return;
    }
    try {
      if (isEdit) await api.put(`/questions/${id}`, form);
      else await api.post('/questions', form);
      navigate('/admin/questions');
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <h3 className="text-brand fw-bold mb-3">
        {isEdit ? <><PencilSquare className="me-2" />Sửa câu hỏi</> : <><PlusLg className="me-2" />Thêm câu hỏi</>}
      </h3>

      <Card className="" style={{ maxWidth: 860 }}>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label className="small fw-semibold">Hạng bằng</Form.Label>
                <Form.Select value={form.licenseClass} onChange={(e) => setField('licenseClass', e.target.value)} required>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>Hạng {c.code}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold">Chủ đề</Form.Label>
                <Form.Select value={form.category} onChange={(e) => setField('category', e.target.value)} required>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Nội dung câu hỏi</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.content}
                onChange={(e) => setField('content', e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                <Image className="me-1" />Ảnh minh họa (không bắt buộc)
              </Form.Label>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageFile}
                  hidden
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="me-2" />
                  {uploading ? 'Đang tải...' : form.imageUrl ? 'Đổi ảnh khác' : 'Tải ảnh từ máy'}
                </Button>
                {form.imageUrl && (
                  <>
                    <img
                      src={form.imageUrl}
                      alt="xem trước"
                      style={{ maxHeight: 90 }}
                      className="border p-1 bg-white"
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Gỡ ảnh"
                      onClick={() => setField('imageUrl', '')}
                    >
                      <Trash />
                    </Button>
                  </>
                )}
              </div>
              <Form.Text muted>Ảnh biển báo/sa hình, tối đa 2MB (jpg, png, webp, gif, svg).</Form.Text>
            </Form.Group>

            <Form.Label className="small fw-semibold">
              Các đáp án — chọn nút tròn ở đáp án đúng
            </Form.Label>
            {form.options.map((opt, idx) => (
              <InputGroup className="mb-2" key={idx}>
                <InputGroup.Radio
                  name="correctIndex"
                  checked={form.correctIndex === idx}
                  onChange={() => setField('correctIndex', idx)}
                  title="Đáp án đúng"
                />
                <InputGroup.Text className="fw-bold">{String.fromCharCode(65 + idx)}</InputGroup.Text>
                <Form.Control
                  value={opt}
                  onChange={(e) => setOption(idx, e.target.value)}
                  placeholder={`Nội dung đáp án ${String.fromCharCode(65 + idx)}`}
                  required
                />
                <Button
                  variant="outline-danger"
                  onClick={() => removeOption(idx)}
                  disabled={form.options.length <= 2}
                  title="Xóa đáp án"
                >
                  <Trash />
                </Button>
              </InputGroup>
            ))}
            <Button variant="outline-secondary" size="sm" className="mb-3" onClick={addOption}>
              <PlusLg className="me-1" />Thêm đáp án
            </Button>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Giải thích đáp án (không bắt buộc)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.explanation}
                onChange={(e) => setField('explanation', e.target.value)}
              />
            </Form.Group>

            <Form.Check
              type="switch"
              id="critical-switch"
              label="Câu điểm liệt (trả lời sai là không đạt bài thi)"
              checked={form.isCritical}
              onChange={(e) => setField('isCritical', e.target.checked)}
              className="mb-2"
            />

            <Form.Check
              type="switch"
              id="in-exam-switch"
              label="Dùng câu hỏi này trong đề thi"
              checked={form.inExam}
              onChange={(e) => setField('inExam', e.target.checked)}
              className="mb-1"
            />
            <Form.Text muted className="d-block mb-4">
              Tắt thì câu hỏi vẫn dùng để ôn tập nhưng không xuất hiện trong bài thi.
            </Form.Text>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">
                <Save className="me-2" />Lưu câu hỏi
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/admin/questions')}>
                <XLg className="me-1" />Hủy
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
