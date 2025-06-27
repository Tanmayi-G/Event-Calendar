import { createContext, useContext, useEffect, useState } from "react";
import { startOfToday } from "date-fns";

const CalendarContext = createContext();
export const useCalendar = () => useContext(CalendarContext);
const DEFAULT_COLORS = ["Blue", "Green", "Red", "Yellow", "Gray"];

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

  const [activeColorFilters, setActiveColorFilters] = useState(() => {
    try {
      const stored = localStorage.getItem("calendar-color-filters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : allColors;
      }
    } catch (err) {
      console.error("Failed to load color filters", err);
    }
    return DEFAULT_COLORS;
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(events);

  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("calendar-color-filters", JSON.stringify(activeColorFilters));
  }, [activeColorFilters]);

  useEffect(() => {
    let filtered = events;
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    filtered = filtered.filter((event) => activeColorFilters.includes(capitalize(event.color)));

    setFilteredEvents(filtered);
  }, [searchQuery, events, activeColorFilters]);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

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
        activeColorFilters,
        setActiveColorFilters,
        activeColorFilters,
        setActiveColorFilters,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
