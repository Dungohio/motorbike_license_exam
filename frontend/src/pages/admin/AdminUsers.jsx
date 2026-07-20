import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Form, Badge, Pagination, Spinner, Card, Modal, InputGroup,
} from 'react-bootstrap';
import {
  People, Search, Trash, LockFill, UnlockFill, PersonGear, ExclamationTriangleFill,
} from 'react-bootstrap-icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // Hành động chờ xác nhận: { type: 'role' | 'lock' | 'delete', user }
  const [action, setAction] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search.trim()) params.search = search.trim();
    const res = await api.get('/users', { params });
    setData(res.data);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmAction = async () => {
    setError('');
    const { type, user } = action;
    try {
      if (type === 'role') {
        await api.put(`/users/${user._id}/role`, {
          role: user.role === 'admin' ? 'user' : 'admin',
        });
      } else if (type === 'lock') {
        await api.put(`/users/${user._id}/lock`);
      } else if (type === 'delete') {
        await api.delete(`/users/${user._id}`);
      }
      setAction(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  // Nội dung modal theo từng loại hành động
  const modalContent = action && {
    role: {
      title: 'Đổi vai trò?',
      body: (
        <>Đổi vai trò của <strong>{action.user.name}</strong> thành{' '}
          <Badge bg={action.user.role === 'admin' ? 'secondary' : 'primary'}>
            {action.user.role === 'admin' ? 'user' : 'admin'}
          </Badge>?
        </>
      ),
      variant: 'primary',
      confirmText: 'Đổi vai trò',
    },
    lock: {
      title: action.user.isLocked ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?',
      body: action.user.isLocked ? (
        <>Cho phép <strong>{action.user.name}</strong> đăng nhập trở lại?</>
      ) : (
        <><strong>{action.user.name}</strong> sẽ không thể đăng nhập cho đến khi được mở khóa.</>
      ),
      variant: action.user.isLocked ? 'success' : 'warning',
      confirmText: action.user.isLocked ? 'Mở khóa' : 'Khóa',
    },
    delete: {
      title: 'Xóa tài khoản?',
      body: (
        <>
          Xóa vĩnh viễn tài khoản <strong>{action.user.name}</strong> ({action.user.email})
          cùng <strong>toàn bộ lịch sử thi</strong> của họ?
          <div className="text-danger small mt-2">
            <ExclamationTriangleFill className="me-1" />Hành động này không thể hoàn tác.
          </div>
        </>
      ),
      variant: 'danger',
      confirmText: 'Xóa vĩnh viễn',
    },
  }[action.type];

  return (
    <div>
      <h3 className="text-brand fw-bold mb-3">
        <People className="me-2" />Quản lý tài khoản
        <Badge bg="secondary" className="ms-2 fs-6">{data.total}</Badge>
      </h3>

      <Card className="mb-3">
        <Card.Body className="py-3">
          <InputGroup style={{ maxWidth: 420 }}>
            <InputGroup.Text><Search /></InputGroup.Text>
            <Form.Control
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <Card className="">
            <Table responsive className="mb-0 align-middle">
              <thead>
                <tr className="table-light">
                  <th>Tài khoản</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Số lần thi</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => {
                  const isSelf = u._id === me?._id;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Avatar name={u.avatar} size={34} />
                          <div>
                            <div className="fw-semibold">
                              {u.name}
                              {isSelf && <Badge bg="light" text="dark" className="ms-2">Bạn</Badge>}
                            </div>
                            <div className="small text-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={u.role === 'admin' ? 'primary' : 'secondary'}>{u.role}</Badge>
                      </td>
                      <td>
                        <Badge bg={u.isLocked ? 'danger' : 'success'}>
                          {u.isLocked ? 'Bị khóa' : 'Hoạt động'}
                        </Badge>
                      </td>
                      <td className="small">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>{u.examAttempts}</td>
                      <td className="text-end text-nowrap">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-1"
                          title="Đổi vai trò"
                          disabled={isSelf}
                          onClick={() => setAction({ type: 'role', user: u })}
                        >
                          <PersonGear />
                        </Button>
                        <Button
                          size="sm"
                          variant={u.isLocked ? 'outline-success' : 'outline-warning'}
                          className="me-1"
                          title={u.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                          disabled={isSelf}
                          onClick={() => setAction({ type: 'lock', user: u })}
                        >
                          {u.isLocked ? <UnlockFill /> : <LockFill />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          title="Xóa tài khoản"
                          disabled={isSelf}
                          onClick={() => setAction({ type: 'delete', user: u })}
                        >
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Không tìm thấy tài khoản nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>

          {data.totalPages > 1 && (
            <Pagination className="mt-3">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}

      {/* Modal xác nhận hành động */}
      <Modal show={!!action} onHide={() => { setAction(null); setError(''); }} centered>
        {action && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="fs-5">{modalContent.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {modalContent.body}
              {error && <div className="alert alert-danger py-2 mt-3 mb-0">{error}</div>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => { setAction(null); setError(''); }}>
                Hủy
              </Button>
              <Button variant={modalContent.variant} onClick={confirmAction}>
                {modalContent.confirmText}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}
