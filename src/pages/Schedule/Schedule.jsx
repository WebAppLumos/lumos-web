import { useEffect, useState } from 'react';
import axios from 'axios';

import Calendar from '../../components/Schedule/Calendar';
import EventModal from '../../components/Schedule/EventModal';
import TodoList from '../../components/Schedule/Todolist';
import DashboardNav from '../../components/Dashboard/DashboardNav';

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

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('lumos_uid');
      if (!userId) return;

      const res = await axios.get(
        `http://localhost:8080/api/calendar/events?userId=${userId}`
      );

      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="dashboardPage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />
      
      <main className="dashboardMain">
        <div className="schedule-page">
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
      </main>
    </div>
  );
}

export default Schedule;