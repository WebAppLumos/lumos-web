import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function Calendar({ onDateClick, events = [] }) {
  // FullCalendar가 요구하는 형식(title, start)으로 변환
  const calendarEvents = events.map(item => ({
    title: item.title,
    start: item.date,
    id: item.id.toString()
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