import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, RefreshCw, Shield, UserRound } from 'lucide-react';
import { deleteUser, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import api from '../../lib/api';
import { fetchActiveSemesterCredits } from '../../lib/timetable/api';
import { clearStoredSession, setStoredUser } from '../../lib/session';
import { useStoredUser } from '../../lib/useStoredUser';
import DashboardNav from '../../components/Dashboard/DashboardNav';
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard';
import EdwardSyncModal from '../../components/MyPage/EdwardSyncModal';
import './MyPage.css';

const semesterGradeData = [
  { academicYear: '2023', term: '1학기', label: '23-1', completedCredits: 0, registeredCredits: 0, gpa: 0, academicWarning: false },
  { academicYear: '2023', term: '2학기', label: '23-2', completedCredits: 0, registeredCredits: 0, gpa: 0, academicWarning: false },
  { academicYear: '2024', term: '1학기', label: '24-1', completedCredits: 0, registeredCredits: 0, gpa: 0, academicWarning: false },
  { academicYear: '2024', term: '2학기', label: '24-2', completedCredits: 0, registeredCredits: 0, gpa: 0, academicWarning: false },
  { academicYear: '2025', term: '1학기', label: '25-1', completedCredits: 0, registeredCredits: 0, gpa: 0, academicWarning: false },
  { academicYear: '2025', term: '2학기', label: '25-2', completedCredits: 0, registeredCredits: 0, gpa: 0, academicWarning: false },
  { academicYear: '2026', term: '1학기', label: '26-1', completedCredits: 0, registeredCredits: 0, gpa: 0, academicWarning: false },
  { academicYear: '2026', term: '2학기', label: '26-2', completedCredits: 0, registeredCredits: 0, gpa: 0, academicWarning: false },
];

const totalCompletedCredits = semesterGradeData.reduce(
  (sum, item) => sum + item.completedCredits,
  0,
);
const averageGpa = semesterGradeData.length
  ? semesterGradeData.reduce((sum, item) => sum + item.gpa, 0) / semesterGradeData.length
  : 0;
const academicWarningCount = semesterGradeData.filter((item) => item.academicWarning).length;

export default function MyPage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [user, setUser] = useStoredUser();

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
      const credits = await fetchActiveSemesterCredits();
      setTotalCredits(credits);
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
      alert('이미지 파일만 업로드할 수 있습니다.');
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

        setStoredUser(updatedUser);
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

      setStoredUser(updatedUser);
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
              <p>회원 정보와 학업 정보를 확인하고 필요한 설정을 관리합니다.</p>
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
                    이번 학기 신청 학점 <strong>{totalCredits}</strong>
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

              {activeMenu === 'grades' && (
                <section className="gradeAccessPanel">
                  <div className="panelHead">
                    <h4>성적 정보</h4>
                    <p>성적 정보는 민감한 정보이므로 확인 버튼을 누른 뒤 표시됩니다.</p>
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
                    <div className="gradeDetails">
                      <div className="gradeMetricGrid">
                        <div className="gradeMetric">
                          <span>총 취득학점</span>
                          <strong>{totalCompletedCredits}</strong>
                          <small>학점</small>
                        </div>

                        <div className="gradeMetric">
                          <span>평균학점</span>
                          <strong>{averageGpa.toFixed(2)}</strong>
                          <small>/ 4.50</small>
                        </div>

                        <div className="gradeMetric">
                          <span>학사경고</span>
                          <strong>{academicWarningCount}</strong>
                          <small>회</small>
                        </div>
                      </div>

                      <section className="semesterGradeTableCard">
                        <div className="semesterGradeHead">
                          <h5>학기별 성적</h5>
                          <span>백엔드 연동 전 기본값</span>
                        </div>

                        <div className="semesterGradeTableWrap">
                          <table className="semesterGradeTable">
                            <thead>
                              <tr>
                                <th>학년도</th>
                                <th>학기</th>
                                <th>이수학점</th>
                                <th>수강신청학점</th>
                                <th>평균학점</th>
                                <th>학사경고</th>
                              </tr>
                            </thead>
                            <tbody>
                              {semesterGradeData.map((item) => (
                                <tr key={`${item.academicYear}-${item.term}`}>
                                  <td>{item.academicYear}</td>
                                  <td>{item.term}</td>
                                  <td>{item.completedCredits}</td>
                                  <td>{item.registeredCredits}</td>
                                  <td>{item.gpa.toFixed(2)}</td>
                                  <td>{item.academicWarning ? '대상' : '없음'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section className="semesterGradeChart">
                        <div className="semesterGradeHead">
                          <h5>학기별 평균학점 추이</h5>
                          <span>GPA / 4.50</span>
                        </div>

                        <div className="gradeLineChart">
                          <svg viewBox="0 0 700 220" role="img" aria-label="학기별 평균학점 선 그래프">
                            {[0, 1.5, 3, 4.5].map((value) => {
                              const y = 180 - (value / 4.5) * 150;
                              return (
                                <g key={value}>
                                  <line
                                    className="gradeGridLine"
                                    x1="40"
                                    y1={y}
                                    x2="680"
                                    y2={y}
                                  />
                                  <text className="gradeAxisText" x="8" y={y + 4}>
                                    {value.toFixed(value === 0 ? 0 : 1)}
                                  </text>
                                </g>
                              );
                            })}

                            <polyline
                              className="gradeLine"
                              points={semesterGradeData
                                .map((item, index) => {
                                  const x = 60 + index * (600 / (semesterGradeData.length - 1));
                                  const y = 180 - (item.gpa / 4.5) * 150;
                                  return `${x},${y}`;
                                })
                                .join(' ')}
                            />

                            {semesterGradeData.map((item, index) => {
                              const x = 60 + index * (600 / (semesterGradeData.length - 1));
                              const y = 180 - (item.gpa / 4.5) * 150;

                              return (
                                <g key={item.label}>
                                  <circle className="gradePoint" cx={x} cy={y} r="5" />
                                  <text className="gradeValueText" x={x} y={y - 12}>
                                    {item.gpa.toFixed(2)}
                                  </text>
                                  <text className="gradeSemesterText" x={x} y="206">
                                    {item.label}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      </section>
                    </div>
                  )}
                </section>
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
