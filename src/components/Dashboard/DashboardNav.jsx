import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'
import { getProfileImageUrl } from '../../lib/profile'
import GlobalSearchModal from './GlobalSearchModal'
import './DashboardNav.css'

export default function DashboardNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // 사용자 메뉴 열림 여부
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const profileImage = getProfileImageUrl(avatarLoadFailed ? null : user?.profileImage)

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [user?.profileImage])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await logout()
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
        {user ? (
          <button
            type="button"
            className="navIconBtn"
            aria-label="검색"
            onClick={() => setIsSearchOpen(true)}
          >
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
        ) : null}
        {user ? (
          <div className="navUser">
            <button
              type="button"
              className="navAvatar"
              // 사용자 메뉴 열기/닫기
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="사용자 메뉴"
            >
              <img
                src={profileImage}
                alt=""
                className="navAvatarImage"
                onError={() => setAvatarLoadFailed(true)}
              />
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

      {user ? (
        <GlobalSearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      ) : null}
    </header>
  )
}
