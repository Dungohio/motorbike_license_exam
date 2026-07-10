import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function AppFooter() {
  return (
    <footer className="app-footer mt-auto">
      <Container className="py-4">
        <Row className="gy-3">
          <Col md={5}>
            <div className="fw-bold fs-5 mb-1"> Ôn thi bằng lái xe máy</div>
            <div className="small opacity-75">
              Nền tảng ôn luyện lý thuyết thi bằng lái xe máy các hạng A1, A2, A3
              theo bộ đề chuẩn Việt Nam.
            </div>
          </Col>
          <Col md={4}>
            <div className="fw-bold mb-2">Lối tắt</div>
            <div className="d-flex flex-column gap-1 small">
              <Link to="/practice" className="footer-link">Ôn tập theo chủ đề</Link>
              <Link to="/practice?critical=true" className="footer-link">Ôn câu điểm liệt</Link>
              <Link to="/exam" className="footer-link">Thi thử</Link>
              <Link to="/history" className="footer-link">Lịch sử thi</Link>
            </div>
          </Col>
          <Col md={3}>
            <div className="fw-bold mb-2">Dự án</div>
            <div className="small opacity-75">
              Đồ án môn SDN302<br />
              Express · MongoDB · React
            </div>
          </Col>
        </Row>
        <hr className="border-light opacity-25 my-3" />
        <div className="small text-center opacity-75">
          © 2026 Ôn thi bằng lái xe máy. Chúc bạn thi đậu ngay lần đầu! 🎉
        </div>
      </Container>
    </footer>
  );
}
