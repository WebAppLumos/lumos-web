import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from '../../components/Schedule/Calendar';
import TodoList from '../../components/Schedule/Todolist';
import EventModal from '../../components/Schedule/EventModal';
import DashboardNav from '../../components/Dashboard/DashboardNav';
import './Schedule.css';

function Schedule() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('lumos_user_info');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([]);

  const API_URL = 'http://localhost:8080/api/calendar/events';

  // 🔥 GET (전체 조회)
  const fetchEvents = async () => {
    try {
      const id = user?.userId || user?.id;

      const res = await axios.get(API_URL, {
        params: { userId: id }
      });

      setScheduleItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  // 🔥 추가 (POST 후 GET)
  const addScheduleItem = async (newItem) => {
    try {
      const id = user?.userId || user?.id;

      await axios.post(API_URL, {
        title: newItem.title,
        content: newItem.content,
        date: newItem.date,
        category: newItem.category,
        userId: id,
        isCompleted: false
      });

      await fetchEvents();
    } catch (err) {
      alert('추가 실패');
    }
  };

  // 삭제
  const deleteScheduleItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchEvents();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  // 토글
  const toggleTodoItem = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/toggle`);
      await fetchEvents();
    } catch (err) {
      alert('상태 변경 실패');
    }
  };

  const openModal = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  const selectedDateItems = scheduleItems.filter(
    (item) => item.date === selectedDate
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayItems = scheduleItems.filter(
    (item) => item.date === todayStr
  );

  return (
    <div className="schedule-page">

      <DashboardNav user={user} onLogout={() => setUser(null)} />

      <div className="schedule-content">

        <div className="calendar-area">
          <Calendar
            onDateClick={openModal}
            events={scheduleItems}
          />
        </div>

        <div className="todo-area">
          <TodoList
            items={todayItems}
            onToggle={toggleTodoItem}
          />
        </div>

      </div>

      <EventModal
        modalOpen={modalOpen}
        closeModal={closeModal}
        date={selectedDate}
        scheduleItems={selectedDateItems}
        addScheduleItem={addScheduleItem}
        deleteScheduleItem={deleteScheduleItem}
      />

    </div>
  );
}

export default Schedule;