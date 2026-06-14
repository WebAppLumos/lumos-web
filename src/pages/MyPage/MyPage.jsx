import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, RefreshCw, Shield, UserRound } from 'lucide-react';
import { deleteUser, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import api from '../../lib/api';
import { clearStoredSession } from '../../lib/session';
import DashboardNav from '../../components/Dashboard/DashboardNav';
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard';
import EdwardSyncModal from '../../components/MyPage/EdwardSyncModal';
import './MyPage.css';

export default function MyPage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
  const [activeMenu, setActiveMenu] = useState('profile');
  const [showGradeDetails, setShowGradeDetails] = useState(false);

  const fetchSemesterCredits = async () => {
    try {
      const semRes = await api.get('/api/semesters');
      const activeSemester = semRes.data.find((s) => s.isActive) || semRes.data[0];

      if (activeSemester) {
        const courseRes = await api.get(`/api/semesters/${activeSemester.id}/courses`);
        const seenCourseIds = new Set();
        const credits = courseRes.data.reduce((acc, curr) => {
          if (seenCourseIds.has(curr.id)) return acc;
          seenCourseIds.add(curr.id);
          return acc + (Number(curr.credit) || 0);
        }, 0);
        setTotalCredits(credits);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  const handleLogout = () => {
    clearStoredSession();
    signOut(auth).catch(() => {});
    navigate('/login');
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
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
      try {
        const res = await api.patch('/api/users/me/profile-image', {
          profileImage: reader.result,
        });

        const updatedUser = res.data;
        localStorage.setItem('lumos_user_info', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setFormData((prev) => ({
          ...prev,
          profileImage: updatedUser.profileImage,
        }));

        alert('프로필 이미지가 변경되었습니다.');
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
    if (!window.confirm('정말 탈퇴하시겠습니까? 모든 데이터와 계정은 영구적으로 삭제됩니다.')) {
      return;
    }

    try {
      await api.delete('/api/users/me');

      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteUser(currentUser);
      }

      alert('탈퇴 처리가 완료되었습니다.');
      clearStoredSession();
      window.location.href = '/';
    } catch (error) {
      console.error('Withdrawal failed:', error);

      if (error.code === 'auth/requires-recent-login') {
        alert('보안을 위해 다시 로그인한 후 탈퇴를 진행해 주세요.');
        handleLogout();
      } else {
        alert(`탈퇴 처리에 실패했습니다. (사유: ${error.response?.data?.message || error.message})`);
      }
    }
  };

  const handleSelectMenu = (menu) => {
    setActiveMenu(menu);
    if (menu === 'grades') {
      setShowGradeDetails(false);
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
              <p>내 정보, 성적, 계정 설정을 한 곳에서 관리합니다.</p>
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
            <aside className="myPageSide">
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
                    alt="프로필 이미지"
                    className="profileImage"
                  />

                  <div className="imageOverlay">변경</div>
                </div>

                <div className="profileBasicInfo">
                  <h3>{user.name}</h3>
                  <span>{user.major || user.department || ''}</span>

                  <div className="creditInfo">
                    이번 학기 신청 학점: <strong>{totalCredits}학점</strong>
                  </div>
                </div>
              </div>

              <nav className="myPageMenu" aria-label="마이페이지 메뉴">
                <button
                  type="button"
                  className={`myPageMenuBtn ${activeMenu === 'profile' ? 'active' : ''}`}
                  onClick={() => handleSelectMenu('profile')}
                >
                  <UserRound size={17} aria-hidden="true" />
                  내 정보 수정
                </button>

                <button
                  type="button"
                  className={`myPageMenuBtn ${activeMenu === 'grades' ? 'active' : ''}`}
                  onClick={() => handleSelectMenu('grades')}
                >
                  <BarChart3 size={17} aria-hidden="true" />
                  성적 정보
                </button>

                <button
                  type="button"
                  className={`myPageMenuBtn ${activeMenu === 'certifications' ? 'active' : ''}`}
                  onClick={() => handleSelectMenu('certifications')}
                >
                  <Award size={17} aria-hidden="true" />
                  자격증 관리
                </button>

                <button
                  type="button"
                  className={`myPageMenuBtn ${activeMenu === 'account' ? 'active' : ''}`}
                  onClick={() => handleSelectMenu('account')}
                >
                  <Shield size={17} aria-hidden="true" />
                  계정 관리
                </button>
              </nav>
            </aside>

            <div className="myPagePanel">
              {activeMenu === 'profile' && (
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
              )}

              {activeMenu === 'profile' && (
                <div className="certificationPanel" style={{ marginTop: '1.5rem' }}>
                  <CertificationManager userId={localStorage.getItem('lumos_uid')} />
                </div>
              )}

              {activeMenu === 'grades' && (
                <section className="gradeAccessPanel">
                  <div className="panelHead">
                    <h4>성적 정보</h4>
                    <p>민감한 정보이므로 성적 보기 버튼을 누른 뒤 표시합니다.</p>
                  </div>

                  {!showGradeDetails ? (
                    <button
                      type="button"
                      className="gradeViewBtn"
                      onClick={() => setShowGradeDetails(true)}
                    >
                      성적 보기
                    </button>
                  ) : (
                    <div className="gradeMetricGrid">
                      <div className="gradeMetric">
                        <span>전체 평점</span>
                        <strong>0.00</strong>
                        <small>/ 4.50</small>
                      </div>

                      <div className="gradeMetric">
                        <span>전공 평점</span>
                        <strong>0.00</strong>
                        <small>/ 4.50</small>
                      </div>

                      <div className="gradeMetric">
                        <span>취득 학점</span>
                        <strong>0</strong>
                        <small>학점</small>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {activeMenu === 'certifications' && (
                <div className="certificationPanel">
                   <CertificationManager userId={localStorage.getItem('lumos_uid')} />
                </div>
              )}

              {activeMenu === 'account' && (
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
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
