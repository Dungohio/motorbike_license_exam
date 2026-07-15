import { Routes, Route, Navigate } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
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
    <Routes>
      {/* Trang công khai: không có sidebar */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Các trang sau đăng nhập: bọc trong layout sidebar */}
      <Route
        element={
          <ProtectedRoute>
            <SidebarLayout />
          </ProtectedRoute>
        }
      >
        {/* User */}
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/exam/result" element={<ExamResultPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<HistoryDetailPage />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/questions" element={<ProtectedRoute adminOnly><AdminQuestions /></ProtectedRoute>} />
        <Route path="/admin/questions/new" element={<ProtectedRoute adminOnly><AdminQuestionForm /></ProtectedRoute>} />
        <Route path="/admin/questions/:id/edit" element={<ProtectedRoute adminOnly><AdminQuestionForm /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
