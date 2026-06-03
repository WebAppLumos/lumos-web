import './Sidebar.css';

export default function Sidebar() {
  const menuItems = [
    { id: 'home', label: '홈 화면', isActive: false },
    { id: 'assignment', label: '과제 알림', isActive: false },
    { id: 'schedule', label: '일정 관리', isActive: false },
    { id: 'navigation', label: '캠퍼스 내비게이션', isActive: false },
    { id: 'timetable', label: '시간표 관리', isActive: false },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box">🎓</div>
        <h1 className="logo-text">Lumos</h1>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.id} className={item.isActive ? 'active' : ''}>{item.label}</li>))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="auth-btn">로그인 / 회원가입</button>
      </div>
    </div>
  );
}
