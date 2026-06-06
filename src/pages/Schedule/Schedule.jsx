import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from '../../components/Schedule/Calendar';
import TodoList from '../../components/Schedule/Todolist';
import EventModal from '../../components/Schedule/EventModal';
import DashboardNav from '../../components/Dashboard/DashboardNav';
import './Schedule.css';

function Schedule() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('unidash_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([]);

  const API_URL = 'http://localhost:8080/api/calendar/events';

  // 1. 초기 렌더링 시 데이터 가져오기
  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const id = user?.userId || user?.id || 'user-1';
      const response = await axios.get(`${API_URL}?userId=${id}`);
      const mappedData = response.data.map(item => ({
        ...item,
        id: item.scheduleId 
      }));
      setScheduleItems(mappedData);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  // ... (중략)

  // 2. 일정 추가
  async function addScheduleItem(newItem) {
    try {
      const id = user?.userId || user?.id || 'user-1';
      const requestData = {
        title: newItem.title,
        content: newItem.content,
        date: newItem.date,
        category: newItem.category,
        userId: id,
        isCompleted: false
      };
      
      const response = await axios.post(API_URL, requestData);
      const addedItem = { ...response.data, id: response.data.scheduleId };
      setScheduleItems((prev) => [...prev, addedItem]);
    } catch (error) {
      alert("일정 추가에 실패했습니다.");
    }
  }

  // 3. 일정 삭제
  async function deleteScheduleItem(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setScheduleItems((prev) => prev.filter((item) => item.scheduleId !== id));
    } catch (error) {
      alert("일정 삭제에 실패했습니다.");
    }
  }

  // 4. 일정 수정
  async function updateScheduleItem(updatedItem) {
    try {
      const id = user?.userId || user?.id || 'user-1';
      const response = await axios.patch(`${API_URL}/${updatedItem.id}`, {
        title: updatedItem.title,
        content: updatedItem.content,
        date: updatedItem.date,
        category: updatedItem.category,
        userId: id
      });
      const fixedItem = { ...response.data, id: response.data.scheduleId };
      setScheduleItems((prev) =>
        prev.map((item) => (item.scheduleId === updatedItem.id ? fixedItem : item))
      );
    } catch (error) {
      alert("일정 수정에 실패했습니다.");
    }
  }

  // 5. 완료 상태 토글 (Todo 용)
  async function toggleTodoItem(id) {
    try {
      const response = await axios.patch(`${API_URL}/${id}/toggle`);
      const updated = { ...response.data, id: response.data.scheduleId };
      setScheduleItems((prev) =>
        prev.map((item) => (item.scheduleId === id ? updated : item))
      );
    } catch (error) {
      alert("상태 변경 실패");
    }
  }

  function openModal(date) {
    setSelectedDate(date);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedDate(null);
  }

  const selectedDateItems = scheduleItems.filter(item => item.date === selectedDate);

  // 오늘 날짜 구하기 (KST 기준 YYYY-MM-DD)
  const todayStr = new Date().toLocaleDateString('sv-SE'); 
  const todayItems = scheduleItems.filter(item => item.date === todayStr);

  return (
    <div className="schedulePage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />
      <main className="scheduleMain">
        <div className="main-content-grid">
          <div className="calendar-section">
            <Calendar onDateClick={openModal} events={scheduleItems} />
          </div>

          <div className="side-section">
            <TodoList 
              items={todayItems} 
              onToggle={toggleTodoItem} 
            />
          </div>
        </div>
      </main>

      <EventModal
        modalOpen={modalOpen}
        closeModal={closeModal}
        date={selectedDate}
        scheduleItems={selectedDateItems}
        addScheduleItem={addScheduleItem}
        deleteScheduleItem={deleteScheduleItem}
        updateScheduleItem={updateScheduleItem}
      />
    </div>
  );
}

export default Schedule;
