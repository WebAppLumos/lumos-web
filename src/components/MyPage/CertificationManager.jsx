import { useState, useEffect } from 'react';
import { scholarshipApi } from '../../lib/scholarshipApi';
import { useAuth } from '../../app/providers/AuthProvider';
import { useScholarship } from '../../app/providers/ScholarshipProvider';
import certificationsData from '../../data/certifications.json';
import './CertificationManager.css';

export default function CertificationManager({ userId }) {
  const { user, updateUser } = useAuth();
  const { refreshSession } = useScholarship();
  const [userCerts, setUserCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [incomeBracket, setIncomeBracket] = useState('5구간');
  const [savingIncomeBracket, setSavingIncomeBracket] = useState(false);

  useEffect(() => {
    if (user?.incomeBracket) {
      const val = String(user.incomeBracket).trim()
      if (val === '기초/차상위' || val.endsWith('구간')) {
        setIncomeBracket(val)
      } else {
        setIncomeBracket(`${val}구간`)
      }
    } else {
      setIncomeBracket('5구간')
    }
  }, [user?.incomeBracket]);

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

  const handleSaveIncomeBracket = async (e) => {
    e.preventDefault();

    try {
      setSavingIncomeBracket(true);
      const response = await scholarshipApi.updateUserProfile({
        incomeBracket: incomeBracket,
      });
      updateUser(response.data);
      await refreshSession(response.data);
      alert('소득 분위가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to update income bracket:', error);
      const serverMessage = error.response?.data?.message;
      alert(serverMessage || '소득 분위 저장에 실패했습니다.');
    } finally {
      setSavingIncomeBracket(false);
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!selectedCertId || !issueDate) return;

    const certInfo = certificationsData.find((c) => c.id === parseInt(selectedCertId));
    if (!certInfo) return;

    const isDuplicate = userCerts?.some((cert) => cert.certName === certInfo.name);
    if (isDuplicate) {
      alert('이미 등록된 자격증입니다.');
      setSelectedCertId('');
      setIssueDate('');
      return;
    }

    try {
      setSubmitting(true);
      await scholarshipApi.addCertification(userId, {
        certName: certInfo.name,
        issueDate: issueDate,
      });
      setSelectedCertId('');
      setIssueDate('');
      await fetchCerts();
      await refreshSession();
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
      await fetchCerts();
      await refreshSession();
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

      <form className="incomeBracketForm" onSubmit={handleSaveIncomeBracket}>
        <h5>소득 분위</h5>
        <p className="incomeBracketDesc">장학금 산출에 사용되는 소득 분위를 설정합니다.</p>
        <div className="incomeBracketControls">
          <select
            className="incomeBracketSelect"
            value={incomeBracket}
            onChange={(e) => setIncomeBracket(e.target.value)}
            required
          >
            <option value="기초/차상위">기초/차상위</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={`${i + 1}구간`}>{i + 1}구간</option>
            ))}
          </select>
          <button
            type="submit"
            className="saveIncomeBracketBtn"
            disabled={savingIncomeBracket}
          >
            {savingIncomeBracket ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>

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
