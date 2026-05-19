import { useState } from 'react'
import './Scholarship.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('사용자')

  const handleLogin = () => {
    // 임시로 클릭 시 로그인 상태로 전환
    setIsLoggedIn(true)
    setUserName('홍길동') // 예시 이름
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  const [showProfile, setShowProfile] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [userProfile, setUserProfile] = useState({
    major: '컴퓨터공학',
    grade: '3학년',
    gpa: '3.8',
    incomeBracket: '5구간'
  })

  const scholarships = [
    {
      id: 1,
      name: '국가장학금 Ⅰ유형',
      provider: '한국장학재단',
      amount: '학기별 최대 260만원',
      deadline: '2024.06.15까지',
      tag: '소득연계'
    },
    {
      id: 2,
      name: '성적우수 장학금',
      provider: '본교',
      amount: '등록금 전액',
      deadline: '2024.07.01까지',
      tag: '성적'
    },
    {
      id: 3,
      name: '미래 IT 인재 장학금',
      provider: '재단법인 IT미래',
      amount: '연간 500만원',
      deadline: '2024.06.30까지',
      tag: '분야특화'
    }
  ]

  const handleStartCuration = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다. 상단바의 로그인 버튼을 눌러주세요.')
      return
    }
    setShowProfile(true)
    setShowResults(false)
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setUserProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setShowResults(true)
    setShowProfile(false)
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-left">
          <button className="nav-item">일정</button>
          <button className="nav-item">시간표</button>
          <button className="nav-item">추천 장소</button>
        </div>
        <div className="nav-right">
          {isLoggedIn ? (
            <div className="user-info">
              <span>환영합니다, {userName}님!</span>
              <button className="login-btn" onClick={() => { handleLogout(); setShowProfile(false); setShowResults(false); }}>로그아웃</button>
            </div>
          ) : (
            <button className="login-btn" onClick={handleLogin}>로그인</button>
          )}
        </div>
      </nav>
      <main className="main-content">
        {!showProfile && !showResults ? (
          <div className="hero-section">
            <h1>당신에게 딱 맞는 장학금을 찾아보세요</h1>
            <p>개인 맞춤형 장학금 큐레이션 서비스를 시작합니다.</p>
            <button className="curation-start-btn" onClick={handleStartCuration}>
              장학금 큐레이션 시작하기
            </button>
          </div>
        ) : showProfile ? (
          <div className="profile-section">
            <h2>사용자 정보 확인 및 수정</h2>
            <p>더 정확한 장학금 추천을 위해 정보를 입력해 주세요.</p>
            <div className="profile-form">
              <div className="form-group">
                <label>학과</label>
                <input 
                  name="major" 
                  value={userProfile.major} 
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>학년</label>
                <input 
                  name="grade" 
                  value={userProfile.grade} 
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>직전학기 성적 (GPA)</label>
                <input 
                  name="gpa" 
                  value={userProfile.gpa} 
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>소득 분위</label>
                <input 
                  name="incomeBracket" 
                  value={userProfile.incomeBracket} 
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={handleSave}>장학금 조회하기</button>
                <button className="back-btn" onClick={() => setShowProfile(false)}>돌아가기</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <h2>{userName}님을 위한 맞춤 장학금</h2>
              <p>총 {scholarships.length}건의 장학금을 찾았습니다.</p>
              <button className="edit-profile-btn" onClick={() => { setShowProfile(true); setShowResults(false); }}>
                정보 수정하기
              </button>
            </div>
            <div className="scholarship-list">
              {scholarships.map(s => (
                <div key={s.id} className="scholarship-card">
                  <div className="card-tag">{s.tag}</div>
                  <div className="card-info">
                    <h3>{s.name}</h3>
                    <p className="provider">{s.provider}</p>
                    <div className="card-details">
                      <span className="amount">{s.amount}</span>
                      <span className="deadline">{s.deadline}</span>
                    </div>
                  </div>
                  <button className="apply-btn">상세보기</button>
                </div>
              ))}
            </div>
            <button className="back-to-home" onClick={() => setShowResults(false)}>홈으로 돌아가기</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
