import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { deleteUser } from 'firebase/auth';
import api from '../../lib/api';
import DashboardNav from '../../components/Dashboard/DashboardNav';
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard';
import EdwardSyncModal from '../../components/MyPage/EdwardSyncModal';
import './MyPage.css';

export default function MyPage() {
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('lumos_user_info');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [formData, setFormData] = useState({
    name: '',
    major: '',
    grade: 1,
    phoneNumber: '',
    studentNumber: '',
    email: '',
    profileImage: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCredits, setTotalCredits] = useState(0);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        major: user.major || user.department || '',
        grade: user.grade || 1,
        phoneNumber: user.phoneNumber || '',
        studentNumber: user.studentNumber || '',
        email: user.email || '',
        profileImage: user.profileImage || '',
      });

      fetchSemesterCredits();
    }
  }, [user]);

  const fetchSemesterCredits = async () => {
    try {
      const semRes = await api.get('/api/semesters');
      const activeSemester = semRes.data.find((s) => s.isActive) || semRes.data[0];

      if (activeSemester) {
        const courseRes = await api.get(`/api/semesters/${activeSemester.id}/courses`);
        const credits = courseRes.data.reduce((acc, curr) => acc + (curr.credit || 0), 0);
        setTotalCredits(credits);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lumos_user_info');
    localStorage.removeItem('lumos_uid');
    navigate('/login');
  };

  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        const res = await api.patch('/api/users/me/profile-image', {
          profileImage: base64String,
        });

        const updatedUser = res.data;

        localStorage.setItem('lumos_user_info', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setFormData((prev) => ({
          ...prev,
          profileImage: updatedUser.profileImage,
        }));

        alert('프로필 이미지가 변경 및 저장되었습니다.');
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('이미지 저장에 실패했습니다.');
      }
    };

    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.patch('/api/users/me', formData);
      const updatedUser = response.data;

      localStorage.setItem('lumos_user_info', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);

      alert('회원 정보가 수정되었습니다.');
    } catch (error) {
      console.error('Update failed:', error);
      alert('정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까? 모든 데이터와 계정이 영구적으로 삭제됩니다.')) {
      return;
    }

    try {
      await api.delete('/api/users/me');

      const currentUser = auth.currentUser;

      if (currentUser) {
        await deleteUser(currentUser);
      }

      alert('탈퇴 처리가 완료되었습니다.');
      localStorage.removeItem('lumos_user_info');
      localStorage.removeItem('lumos_uid');
      window.location.href = '/';
    } catch (error) {
      console.error('Withdrawal failed:', error);

      if (error.code === 'auth/requires-recent-login') {
        alert('보안을 위해 다시 로그인한 후 탈퇴를 진행해 주세요.');
        handleLogout();
      } else {
        alert(
          '탈퇴 처리에 실패했습니다. (사유: ' +
            (error.response?.data?.message || error.message) +
            ')'
        );
      }
    }
  };

  if (!user) {
    return (
      <div className="dashboardPage">
        <DashboardNav user={null} />
        <main className="dashboardMain">
          <div className="Dashboard">
            <DashboardLoginCard />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboardPage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />

      <main className="dashboardMain">
        <div className="myPageContainer myPageScope">
          <div className="myPageHeader">
            <div className="myPageHeaderText">
              <h2>마이페이지</h2>
              <p>회원님의 정보를 확인하고 수정할 수 있습니다.</p>
            </div>

            <button
              type="button"
              className="edwardSyncBtn"
              onClick={() => setSyncModalOpen(true)}
            >
              <RefreshCw size={16} aria-hidden="true" />
              EDWARD 동기화
            </button>
          </div>

          <EdwardSyncModal
            open={syncModalOpen}
            onClose={() => setSyncModalOpen(false)}
            onSuccess={fetchSemesterCredits}
          />

          <div className="myPageContent">
            <div className="profileSection">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="profileImageWrapper" onClick={handleProfileImageClick}>
                <img
                  src={formData.profileImage || 'https://via.placeholder.com/150'}
                  alt="프로필"
                  className="profileImage"
                />

                <div className="imageOverlay">변경</div>
              </div>

              <div className="profileBasicInfo">
                <h3>{user.name}</h3>
                <span>{user.major}</span>

                <div className="creditInfo">
                  이번 학기 신청 학점: <strong>{totalCredits}학점</strong>
                </div>
              </div>
            </div>

            <form className="infoForm" onSubmit={handleSubmit}>
              <div className="formGroup">
                <label>이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="formGroup">
                <label>전공</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="formGrid">
                <div className="formGroup">
                  <label>학년</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                    <option value={4}>4학년</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label>학번</label>
                  <input
                    type="text"
                    name="studentNumber"
                    value={formData.studentNumber}
                    disabled
                    className="disabledInput"
                  />
                </div>
              </div>

              <div className="formGroup">
                <label>이메일</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="disabledInput"
                />
              </div>

              <div className="formGroup">
                <label>전화번호</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled
                  className="disabledInput"
                  placeholder="010-0000-0000"
                />
              </div>

              <div className="formActions">
                {!isEditing ? (
                  <button
                    type="button"
                    className="editBtn"
                    onClick={() => setIsEditing(true)}
                  >
                    정보 수정하기
                  </button>
                ) : (
                  <div className="editActions">
                    <button type="submit" className="saveBtn" disabled={loading}>
                      {loading ? '저장 중...' : '저장하기'}
                    </button>

                    <button
                      type="button"
                      className="cancelBtn"
                      onClick={() => setIsEditing(false)}
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
            </form>

            <div className="dangerZone">
              <h4>계정 관리</h4>
              <p>
                계정에서 로그아웃하거나 탈퇴할 수 있습니다. 탈퇴 시 모든 데이터가
                영구적으로 삭제됩니다.
              </p>

              <div className="dangerActions">
                <button className="myPageLogoutBtn" onClick={handleLogout}>
                  로그아웃
                </button>

                <button className="withdrawBtn" onClick={handleWithdrawal}>
                  회원 탈퇴
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}