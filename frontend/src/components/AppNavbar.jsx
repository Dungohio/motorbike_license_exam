import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🏍️ Ôn thi bằng lái xe máy
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {user && user.role === 'user' && (
              <>
                <Nav.Link as={Link} to="/practice">Ôn tập</Nav.Link>
                <Nav.Link as={Link} to="/practice?critical=true">Câu điểm liệt</Nav.Link>
                <Nav.Link as={Link} to="/exam">Thi thử</Nav.Link>
                <Nav.Link as={Link} to="/history">Lịch sử thi</Nav.Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin">Bảng điều khiển</Nav.Link>
                <Nav.Link as={Link} to="/admin/questions">Câu hỏi</Nav.Link>
                <Nav.Link as={Link} to="/admin/categories">Chủ đề</Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-lg-center">
            {user ? (
              <NavDropdown
                align="end"
                title={
                  <span className="d-inline-flex align-items-center gap-2">
                    <Avatar name={user.avatar} size={32} />
                    <span className="text-white">{user.name}</span>
                  </span>
                }
              >
                <NavDropdown.Item as={Link} to="/profile">👤 Hồ sơ của tôi</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>🚪 Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
                <Nav.Link as={Link} to="/register">Đăng ký</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
