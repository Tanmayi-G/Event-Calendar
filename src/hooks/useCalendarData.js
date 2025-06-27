import { useEffect, useState } from "react";
import { startOfToday } from "date-fns";

const DEFAULT_COLORS = ["Blue", "Green", "Red", "Yellow", "Default"];
const EVENTS_KEY = "calendar-events";
const FILTERS_KEY = "calendar-color-filters";

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const useCalendarData = () => {
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [viewMode, setViewMode] = useState("month");

  const [events, setEvents] = useState(() => {
    try {
      const stored = localStorage.getItem(EVENTS_KEY);
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [activeColorFilters, setActiveColorFilters] = useState(() => {
    try {
      const stored = localStorage.getItem(FILTERS_KEY);
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : DEFAULT_COLORS;
    } catch {
      return DEFAULT_COLORS;
    }
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(events);

  useEffect(() => {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(activeColorFilters));
  }, [activeColorFilters]);

  useEffect(() => {
    const filtered = events.filter((event) => {
      const matchesQuery = !searchQuery.trim() || event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesColor = activeColorFilters.includes(capitalize(event.color));
      return matchesQuery && matchesColor;
    });

    setFilteredEvents(filtered);
  }, [searchQuery, events, activeColorFilters]);

  const addEvent = (event) => {
    setEvents((prev) => [...prev, event]);
  };

  return {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    events,
    setEvents,
    addEvent,
    selectedDate,
    setSelectedDate,
    selectedEvent,
    setSelectedEvent,
    isModalOpen,
    setIsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    searchQuery,
    setSearchQuery,
    filteredEvents,
    activeColorFilters,
    setActiveColorFilters,
  };
};

export default useCalendarData;
