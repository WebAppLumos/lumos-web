import { Routes, Route } from 'react-router-dom'
import ProtectedLayout from './layouts/ProtectedLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Timetable from './pages/Timetable/Timetable'
import Schedule from './pages/Calendar/Schedule'
import Assignment from './pages/Assignment/Assignment'
import Scholarship from './pages/Scholarship/Scholarship'
import MapPage from './pages/MapPage/MapPage'
import Signin from './pages/Signin/Signin'
import Signup from './pages/Signup/Signup'
import MyPage from './pages/MyPage/MyPage'

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/assignment" element={<Assignment />} />
        <Route path="/scholarship" element={<Scholarship />} />
        <Route path="/mappage" element={<MapPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Route>
    </Routes>
  )
}
