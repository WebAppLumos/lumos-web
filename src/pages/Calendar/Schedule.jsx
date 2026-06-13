import { useEffect, useState } from 'react';
import api from '../../lib/api';

import Calendar from '../../components/Calendar/Calendar';
import EventModal from '../../components/Calendar/EventModal';
import TodoList from '../../components/Calendar/Todolist';
import DashboardNav from '../../components/Dashboard/DashboardNav';
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard';

import '../Dashboard/Dashboard.css';

import './Schedule.css';

function Schedule() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('lumos_user_info');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // 검색 필터 상태 추가
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('lumos_uid');
      if (!userId) return;

      // 필터 파라미터 구성
      const params = { userId };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;

      const res = await api.get('/api/calendar/events', { params });

      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]); // 카테고리 변경 시 즉시 검색

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
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
        <div className="Dashboard">
          <div className="dashboardHeader">
            <div>
              <h1 className="dashboardTitle">학사 및 개인 일정</h1>
              <p className="dashboardSubtitle">
                중요한 학사 일정과 나의 개인 일정을 한눈에 관리하세요
              </p>
            </div>
          </div>

          <div className="schedule-page">
            {/* 검색 및 필터 바 추가 */}
            <div className="schedule-filter-bar">
              <form onSubmit={handleSearch} className="search-form">
                <input 
                  type="text" 
                  placeholder="일정 키워드 검색..." 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <button type="submit">검색</button>
              </form>

              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">전체 카테고리</option>
                <option value="ACADEMIC">학사</option>
                <option value="HOLIDAY">공휴일</option>
                <option value="STUDY">학업</option>
                <option value="WORK">알바</option>
                <option value="PRIVATE">개인</option>
                <option value="OTHER">기타</option>
              </select>
            </div>

            <div className="schedule-content">
              <div className="calendar-area">
                <Calendar
                  events={events}
                  onDateClick={(date) => {
                    setSelectedDate(date);
                    setModalOpen(true);
                  }}
                />
              </div>

              <div className="todo-area">
                <TodoList items={events} fetchData={fetchData} />
              </div>
            </div>

            <EventModal
              modalOpen={modalOpen}
              closeModal={() => setModalOpen(false)}
              date={selectedDate}
              scheduleItems={events.filter(e => e.date === selectedDate)}
              fetchData={fetchData}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Schedule;