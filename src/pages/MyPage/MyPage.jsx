import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardNav from '../../components/Dashboard/DashboardNav';
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
    profileImageUrl: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);

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
        profileImageUrl: user.profileImageUrl || ''
      });
      fetchWeeklySummary();
      fetchSemesterCredits();
    }
  }, [user]);

  const fetchWeeklySummary = async () => {
    try {
      const userId = localStorage.getItem('lumos_uid');
      const res = await axios.get(`http://localhost:8080/api/calendar/events?userId=${userId}`);
      
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);

      const weekly = res.data.filter(item => {
        const d = new Date(item.date);
        return d >= start && d <= end;
      });
      setWeeklyTasks(weekly);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSemesterCredits = async () => {
    try {
      // 1. 활성 학기 찾기
      const semRes = await axios.get('http://localhost:8080/api/semesters');
      const activeSemester = semRes.data.find(s => s.isActive) || semRes.data[0];
      
      if (activeSemester) {
        // 2. 해당 학기의 수업들 가져오기
        const courseRes = await axios.get(`http://localhost:8080/api/semesters/${activeSemester.id}/courses`);
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

    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 제한 (예: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 💡 실제 구현 시에는 여기서 서버나 Firebase Storage에 파일을 업로드하고
    // 받은 URL을 DB에 저장해야 합니다.
    // 현재는 미리보기용으로만 처리하거나 업로드 로직을 추가할 수 있습니다.
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      
      try {
        const userId = localStorage.getItem('lumos_uid');
        const res = await axios.patch(
          'http://localhost:8080/api/users/me/profile-image',
          { profileImageUrl: base64String },
          { headers: { 'X-User-Id': userId } }
        );
        
        const updatedUser = res.data;
        localStorage.setItem('lumos_user_info', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setFormData(prev => ({ ...prev, profileImageUrl: updatedUser.profileImageUrl }));
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = localStorage.getItem('lumos_uid');
      const response = await axios.patch(
        'http://localhost:8080/api/users/me',
        formData,
        {
          headers: {
            'X-User-Id': userId
          }
        }
      );
      
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
    if (!window.confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    
    try {
      const userId = localStorage.getItem('lumos_uid');
      await axios.delete('http://localhost:8080/api/users/me', {
        headers: {
          'X-User-Id': userId
        }
      });
      alert('탈퇴 처리가 완료되었습니다.');
      localStorage.removeItem('lumos_user_info');
      localStorage.removeItem('lumos_uid');
      window.location.href = '/';
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('탈퇴 처리에 실패했습니다.');
    }
  };

  if (!user) {
    return (
      <div className="dashboardPage">
        <DashboardNav user={null} />
        <main className="dashboardMain">
          <div className="myPageContainer empty">
            <p>로그인이 필요한 서비스입니다.</p>
            <button onClick={() => window.location.href = '/login'}>로그인하러 가기</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboardPage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />
      <main className="dashboardMain">
        <div className="myPageContainer">
          <div className="myPageHeader">
            <h2>마이페이지</h2>
            <p>회원님의 정보를 확인하고 수정할 수 있습니다.</p>
          </div>

          <div className="myPageContent">
            <div className="profileSection">
              {/* 숨겨진 파일 입력 필드 */}
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleFileChange}
              />
              <div 
                className="profileImageWrapper" 
                onClick={handleProfileImageClick}
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={formData.profileImageUrl || 'https://via.placeholder.com/150'} 
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
              <button className="myPageLogoutBtn" onClick={handleLogout}>로그아웃</button>
            </div>

            <div className="summarySection">
              <div className="weeklySummary">
                <h4>이번 주 할 일 ({weeklyTasks.length})</h4>
                <ul className="summaryList">
                  {weeklyTasks.slice(0, 3).map(task => (
                    <li key={task.scheduleId}>
                      <span className={`dot ${task.priority}`}></span>
                      {task.title}
                    </li>
                  ))}
                  {weeklyTasks.length > 3 && <li>외 {weeklyTasks.length - 3}건...</li>}
                  {weeklyTasks.length === 0 && <li className="empty">일정이 없습니다.</li>}
                </ul>
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
                    disabled={true} // 학번은 수정 불가
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
                  disabled={true} // 이메일은 수정 불가
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
                  disabled={!isEditing}
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
                    <button 
                      type="submit" 
                      className="saveBtn" 
                      disabled={loading}
                    >
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
              <p>계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
              <button className="withdrawBtn" onClick={handleWithdrawal}>회원 탈퇴</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
