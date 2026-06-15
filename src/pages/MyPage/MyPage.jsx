import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BarChart3, RefreshCw, Shield, UserRound } from 'lucide-react';
import { auth } from '../../lib/firebase';
import api from '../../lib/api';
import { fetchActiveSemesterCredits } from '../../lib/timetable/api';
import { fetchSemesterGrades } from '../../lib/grades/api';
import { formatPhoneNumber } from '../../lib/phoneNumber';
import { getNameValidationMessage, sanitizeNameInput } from '../../lib/name';
import { completeAccountWithdrawal } from '../../lib/auth';
import { useAuth } from '../../app/providers/AuthProvider';
import { useScholarship } from '../../app/providers/ScholarshipProvider';
import EdwardSyncModal from '../../components/MyPage/EdwardSyncModal';
import CertificationManager from '../../components/MyPage/CertificationManager';
import './MyPage.css';

const emptyGradeSummary = {
  totalCompletedCredits: 0,
  averageGpa: 0,
  academicWarningCount: 0,
  lastSyncedAt: null,
  semesters: [],
};

function isAcademicProfileSynced(user) {
  if (!user) return false;

  const major = (user.major || user.department || '').trim();
  const studentNumber = (user.studentNumber || '').trim();
  const grade = user.grade;

  return Boolean(major && studentNumber && grade != null && grade >= 1);
}

