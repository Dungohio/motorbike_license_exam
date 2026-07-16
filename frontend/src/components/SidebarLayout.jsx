import { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { Offcanvas, Button } from 'react-bootstrap';
import {
  HouseDoor,
  BookHalf,
  ExclamationTriangle,
  FileEarmarkText,
  ClockHistory,
  PersonCircle,
  Speedometer2,
  ListCheck,
  Tags,
  People,
  BoxArrowRight,
  List,
} from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import AppFooter from './AppFooter';
import logo from '../assets/logo.png';

const USER_MENU = [
  { to: '/', label: 'Trang chủ', icon: HouseDoor, end: true },
  { to: '/practice', label: 'Ôn tập', icon: BookHalf },
  { to: '/practice?critical=true', label: 'Câu điểm liệt', icon: ExclamationTriangle },
  { to: '/exam', label: 'Thi thử', icon: FileEarmarkText },
  { to: '/history', label: 'Lịch sử thi', icon: ClockHistory },
  { to: '/profile', label: 'Hồ sơ của tôi', icon: PersonCircle },
];

const ADMIN_MENU = [
  { to: '/admin', label: 'Tổng quan', icon: Speedometer2, end: true },
  { to: '/admin/questions', label: 'Quản lý câu hỏi', icon: ListCheck },
  { to: '/admin/categories', label: 'Quản lý chủ đề', icon: Tags },
  { to: '/admin/users', label: 'Quản lý tài khoản', icon: People },
];

// Nội dung menu dùng chung cho sidebar desktop và Offcanvas mobile
function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menu = user?.role === 'admin' ? ADMIN_MENU : USER_MENU;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Với link có query (?critical=true) NavLink mặc định không phân biệt,
  // nên tự kiểm tra bằng search hiện tại
  const isCriticalLink = (to) => to.includes('critical=true');

  return (
    <div className="d-flex flex-column h-100">
      <Link to="/" className="sidebar-brand" onClick={onNavigate}>
        <img src={logo} alt="Logo" />
        <span>Ôn thi bằng lái<br />xe máy</span>
      </Link>

      <nav className="sidebar-nav flex-grow-1">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) => {
                // Tách active giữa "Ôn tập" và "Câu điểm liệt" (chung path /practice)
                const critical = isCriticalLink(item.to);
                const hasCritical = window.location.search.includes('critical=true');
                const active =
                  isActive && (critical ? hasCritical : !hasCritical || item.to !== '/practice');
                return `sidebar-link ${active ? 'active' : ''}`;
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <Avatar name={user?.avatar} size={38} />
        <div className="flex-grow-1 overflow-hidden">
          <div className="fw-semibold text-truncate">{user?.name}</div>
          <div className="small opacity-75">{user?.role === 'admin' ? 'Quản trị viên' : 'Học viên'}</div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Đăng xuất">
          <BoxArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// Layout chính sau đăng nhập: sidebar trái (desktop) / Offcanvas (mobile)
export default function SidebarLayout() {
  const [show, setShow] = useState(false);

  return (
    <div className="app-shell">
      {/* Sidebar desktop */}
      <aside className="app-sidebar d-none d-lg-block">
        <SidebarContent />
      </aside>

      {/* Topbar mobile */}
      <div className="app-topbar d-lg-none">
        <Button variant="link" className="text-white p-0" onClick={() => setShow(true)}>
          <List size={26} />
        </Button>
        <img src={logo} alt="Logo" height={32} style={{ borderRadius: '50%' }} />
        <span className="fw-bold text-white">Ôn thi bằng lái xe máy</span>
      </div>

      <Offcanvas show={show} onHide={() => setShow(false)} className="app-sidebar-offcanvas">
        <Offcanvas.Body className="p-0">
          <SidebarContent onNavigate={() => setShow(false)} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Nội dung trang */}
      <div className="app-content d-flex flex-column">
        <main className="container-fluid px-3 px-md-4 py-4 flex-grow-1">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
