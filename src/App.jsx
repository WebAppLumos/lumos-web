import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Root } from './pages/Root';
import { Dashboard } from './pages/Dashboard';
import { Scholarships } from './pages/Scholarships';
import { Diary } from './pages/Diary';
import { TimetableView } from './pages/TimetableView';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 인증 라우트 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 메인 애플리케이션 라우트 (Root 레이아웃) */}
          <Route element={<Root />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/timetable" element={<TimetableView />} />
          </Route>

          {/* 404 처리 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
