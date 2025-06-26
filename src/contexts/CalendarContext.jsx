import { createContext, useContext, useState } from "react";
import { startOfToday } from "date-fns";

const CalendarContext = createContext();

export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [viewMode, setViewMode] = useState("month");
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addEvent = (event) => setEvents((prev) => [...prev, event]);

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        viewMode,
        setViewMode,
        events,
        addEvent,
        selectedDate,
        setSelectedDate,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
