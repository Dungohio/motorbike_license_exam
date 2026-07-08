import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar from './components/AppNavbar';
import AppFooter from './components/AppFooter';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import ExamPage from './pages/ExamPage';
import ExamResultPage from './pages/ExamResultPage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetailPage from './pages/HistoryDetailPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminQuestionForm from './pages/admin/AdminQuestionForm';
import AdminCategories from './pages/admin/AdminCategories';

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <Container className="pb-5 flex-grow-1">
        <Routes>
          {/* Công khai */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
          <Route path="/exam" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
          <Route path="/exam/result" element={<ProtectedRoute><ExamResultPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/history/:id" element={<ProtectedRoute><HistoryDetailPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute adminOnly><AdminQuestions /></ProtectedRoute>} />
          <Route path="/admin/questions/new" element={<ProtectedRoute adminOnly><AdminQuestionForm /></ProtectedRoute>} />
          <Route path="/admin/questions/:id/edit" element={<ProtectedRoute adminOnly><AdminQuestionForm /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <AppFooter />
    </div>
  );
}
