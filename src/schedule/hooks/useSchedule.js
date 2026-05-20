import { useState } from 'react';

export default function useSchedule() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  return {
    selectedDate,
    modalOpen,
    openModal,
    closeModal,
  };
}