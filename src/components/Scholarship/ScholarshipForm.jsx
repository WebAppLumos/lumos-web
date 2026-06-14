import certificationsData from '../../lib/certifications.json'
import './ScholarshipForm.css'

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
          <div className="score-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>직전학기 성적 (GPA)</label>
              <input 
                name="gpa" 
                value={userProfile.gpa} 
                onChange={handleProfileChange}
                placeholder="예: 3.5"
              />
            </div>
            <div className="input-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
              <div key={index} className="cert-item-edit">
                <div className="cert-info-text">
                  <strong>{cert.name}</strong> 
                  <span>({cert.date})</span>
                </div>
                <button onClick={() => handleRemoveCertificate(index)}>삭제</button>
              </div>
            ))}
          </div>
          
          <div className="add-cert-form">
            <h4>새 자격증 추가</h4>
            <div className="add-cert-controls">
              <select 
                value={selectedCertId} 
                onChange={(e) => setSelectedCertId(e.target.value)}
              >
                <option value="">자격증 선택...</option>
                {certificationsData.map(cert => (
                  <option key={cert.id} value={cert.id}>{cert.name}</option>
                ))}
              </select>
              <div className="date-add-row">
                <input 
                  type="date" 
                  value={certAcquisitionDate}
                  onChange={(e) => setCertAcquisitionDate(e.target.value)}
                />
                <button className="add-btn" onClick={handleAddCertificate}>추가</button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>TOEIC 성적</label>
          <div className="toeic-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="input-label">현재 점수</span>
              <input 
                name="toeic" 
                value={userProfile.toeic} 
                onChange={handleProfileChange} 
                placeholder="현재 점수" 
              />
            </div>
            <div className="input-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="input-label">이전 점수</span>
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
