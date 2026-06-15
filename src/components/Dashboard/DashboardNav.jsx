import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'
import { getDeadlineLabel, getImminentAssignments } from '../../lib/assignmentNotifications'
import { useAssignmentTasks } from '../../lib/useAssignmentTasks'
import GlobalSearchModal from './GlobalSearchModal'
import './DashboardNav.css'

export default function DashboardNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    if (typeof window === 'undefined') return []

    try {
      const storedIds = window.localStorage.getItem('lumos.readAssignmentNotifications')
      return storedIds ? JSON.parse(storedIds) : []
    } catch {
      return []
    }
  })
  const [tasks] = useAssignmentTasks({ enabled: Boolean(user) })
  const [failedAvatarSrc, setFailedAvatarSrc] = useState('')
  const profileImage = user?.profileImage
  const avatarInitial = user?.name?.[0] || ''
  const canShowProfileImage = profileImage && failedAvatarSrc !== profileImage
  const imminentAssignments = user ? getImminentAssignments(tasks) : []
  const unreadAssignments = imminentAssignments.filter(
    (task) => !readNotificationIds.includes(task.notificationId),
  )

  const markNotificationsAsRead = (notificationIds) => {
    const nextIds = Array.from(new Set([...readNotificationIds, ...notificationIds]))
    setReadNotificationIds(nextIds)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lumos.readAssignmentNotifications', JSON.stringify(nextIds))
    }
  }

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

  const handleNotificationClick = () => {
    const willOpen = !isNotificationOpen
    setIsNotificationOpen(willOpen)
    setIsDropdownOpen(false)

    if (willOpen) {
      markNotificationsAsRead(imminentAssignments.map((task) => task.notificationId))
    }
  }

  return (
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
          <>
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
            <div className="navNotification">
              <button
                type="button"
                className="navIconBtn navNotificationBtn"
                aria-label="과제 알림"
                aria-expanded={isNotificationOpen}
                onClick={handleNotificationClick}
              >
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                  <path
                    d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 21h4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
                {unreadAssignments.length > 0 && (
                  <span className="navNotificationBadge">{unreadAssignments.length}</span>
                )}
              </button>

              {isNotificationOpen && (
                <>
                  <button
                    type="button"
                    className="navMenuBackdrop"
                    onClick={() => setIsNotificationOpen(false)}
                    aria-label="과제 알림 닫기"
                  />
                  <div className="navNotificationPanel">
                    <div className="navNotificationHeader">
                      <strong>과제 알림</strong>
                      <span>{imminentAssignments.length}개</span>
                    </div>
                    {imminentAssignments.length > 0 ? (
                      <div className="navNotificationList">
                        {imminentAssignments.map((task) => (
                          <Link
                            key={task.notificationId}
                            to="/assignment"
                            className="navNotificationItem"
                            onClick={() => setIsNotificationOpen(false)}
                          >
                            <div className="navNotificationMeta">
                              <span className="navNotificationDeadline">
                                {getDeadlineLabel(task.diffDays)}
                              </span>
                              <span>{task.deadline}</span>
                            </div>
                            <p>{task.title}</p>
                            <small>{task.course}</small>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="navNotificationEmpty">마감 임박 과제가 없습니다.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}
        {user ? (
          <div className="navUser">
            <button
              type="button"
              className="navAvatar"
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
