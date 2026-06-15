import { useState, useEffect } from 'react';
import { scholarshipApi } from '../../lib/scholarshipApi';
import certificationsData from '../../data/certifications.json';
import './CertificationManager.css';

export default function CertificationManager({ userId }) {
  const [userCerts, setUserCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState('');
  const [issueDate, setIssueDate] = useState('');

  const fetchCerts = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await scholarshipApi.getCertifications(userId);
      setUserCerts(res.data || []);
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, [userId]);

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!selectedCertId || !issueDate) return;

    const certInfo = certificationsData.find((c) => c.id === parseInt(selectedCertId));
    if (!certInfo) return;

    try {
      setSubmitting(true);
      await scholarshipApi.addCertification(userId, {
        certName: certInfo.name,
        issueDate: issueDate,
      });
      setSelectedCertId('');
      setIssueDate('');
      fetchCerts();
    } catch (error) {
      console.error('Failed to add certification:', error);
      alert('자격증 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!window.confirm('이 자격증을 삭제하시겠습니까?')) return;

    try {
      await scholarshipApi.deleteCertification(certId);
      fetchCerts();
    } catch (error) {
      console.error('Failed to delete certification:', error);
      alert('자격증 삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="certificationManager">로딩 중...</div>;

  return (
    <div className="certificationManager">
      <h4>자격증 관리</h4>
      <p>보유 중인 자격증을 등록하고 관리하세요. 장학금 산출에 활용됩니다.</p>

      <div className="certList">
        {userCerts.length === 0 ? (
          <div className="certEmpty">등록된 자격증이 없습니다.</div>
        ) : (
          userCerts.map((cert) => (
            <div key={cert.certId} className="certItem">
              <div className="certInfo">
                <span className="certName">{cert.certName}</span>
                <span className="certDate">취득일: {cert.issueDate}</span>
              </div>
              <button
                type="button"
                className="deleteCertBtn"
                onClick={() => handleDeleteCert(cert.certId)}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>

      <form className="addCertForm" onSubmit={handleAddCert}>
        <h5>새 자격증 추가</h5>
        <div className="addCertControls">
          <select
            className="certSelect"
            value={selectedCertId}
            onChange={(e) => setSelectedCertId(e.target.value)}
            required
          >
            <option value="">자격증 선택</option>
            {certificationsData.map((cert) => (
              <option key={cert.id} value={cert.id}>
                {cert.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="certDateInput"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
          <button
            type="submit"
            className="addCertBtn"
            disabled={submitting || !selectedCertId || !issueDate}
          >
            {submitting ? '추가 중...' : '자격증 추가'}
          </button>
        </div>
      </form>
    </div>
  );
}
