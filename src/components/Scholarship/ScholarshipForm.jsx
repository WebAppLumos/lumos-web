import certificationsData from '../../data/certifications.json'
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
  showBackButton = false,
  onBack,
}) {
  return (
    <div className="profile-section">
      <h2>사용자 정보 확인 및 수정</h2>
      <p>더 정확한 장학금 추천을 위해 정보를 입력해 주세요.</p>
      <div className="profile-form">
        <p className="readonly-field-note">
          학과, 학년, 직전학기 성적, 이수 학점은 마이페이지 정보에서 자동으로 불러오며 수정할 수 없습니다.
        </p>
        <div className="form-group">
          <label>학과</label>
          <input
            name="major"
            value={userProfile.major}
            disabled
            readOnly
            className="readonly-input"
            placeholder="마이페이지에서 EDWARD 동기화 후 표시됩니다"
          />
        </div>
        <div className="form-group">
          <label>학년</label>
          <input
            name="grade"
            value={userProfile.grade}
            disabled
            readOnly
            className="readonly-input"
            placeholder="마이페이지에서 EDWARD 동기화 후 표시됩니다"
          />
        </div>
        <div className="form-group">
          <div className="score-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>직전학기 성적 (GPA)</label>
              <input
                name="gpa"
                value={userProfile.gpa}
                disabled
                readOnly
                className="readonly-input"
                placeholder="마이페이지 성적 동기화 후 표시됩니다"
              />
            </div>
            <div className="input-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>이수 학점</label>
              <input
                name="credits"
                value={userProfile.credits}
                disabled
                readOnly
                className="readonly-input"
                placeholder="마이페이지 성적 동기화 후 표시됩니다"
              />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>소득 분위</label>
          <select 
            name="incomeBracket" 
            value={userProfile.incomeBracket} 
            onChange={handleProfileChange}
            className="income-select"
          >
            <option value="기초/차상위">기초/차상위</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={`${i + 1}구간`}>{i + 1}구간</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>보유 자격증 목록</label>
          <div className="cert-list-edit">
            {userProfile.certificates.map((cert, index) => (
              <div key={index} className="cert-item-edit">
                <div className="cert-info-text">
                  <strong>{cert.name}</strong> 
                  <span>({cert.acquisitionDate || cert.date})</span>
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
          <button type="button" className="save-btn" onClick={handleSave}>장학금 산출하기</button>
          {showBackButton && (
            <button type="button" className="back-btn" onClick={onBack}>돌아가기</button>
          )}
        </div>
      </div>
    </div>
  )
}
