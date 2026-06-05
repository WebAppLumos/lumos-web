import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function Calendar({ onDateClick, events = [] }) {
  const categoryToColor = {
    STUDY: '#0369a1',
    WORK: '#9a3412',
    PRIVATE: '#15803d',
    OTHER: '#4b5563'
  };

  const calendarEvents = events.map(item => ({
    title: item.title,
    start: item.date,
    id: item.scheduleId?.toString(),
    backgroundColor: categoryToColor[item.category] || categoryToColor.OTHER,
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={calendarEvents}
      dateClick={(info) => onDateClick(info.dateStr)}
    />
  );
}

export default Calendar;