import { useState } from 'react';
import Calendar from '../../components/Schedule/Calendar';
import TodoList from '../../components/Schedule/Todolist';
import EventModal from '../../components/Schedule/EventModal';

function Schedule() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([]);

  function addScheduleItem(newItem) {
    setScheduleItems((prev) => [
      ...prev,
      { ...newItem, id: Date.now(), done: false }
    ]);
  }

  function deleteScheduleItem(id) {
    setScheduleItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateScheduleItem(updatedItem) {
    setScheduleItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
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

  return (
    <div className="main-content-grid">

      <div className="calendar-section">
        <Calendar onDateClick={openModal} events={scheduleItems} />
      </div>

      <div className="side-section">
        <TodoList />
      </div>

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
