import { useEffect, useRef, useState } from "react";
import { useCalendar } from "../contexts/CalendarContext";
import { format, startOfToday, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";

export const useHeaderLogic = () => {
  const { currentDate, setCurrentDate, viewMode, setViewMode, events, searchQuery, setSearchQuery, isSidebarOpen, setIsSidebarOpen } = useCalendar();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);

  const formattedDate = format(currentDate, viewMode === "day" ? "EEEE, MMMM d yyyy" : viewMode === "week" ? "wo 'week of' MMMM yyyy" : "MMMM yyyy");

  const handleToday = () => setCurrentDate(startOfToday());

  const handleDateChange = (direction) => {
    const ops = {
      month: direction === "prev" ? subMonths : addMonths,
      week: direction === "prev" ? subWeeks : addWeeks,
      day: direction === "prev" ? subDays : addDays,
    };
    setCurrentDate(ops[viewMode](currentDate, 1));
  };

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleSearchResultClick = (event) => {
    setCurrentDate(new Date(event.date));
    clearSearch();
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = events.filter((event) => event.title.toLowerCase().includes(lower) || event.description?.toLowerCase().includes(lower));
      setSearchResults(filtered);
    }
  }, [searchQuery, events]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const getColorClass = (color) => {
    const colors = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      red: "bg-red-500",
      yellow: "bg-yellow-400",
      gray: "bg-gray-400",
    };
    return colors[color] || "bg-gray-400";
  };

  return {
    currentDate,
    setViewMode,
    viewMode,
    isSidebarOpen,
    setIsSidebarOpen,
    isSearchOpen,
    searchQuery,
    searchInputRef,
    searchResults,
    formattedDate,
    handleToday,
    handleDateChange,
    handleSearchToggle,
    clearSearch,
    handleSearchChange,
    handleSearchResultClick,
    getColorClass,
  };
};
