import { useEffect, useState } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Avatar, { AVATAR_NAMES } from '../components/Avatar';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Thông tin cá nhân
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || 'avatar1');
  const [profileMsg, setProfileMsg] = useState(null); // {type, text}

  // Đổi mật khẩu
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState(null);

  // Thống kê học tập
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/exams/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await api.put('/users/me', { name, avatar });
      updateUser(res.data.user);
      setProfileMsg({ type: 'success', text: 'Đã lưu thông tin cá nhân' });
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.response?.data?.message || 'Lưu thất bại' });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ type: 'danger', text: 'Mật khẩu nhập lại không khớp' });
      return;
    }
    try {
      await api.put('/users/me/password', {
        oldPassword: pw.oldPassword,
        newPassword: pw.newPassword,
      });
      setPw({ oldPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công' });
    } catch (err) {
      setPwMsg({ type: 'danger', text: err.response?.data?.message || 'Đổi mật khẩu thất bại' });
    }
  };

  const statCards = stats
    ? [
        { label: 'Lần thi', value: stats.attempts },
        { label: 'Lần đậu', value: stats.passedCount },
        { label: 'Tỉ lệ đậu', value: `${stats.passRate}%` },
        { label: 'Điểm TB', value: `${stats.avgScorePercent}%` },
      ]
    : [];

  return (
    <div>
      <h3 className="text-brand mb-4">Hồ sơ của tôi</h3>

      {/* ===== Thống kê học tập ===== */}
      {stats && (
        <Row className="g-3 mb-4">
          {statCards.map((s) => (
            <Col xs={6} md={3} key={s.label}>
              <Card className="shadow-sm border-0 text-center stat-card">
                <Card.Body>
                  <div className="fs-3 fw-bold text-brand">{s.value}</div>
                  <div className="small text-muted">{s.label}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Row className="g-4">
        {/* ===== Thông tin cá nhân + avatar ===== */}
        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white fw-bold">Thông tin cá nhân</Card.Header>
            <Card.Body>
              {profileMsg && <Alert variant={profileMsg.type}>{profileMsg.text}</Alert>}
              <div className="d-flex align-items-center gap-3 mb-3">
                <Avatar name={avatar} size={72} />
                <div>
                  <div className="fw-bold">{user?.name}</div>
                  <div className="small text-muted">{user?.email}</div>
                </div>
              </div>

              <Form onSubmit={saveProfile}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên hiển thị</Form.Label>
                  <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                </Form.Group>

                <Form.Label>Chọn avatar</Form.Label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {AVATAR_NAMES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`avatar-option ${avatar === n ? 'selected' : ''}`}
                      onClick={() => setAvatar(n)}
                      aria-label={`Chọn ${n}`}
                    >
                      <Avatar name={n} size={52} />
                    </button>
                  ))}
                </div>

                <Button type="submit" variant="primary">Lưu thay đổi</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* ===== Đổi mật khẩu ===== */}
        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white fw-bold">Đổi mật khẩu</Card.Header>
            <Card.Body>
              {pwMsg && <Alert variant={pwMsg.type}>{pwMsg.text}</Alert>}
              <Form onSubmit={changePassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu hiện tại</Form.Label>
                  <Form.Control
                    type="password"
                    value={pw.oldPassword}
                    onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={pw.newPassword}
                    onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                    minLength={6}
                    required
                  />
                  <Form.Text muted>Ít nhất 6 ký tự.</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="primary">Đổi mật khẩu</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
