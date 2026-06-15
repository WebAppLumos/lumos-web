import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

function Calendar({ onDateClick, events = [] }) {

  const categoryToColor = {
    ACADEMIC: '#f5f5f5', // Very light gray
    HOLIDAY: '#fee2e2',  // Soft red
    STUDY: '#eff6ff',    // Soft blue
    WORK: '#fff7ed',     // Soft orange
    PRIVATE: '#f0fdf4',  // Soft green
    OTHER: '#fafafa'     // Off-white
  };

  const categoryToTextColor = {
    ACADEMIC: '#525252',
    HOLIDAY: '#ef4444',
    STUDY: '#2563eb',
    WORK: '#f97316',
    PRIVATE: '#16a34a',
    OTHER: '#737373'
  };

  const calendarEvents = (events || []).map(item => ({
    id: item.scheduleId?.toString(),
    title: item.title,
    start: item.date ? new Date(item.date).toISOString().split('T')[0] : null,
    backgroundColor: categoryToColor[item.category] || categoryToColor.OTHER,
    textColor: categoryToTextColor[item.category] || categoryToTextColor.OTHER,
    borderColor: 'transparent',
    // 우선순위 정렬을 위한 필드 추가
    priorityWeight: item.priority === 'HIGH' ? 3 : item.priority === 'MEDIUM' ? 2 : 1,
  })).filter(Boolean);

  return (
    <div className="calendar-scope">
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
        aspectRatio={1.52}
      />
    </div>
  );
}

export default Calendar;
