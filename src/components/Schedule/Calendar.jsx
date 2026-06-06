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

  const calendarEvents = (events || []).map(item => ({
    id: item.scheduleId?.toString(),
    title: item.title,
    start: item.date ? new Date(item.date).toISOString().split('T')[0] : null,
    backgroundColor: categoryToColor[item.category] || categoryToColor.OTHER,
    // 우선순위 정렬을 위한 필드 추가
    priorityWeight: item.priority === 'HIGH' ? 3 : item.priority === 'MEDIUM' ? 2 : 1,
  })).filter(Boolean);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek'
      }}
      eventOrder="-priorityWeight" // 높은 우선순위가 위로 오도록 설정
      events={calendarEvents}
      dateClick={(info) => onDateClick?.(info.dateStr)}
      height="auto"
      aspectRatio={1.5}
    />
  );
}

export default Calendar;