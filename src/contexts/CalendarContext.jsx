import { createContext, useContext, useEffect, useState } from "react";
import { startOfToday } from "date-fns";

const CalendarContext = createContext();
export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [viewMode, setViewMode] = useState("month");
  const [events, setEvents] = useState(() => {
    try {
      const stored = localStorage.getItem("calendar-events");
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (err) {
      console.error("Failed to load events from localStorage", err);
    }
    return [];
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(events);

  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  const addEvent = (event) => {
    setEvents((prev) => [...prev, event]);
  };

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        viewMode,
        setViewMode,
        events,
        setEvents,
        addEvent,
        selectedDate,
        setSelectedDate,
        isModalOpen,
        setIsModalOpen,
        selectedEvent,
        setSelectedEvent,
        isViewModalOpen,
        setIsViewModalOpen,
        searchQuery,
        setSearchQuery,
        filteredEvents,
        setFilteredEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
