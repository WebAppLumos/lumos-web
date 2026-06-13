export default function ScholarshipResult({ 
  user, 
  userProfile, 
  eligibleScholarships, 
  onEditProfile, 
  onBackToHome 
}) {
  return (
    <div className="results-section">
      <div className="results-header">
        <h2>{user?.name || '사용자'}님을 위한 맞춤 장학금</h2>
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

        <p>총 {eligibleScholarships.length}건의 장학금을 찾았습니다.</p>
        <button className="edit-profile-btn" onClick={onEditProfile}>
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
              <button 
                className="apply-btn"
                onClick={() => {
                  if (s.url) {
                    window.open(s.url, '_blank', 'noopener,noreferrer');
                  } else {
                    alert('상세 정보 페이지가 준비 중입니다.');
                  }
                }}
              >
                상세보기
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6375' }}>
            <p>조건에 맞는 장학금이 없습니다.</p>
          </div>
        )}
      </div>
      <button className="back-to-home" onClick={onBackToHome}>홈으로 돌아가기</button>
    </div>
  )
}
        return profile.certificates.some(cert => cert.score >= 70 && cert.score < 90)
      }
    },
    {
      id: 6,
      name: '자격증 취득 장학금 (C등급)',
      provider: '본교',
      amount: '20만원',
      tag: '자기계발',
      url: 'https://janghak.kmu.ac.kr/janghak/9308/subview.do',
      checkEligibility: (profile) => {
        return profile.certificates.some(cert => cert.score >= 60 && cert.score < 70)
      }
    }
  ]

  const eligibleScholarships = useMemo(() => {
    return allScholarships.filter(s => s.checkEligibility(userProfile))
  }, [userProfile])

  const handleStartCuration = () => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.')
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
    <div className="scholarshipPage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />
      <main className="scholarshipMain">
        {!showProfile && !showResults ? (
          <ScholarshipHero onStartCuration={handleStartCuration} />
        ) : showProfile ? (
          <ScholarshipForm 
            userProfile={userProfile}
            handleProfileChange={handleProfileChange}
            handleRemoveCertificate={handleRemoveCertificate}
            selectedCertId={selectedCertId}
            setSelectedCertId={setSelectedCertId}
            certAcquisitionDate={certAcquisitionDate}
            setCertAcquisitionDate={setCertAcquisitionDate}
            handleAddCertificate={handleAddCertificate}
            handleSave={handleSave}
            onBack={() => setShowProfile(false)}
          />
        ) : (
          <ScholarshipResult 
            user={user}
            userProfile={userProfile}
            eligibleScholarships={eligibleScholarships}
            onEditProfile={() => { setShowProfile(true); setShowResults(false); }}
            onBackToHome={() => setShowResults(false)}
          />
        )}
      </main>
    </div>
  )
}
