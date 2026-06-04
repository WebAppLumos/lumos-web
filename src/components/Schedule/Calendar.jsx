import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function Calendar({ onDateClick, events = [] }) {
  const categoryToColor = {
    STUDY: '#0369a1',
    WORK: '#9a3412',
    PRIVATE: '#15803d',
    ACADEMIC: '#7e22ce',
    HOLIDAY: '#b91c1c',
    OTHER: '#4b5563'
  };

  // FullCalendar가 요구하는 형식(title, start, color)으로 변환
  const calendarEvents = events.map(item => ({
    title: item.title,
    start: item.date,
    id: item.id.toString(),
    backgroundColor: categoryToColor[item.category] || categoryToColor.OTHER,
    borderColor: categoryToColor[item.category] || categoryToColor.OTHER,
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={calendarEvents} // 달력에 일정 표시
      dateClick={(info) => onDateClick(info.dateStr)}
    />
  );
}

export default Calendar;