export default function MyPage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { user, updateUser, logout, refreshUser } = useAuth();
  const { refreshSession } = useScholarship();

  const [formData, setFormData] = useState({
    name: '',
    major: '',
    grade: '',
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
  const [gradeSummary, setGradeSummary] = useState(emptyGradeSummary);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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
      grade: user.grade ?? '',
      phoneNumber: formatPhoneNumber(user.phoneNumber || ''),
      studentNumber: user.studentNumber || '',
      email: user.email || '',
      profileImage: user.profileImage || '',
    });

    fetchSemesterCredits();
  }, [user]);

  useEffect(() => {
    if (!isWithdrawing) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isWithdrawing]);

  const handleLogout = async () => {
    await logout();
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

        updateUser(updatedUser);
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
      [name]: name === 'name' ? sanitizeNameInput(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameMessage = getNameValidationMessage(formData.name);
    if (nameMessage) {
      alert(nameMessage);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
      };

      const response = await api.patch('/api/users/me', payload);
      const updatedUser = response.data;

      updateUser(updatedUser);
      setIsEditing(false);

      alert('회원 정보가 수정되었습니다.');
    } catch (error) {
      console.error('Update failed:', error);
      const serverMessage = error.response?.data?.message;
      alert(serverMessage || '정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까? 모든 데이터와 계정은 영구적으로 삭제됩니다.')) {
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('로그인 세션이 만료되었습니다. 다시 로그인한 후 탈퇴를 진행해 주세요.');
      handleLogout();
      return;
    }

    setIsWithdrawing(true);

    try {
      await completeAccountWithdrawal(currentUser);

      alert('탈퇴 처리가 완료되었습니다.');
      window.location.href = '/';
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        alert('보안을 위해 다시 로그인한 후 탈퇴를 진행해 주세요.');
        handleLogout();
        return;
      }

      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (status === 401 || status === 403) {
        alert('인증이 만료되었습니다. 다시 로그인한 후 탈퇴를 진행해 주세요.');
        handleLogout();
        return;
      }

      alert(`탈퇴 처리에 실패했습니다. (사유: ${serverMessage || error.message})`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleSelectMenu = (menu) => {
    setActiveMenu(menu);
    if (menu === 'grades') {
      setShowGradeDetails(false);
      setGradeError('');
    }
  };

  const handleViewGrades = async () => {
    setShowGradeDetails(true);
    setGradeLoading(true);
    setGradeError('');

    try {
      const summary = await fetchSemesterGrades();
      setGradeSummary(summary);

      if (!summary.semesters?.length) {
        setGradeError('동기화된 성적이 없습니다. 우측 상단 EDWARD 동기화에서 성적 정보를 선택해 주세요.');
      }
    } catch (err) {
      console.error(err);
      setGradeSummary(emptyGradeSummary);
      setGradeError(err.message || '성적 정보를 불러오지 못했습니다.');
    } finally {
      setGradeLoading(false);
    }
  };

  const handleEdwardSyncSuccess = async ({ syncGrades, syncProfile } = {}) => {
    await refreshUser();
    await fetchSemesterCredits();

    if (syncGrades || syncProfile) {
      await refreshSession();
    }

    if (syncGrades && showGradeDetails) {
      try {
        const summary = await fetchSemesterGrades();
        setGradeSummary(summary);
        setGradeError(summary.semesters?.length
          ? ''
          : '동기화된 성적이 없습니다. EDWARD 동기화에서 성적 정보를 선택해 주세요.');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const semesterGradeData = gradeSummary.semesters || [];
  const academicProfileSynced = isAcademicProfileSynced(user);
  const totalCompletedCredits = gradeSummary.totalCompletedCredits || 0;
  const averageGpa = gradeSummary.averageGpa || 0;
  const academicWarningCount = gradeSummary.academicWarningCount || 0;

  return (
    <div className="dashboardPage">
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
            onSuccess={handleEdwardSyncSuccess}
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
                  {(formData.profileImage || user?.profileImage) ? (
                    <img
                      src={formData.profileImage || user.profileImage}
                      alt="프로필 이미지"
                      className="profileImage"
                    />
                  ) : (
                    <div className="profileImageFallback" aria-hidden="true">
                      {user.name?.[0] || '?'}
                    </div>
                  )}

                  <div className="imageOverlay">변경</div>
                </div>

                <div className="profileBasicInfo">
                  <h3>{user.name}</h3>
                  <span>
                    {academicProfileSynced
                      ? (user.major || user.department)
                      : '학적 정보 미연동'}
                  </span>

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
                  {!academicProfileSynced && (
                    <div className="academicSyncNotice">
                      <p>
                        학번, 학년, 전공은 EDWARD와 연동해야 표시됩니다.
                        상단 <strong>EDWARD 동기화</strong>에서 학적 정보를 선택해 주세요.
                      </p>
                    </div>
                  )}

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
                      disabled
                      className="disabledInput"
                      placeholder={academicProfileSynced ? '' : 'EDWARD 동기화 후 표시됩니다'}
                    />
                  </div>

                  <div className="formGrid">
                    <div className="formGroup">
                      <label>학년</label>
                      {academicProfileSynced ? (
                        <select
                          name="grade"
                          value={formData.grade}
                          disabled
                          className="disabledInput"
                        >
                          <option value={1}>1학년</option>
                          <option value={2}>2학년</option>
                          <option value={3}>3학년</option>
                          <option value={4}>4학년</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="grade"
                          value=""
                          disabled
                          className="disabledInput"
                          placeholder="EDWARD 동기화 후 표시됩니다"
                        />
                      )}
                    </div>

                    <div className="formGroup">
                      <label>학번</label>
                      <input
                        type="text"
                        name="studentNumber"
                        value={formData.studentNumber}
                        disabled
                        className="disabledInput"
                        placeholder={academicProfileSynced ? '' : 'EDWARD 동기화 후 표시됩니다'}
                      />
                    </div>
                  </div>

                  <div className="formGroup">
                    <label>전화번호</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      disabled
                      className="disabledInput"
                      placeholder="010-0000-0000"
                    />
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
                      onClick={handleViewGrades}
                    >
                      성적 보기
                    </button>
                  ) : gradeLoading ? (
                    <p className="gradeLoadingText">성적 정보를 불러오는 중...</p>
                  ) : (
                    <div className="gradeDetails">
                      {gradeError && (
                        <p className="gradeErrorText">{gradeError}</p>
                      )}

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
                          <span>
                            {gradeSummary.lastSyncedAt
                              ? `마지막 동기화 ${new Date(gradeSummary.lastSyncedAt).toLocaleString('ko-KR')}`
                              : '동기화된 성적 없음'}
                          </span>
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
                              {semesterGradeData.length === 0 ? (
                                <tr>
                                  <td colSpan={6}>표시할 성적이 없습니다.</td>
                                </tr>
                              ) : (
                                semesterGradeData.map((item) => (
                                  <tr key={`${item.academicYear}-${item.termCode}`}>
                                    <td>{item.academicYear}</td>
                                    <td>{item.termName}</td>
                                    <td>{item.completedCredits}</td>
                                    <td>{item.registeredCredits}</td>
                                    <td>{item.gpa.toFixed(2)}</td>
                                    <td>{item.academicWarning ? '대상' : '없음'}</td>
                                  </tr>
                                ))
                              )}
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
                          {semesterGradeData.length > 1 ? (
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
                          ) : (
                            <p className="gradeChartEmpty">그래프를 표시하려면 2개 이상의 학기 성적이 필요합니다.</p>
                          )}
                        </div>
                      </section>
                    </div>
                  )}
                </section>
              )}

              {activeMenu === 'certifications' && (
                <div className="certificationPanel">
                  <CertificationManager userId={user?.userId} />
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

                    <button
                      className="withdrawBtn"
                      onClick={handleWithdrawal}
                      disabled={isWithdrawing}
                    >
                      {isWithdrawing ? '탈퇴 처리 중...' : '회원 탈퇴'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isWithdrawing ? (
        <div className="withdrawalOverlay" role="alertdialog" aria-live="assertive" aria-busy="true">
          <div className="withdrawalOverlayCard">
            <span className="withdrawalOverlaySpinner" aria-hidden="true" />
            <p className="withdrawalOverlayTitle">회원 탈퇴 처리 중</p>
            <p className="withdrawalOverlayDesc">완료될 때까지 페이지를 닫거나 이동하지 마세요.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
