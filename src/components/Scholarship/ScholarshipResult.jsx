import './ScholarshipResult.css'

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
        
        <div className="cert-summary">
          <h4>취득 자격증</h4>
          <div className="cert-summary-list">
            {userProfile.certificates.length > 0 ? (
              userProfile.certificates.map((cert, index) => (
                <span key={index} className="cert-summary-item">
                  {cert.name} ({cert.acquisitionDate || cert.date})
                </span>
              ))
            ) : (
              <span className="no-certs">취득한 자격증이 없습니다.</span>
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
              <button className="apply-btn">상세보기</button>
            </div>
          ))
        ) : (
          <div className="empty-results">
            <p>조건에 맞는 장학금이 없습니다.</p>
          </div>
        )}
      </div>
      <button className="back-to-home" onClick={onBackToHome}>홈으로 돌아가기</button>
    </div>
  )
}
