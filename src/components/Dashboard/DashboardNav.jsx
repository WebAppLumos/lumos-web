import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { clearStoredSession } from '../../lib/session'
import './DashboardNav.css'

export default function DashboardNav({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // 사용자 메뉴 열림 여부
  const [failedAvatarSrc, setFailedAvatarSrc] = useState('')
  const profileImage = user?.profileImage
  const avatarInitial = user?.name?.[0] || ''
  const canShowProfileImage = profileImage && failedAvatarSrc !== profileImage

  const handleLogout = () => {
    clearStoredSession()
    signOut(auth).catch(() => {})
    setIsDropdownOpen(false)
    if (onLogout) onLogout()
    navigate('/')
  }

  const handleBrandClick = (event) => {
    event.preventDefault()
    if (location.pathname === '/') {
      window.location.reload()
    } else {
      window.location.href = '/'
    }
  }

  return (
    // Dashboard 상단 공통 내비게이션
    <header className="dashboardNav">
      <a href="/" className="navBrand" onClick={handleBrandClick}>
        <span className="navLogo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M3 8.5 12 4l9 4.5-9 4.5L3 8.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M7 11v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="navTitle">UniDash</span>
      </a>

      <nav className="navLinks">
        <NavLink
          to="/"
          className={({ isActive }) => `navLink ${isActive ? 'active' : ''}`}
        >
          대시보드
        </NavLink>
        <NavLink
          to="/timetable"
          className={({ isActive }) => `navLink ${isActive ? 'active' : ''}`}
        >
          시간표
        </NavLink>
        <NavLink
          to="/schedule"
          className={({ isActive }) => `navLink ${isActive ? 'active' : ''}`}
        >
          일정
        </NavLink>
        <NavLink
          to="/assignment"
          className={({ isActive }) => `navLink ${isActive ? 'active' : ''}`}
        >
          과제
        </NavLink>
        <NavLink
          to="/scholarship"
          className={({ isActive }) => `navLink ${isActive ? 'active' : ''}`}
        >
          장학금
        </NavLink>
        <NavLink
          to="/mappage"
          className={({ isActive }) => `navLink ${isActive ? 'active' : ''}`}
        >
          캠퍼스맵
        </NavLink>
      </nav>

      <div className="navActions">
        <button type="button" className="navIconBtn" aria-label="검색">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <circle
              cx="11"
              cy="11"
              r="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m16 16 4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {user ? (
          <div className="navUser">
            <button
              type="button"
              className="navAvatar"
              // 사용자 메뉴 열기/닫기
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="사용자 메뉴"
            >
              {canShowProfileImage ? (
                <img
                  src={profileImage}
                  alt=""
                  className="navAvatarImage"
                  onError={() => setFailedAvatarSrc(profileImage)}
                />
              ) : (
                avatarInitial
              )}
            </button>


            {isDropdownOpen && (
              <>
                <button
                  type="button"
                  className="navMenuBackdrop"
                  // 메뉴 바깥 클릭 시 닫기
                  onClick={() => setIsDropdownOpen(false)}
                  aria-label="사용자 메뉴 닫기"
                />
                <div className="navUserMenu">
                  <div className="navUserInfo">
                    <p>{user.name || ''}</p>
                    <span>{user.major || user.department || ''}</span>
                  </div>




                  <Link
                    to="/mypage"
                    className="navMyPageLink"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <button
                    type="button"
                    className="navLogout"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="navLogin">로그인</Link>
            <Link to="/signup" className="navSignup">회원가입</Link>
          </>
        )}
      </div>
    </header>
  )
}
