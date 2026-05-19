import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './Calendar.css';

const Calendar = () => {
  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today'
        }}
        height="500px"
        aspectRatio={1}
      />
    </div>
  );
};

export default Calendar;
