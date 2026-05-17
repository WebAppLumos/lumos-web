import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { GraduationCap, User, Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Root.module.css";

export function Root() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.appContainer}>
      {/* Top Navigation Bar */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Left: Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <GraduationCap className={styles.logoIcon} style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <span className={styles.logoText}>UniDash</span>
          </Link>

          {/* Center: Navigation Menu */}
          <nav className={styles.navMenu}>
            <NavItem to="/" label="대시보드" end />
            <NavItem to="/timetable" label="시간표" />
            <NavItem to="/scholarships" label="장학금" />
            <NavItem to="/diary" label="다이어리" />
          </nav>

          {/* Right: User Actions */}
          <div className={styles.headerActions}>
            <button className={styles.btnIcon}>
              <Search className={styles.btnIconMedium} />
            </button>

            {user ? (
              <>
                <button className={styles.btnIcon} style={{ position: 'relative' }}>
                  <Bell className={styles.btnIconMedium} />
                  <span className={styles.notificationBadge}></span>
                </button>

                <div className={styles.dropdown}>
                  <button className={styles.btnIcon}>
                    <div className={styles.userAvatar}>
                      {user.name?.[0] || '김'}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <p>{user.name || '김대학'}</p>
                      <span>{user.department || '컴퓨터공학과'}</span>
                    </div>
                    <Link to="/profile" className={styles.dropdownItem}>
                      <User style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', display: 'inline' }} />
                      마이페이지
                    </Link>
                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}>
                      <LogOut style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', display: 'inline' }} />
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.btnSecondary}>
                  로그인
                </Link>
                <Link to="/signup" className={styles.btnPrimary}>
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.appMain}>
        <div className={styles.mainContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
    >
      {label}
    </NavLink>
  );
}
