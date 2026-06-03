import { useState, useMemo } from 'react'
import './Scholarship.css'
import certificationsData from './certifications.json'

export default function Scholarship() {
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
  
  // 자격증 추가를 위한 상태
  const [selectedCertId, setSelectedCertId] = useState('')
  const [certAcquisitionDate, setCertAcquisitionDate] = useState('')

  const [userProfile, setUserProfile] = useState({
    major: '컴퓨터공학',
    grade: '3학년',
    gpa: '3.8',
    credits: '15',
    incomeBracket: '5구간',
    certificates: [
      { name: '정보처리기사', date: '2023-11-20', score: 100 }
    ],
    toeic: '850',
    prevToeic: '650'
  })

  const allScholarships = [
    {
      id: 1,
      name: '국가장학금 Ⅰ유형',
      provider: '한국장학재단',
      amount: '학기별 최대 260만원',
      tag: '소득연계',
      checkEligibility: (profile) => {
        const credits = parseInt(profile.credits) || 0
        const gpa = parseFloat(profile.gpa) || 0
        return credits >= 12 && gpa >= 2.51
      }
    },
    {
      id: 2,
      name: '성적우수 장학금',
      provider: '본교',
      amount: '등록금 전액',
      tag: '성적',
      checkEligibility: (profile) => {
        const credits = parseInt(profile.credits) || 0
        const gpa = parseFloat(profile.gpa) || 0
        return credits >= 15 && gpa >= 4.0
      }
    },
    {
      id: 3,
      name: '공인토익성적향상격려장학',
      provider: '본교',
      amount: '50만원',
      tag: '자기계발',
      checkEligibility: (profile) => {
        const currentToeic = parseInt(profile.toeic) || 0
        const prevToeic = parseInt(profile.prevToeic) || 0
        const isPrevInBracket = prevToeic >= 600 && prevToeic <= 699
        const isCurrentImproved = currentToeic >= 700 && currentToeic <= 990
        return isPrevInBracket && isCurrentImproved
      }
    },
    {
      id: 4,
      name: '자격증 취득 장학금 (A등급)',
      provider: '본교',
      amount: '50만원',
      tag: '자기계발',
      checkEligibility: (profile) => {
        return profile.certificates.some(cert => cert.score >= 90)
      }
    },
    {
      id: 5,
      name: '자격증 취득 장학금 (B등급)',
      provider: '본교',
      amount: '30만원',
      tag: '자기계발',
      checkEligibility: (profile) => {
        return profile.certificates.some(cert => cert.score >= 70 && cert.score < 90)
      }
    },
    {
      id: 6,
      name: '자격증 취득 장학금 (C등급)',
      provider: '본교',
      amount: '20만원',
      tag: '자기계발',
      checkEligibility: (profile) => {
        return profile.certificates.some(cert => cert.score >= 60 && cert.score < 70)
      }
    }
  ]

  const eligibleScholarships = useMemo(() => {
    return allScholarships.filter(s => s.checkEligibility(userProfile))
  }, [userProfile])

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

  const handleAddCertificate = () => {
    if (!selectedCertId || !certAcquisitionDate) {
      alert('자격증과 취득일을 모두 선택해주세요.')
      return
    }

    const certInfo = certificationsData.find(c => c.id === parseInt(selectedCertId))
    if (certInfo) {
      const newCert = {
        name: certInfo.name,
        date: certAcquisitionDate,
        score: certInfo.score
      }
      
      setUserProfile(prev => ({
        ...prev,
        certificates: [...prev.certificates, newCert]
      }))
      
      // 초기화
      setSelectedCertId('')
      setCertAcquisitionDate('')
    }
  }

  const handleRemoveCertificate = (index) => {
    setUserProfile(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    setShowResults(true)
    setShowProfile(false)
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-left">
          <button className="nav-item">대쉬보드</button>
          <button className="nav-item">과제</button>
          <button className="nav-item">캘린더</button>
          <button className="nav-item">시간표</button>
          <button className="nav-item">캠퍼스맵</button>
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
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>직전학기 성적 (GPA)</label>
                    <input 
                      name="gpa" 
                      value={userProfile.gpa} 
                      onChange={handleProfileChange}
                      placeholder="예: 3.5"
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>이수 학점</label>
                    <input 
                      name="credits" 
                      value={userProfile.credits} 
                      onChange={handleProfileChange}
                      placeholder="예: 15"
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>소득 분위</label>
                <input 
                  name="incomeBracket" 
                  value={userProfile.incomeBracket} 
                  onChange={handleProfileChange}
                />
              </div>
              
              <div className="form-group">
                <label>보유 자격증 목록</label>
                <div className="cert-list-edit">
                  {userProfile.certificates.map((cert, index) => (
                    <div key={index} className="cert-item-edit" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      backgroundColor: '#f8f9fa',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{ fontSize: '0.9rem' }}>
                        <strong style={{ color: '#aa3bff' }}>{cert.name}</strong> 
                        <span style={{ marginLeft: '10px', color: '#6b6375' }}>({cert.date})</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveCertificate(index)}
                        style={{ 
                          background: '#ff4d4f', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          padding: '2px 8px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >삭제</button>
                    </div>
                  ))}
                </div>
                
                <div className="add-cert-form" style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  border: '1px dashed #aa3bff', 
                  borderRadius: '8px',
                  backgroundColor: '#aa3bff05'
                }}>
                  <h4 style={{ margin: '0 0 0.8rem 0', color: '#aa3bff' }}>새 자격증 추가</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <select 
                      value={selectedCertId} 
                      onChange={(e) => setSelectedCertId(e.target.value)}
                      style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #e5e4e7' }}
                    >
                      <option value="">자격증 선택...</option>
                      {certificationsData.map(cert => (
                        <option key={cert.id} value={cert.id}>{cert.name}</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="date" 
                        value={certAcquisitionDate}
                        onChange={(e) => setCertAcquisitionDate(e.target.value)}
                        style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #e5e4e7' }}
                      />
                      <button 
                        onClick={handleAddCertificate}
                        style={{ 
                          padding: '0.6rem 1.2rem', 
                          backgroundColor: '#aa3bff', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >추가</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>TOEIC 성적</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b6375', fontWeight: 600 }}>현재 점수</span>
                    <input 
                      name="toeic" 
                      value={userProfile.toeic} 
                      onChange={handleProfileChange} 
                      placeholder="현재 점수" 
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b6375', fontWeight: 600 }}>이전 점수</span>
                    <input 
                      name="prevToeic" 
                      value={userProfile.prevToeic} 
                      onChange={handleProfileChange} 
                      placeholder="이전 점수" 
                    />
                  </div>
                </div>
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
              <div className="user-profile-summary">
                <span>{userProfile.major}</span>
                <span>{userProfile.grade}</span>
                <span>GPA {userProfile.gpa}</span>
                <span>{userProfile.credits}학점 이수</span>
                <span>{userProfile.incomeBracket}</span>
                {userProfile.toeic && <span>현재 TOEIC {userProfile.toeic}</span>}
                {userProfile.prevToeic && <span>이전 TOEIC {userProfile.prevToeic}</span>}
              </div>
              
              <div className="cert-summary" style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#6b6375' }}>취득 자격증</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {userProfile.certificates.length > 0 ? (
                    userProfile.certificates.map((cert, index) => (
                      <span key={index} style={{ 
                        backgroundColor: '#aa3bff10', 
                        color: '#aa3bff', 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        border: '1px solid #aa3bff30'
                      }}>
                        {cert.name} ({cert.date})
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#6b6375', fontSize: '0.85rem' }}>취득한 자격증이 없습니다.</span>
                  )}
                </div>
              </div>

              <p>총 {eligibleScholarships.length}건의장학금을 찾았습니다.</p>
              <button className="edit-profile-btn" onClick={() => { setShowProfile(true); setShowResults(false); }}>
                정보 수정하기
              </button>
            </div>
            <div className="scholarship-list">
              {eligibleScholarships.length > 0 ? (
                eligibleScholarships.map(s => (
                  <div key={s.id} className="scholarship-card">
                    <div className="card-tag">{s.tag}</div>
                    <div className="card-info">
                      <h3>{s.name}</h3>
                      <p className="provider">{s.provider}</p>
                      <div className="card-details">
                        <span className="amount">{s.amount}</span>
                      </div>

                    </div>
                    <button className="apply-btn">상세보기</button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6375' }}>
                  <p>조건에 맞는 장학금이 없습니다.</p>
                </div>
              )}
            </div>
            <button className="back-to-home" onClick={() => setShowResults(false)}>홈으로 돌아가기</button>
          </div>
        )}
      </main>
    </div>
  )
}
