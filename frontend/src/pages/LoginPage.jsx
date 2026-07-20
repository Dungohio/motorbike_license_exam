import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { BoxArrowInRight, Envelope, Lock } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined })); // xóa lỗi khi user gõ lại
  };

  // Kiểm tra phía client trước khi gọi API
  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!EMAIL_REGEX.test(form.email)) errs.email = 'Email không đúng định dạng';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
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
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Panel xanh nước biển bên trái (ẩn trên mobile) */}
      <div className="auth-side">
        <div className="auth-side-caption">
          <h2 className="fw-bold">Tự tin thi đậu lý thuyết bằng lái xe máy</h2>
          <p className="mb-0">Ôn luyện theo bộ đề chuẩn Việt Nam — mọi lúc, mọi nơi.</p>
        </div>
      </div>

      {/* Form bên phải */}
      <div className="auth-form-col mx-auto">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" width={72} height={72} style={{ borderRadius: '50%' }} />
          <h4 className="text-brand fw-bold mt-3 mb-1">Đăng nhập</h4>
          <p className="text-muted small mb-0">Đăng nhập để tiếp tục ôn luyện.</p>
        </div>

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Form noValidate onSubmit={handleSubmit}>
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

          <Form.Group className="mb-4">
            <Form.Label><Lock className="me-1" />Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
            <BoxArrowInRight className="me-2" />
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </Form>

        <p className="text-center mt-4 mb-0 small">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
