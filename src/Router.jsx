import { Navigate, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import Timetable from './pages/Timetable/Timetable'
import Signin from './pages/Signin/Signin'
import Signup from './pages/Signup/Signup'

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/timetable" element={<Timetable />} />
      <Route path="/login" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/Timetable" element={<Navigate to="/timetable" replace />} />
      <Route path="/Signin" element={<Navigate to="/login" replace />} />
      <Route path="/Signup" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}
