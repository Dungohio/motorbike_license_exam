import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { PersonPlus, Envelope, Lock, Person, ShieldLock } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroImg from '../assets/hero.png';
import logo from '../assets/logo.png';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // Validate toàn bộ trường trước khi gọi API
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    else if (form.name.trim().length < 2) errs.name = 'Họ tên phải có ít nhất 2 ký tự';

    if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!EMAIL_REGEX.test(form.email)) errs.email = 'Email không đúng định dạng';

    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    if (!form.confirm) errs.confirm = 'Vui lòng nhập lại mật khẩu';
    else if (form.confirm !== form.password) errs.confirm = 'Mật khẩu nhập lại không khớp';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <img src={heroImg} alt="Ôn thi bằng lái xe máy" />
        <div className="auth-side-caption">
          <h2 className="fw-bold">Bắt đầu hành trình lấy bằng của bạn</h2>
          <p className="mb-0">Tạo tài khoản miễn phí để ôn tập và thi thử không giới hạn.</p>
        </div>
      </div>

      <div className="auth-form-col mx-auto">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" width={72} height={72} style={{ borderRadius: '50%' }} />
          <h4 className="text-brand fw-bold mt-3 mb-1">Đăng ký tài khoản</h4>
          <p className="text-muted small mb-0">Chỉ mất chưa đến 1 phút</p>
        </div>

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label><Person className="me-1" />Họ tên</Form.Label>
            <Form.Control
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><Envelope className="me-1" />Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="ban@example.com"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><Lock className="me-1" />Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label><ShieldLock className="me-1" />Nhập lại mật khẩu</Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập lại mật khẩu ở trên"
              value={form.confirm}
              onChange={(e) => setField('confirm', e.target.value)}
              isInvalid={!!errors.confirm}
            />
            <Form.Control.Feedback type="invalid">{errors.confirm}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
            <PersonPlus className="me-2" />
            {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </Button>
        </Form>

        <p className="text-center mt-4 mb-0 small">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
