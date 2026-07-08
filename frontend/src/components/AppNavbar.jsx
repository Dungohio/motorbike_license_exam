import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
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
              <>
                <span className="text-white me-3">
                  {user.name} ({user.role})
                </span>
                <Button size="sm" variant="light" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
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
