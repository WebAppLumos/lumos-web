import certificationsData from '../../lib/certifications.json'

export default function ScholarshipForm({ 
  userProfile, 
  handleProfileChange, 
  handleRemoveCertificate, 
  selectedCertId, 
  setSelectedCertId, 
  certAcquisitionDate, 
  setCertAcquisitionDate, 
  handleAddCertificate, 
  handleSave, 
  onBack 
}) {
  return (
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
          <button className="back-btn" onClick={onBack}>돌아가기</button>
        </div>
      </div>
    </div>
  )
}
