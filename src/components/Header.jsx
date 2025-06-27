import { Menu, CalendarDays, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useCalendar } from "../contexts/CalendarContext";
import { format, startOfToday, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { useState, useEffect, useRef } from "react";

const Header = () => {
  const { currentDate, setCurrentDate, viewMode, setViewMode, events, searchQuery, setSearchQuery, filteredEvents, setIsSidebarOpen, isSidebarOpen } = useCalendar();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);

  const handleToday = () => setCurrentDate(startOfToday());

  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else if (viewMode === "day") setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else if (viewMode === "day") setCurrentDate(addDays(currentDate, 1));
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
    } else {
      const filtered = events.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      setSearchResults(filtered);
    }
  }, [searchQuery, events]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery("");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchResultClick = (event) => {
    setCurrentDate(new Date(event.date));
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  return (
    <div className="mx-3 py-4 flex justify-between items-center relative">
      <div className="flex items-center gap-3">
        <div className="hidden items-center lg:flex">
          <button className="btn btn-ghost p-2 mr-3" onClick={() => setIsSidebarOpen((prev) => !prev)} title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}>
            <Menu />
          </button>
          <CalendarDays />
          <h1 className="text-lg font-bold ml-1">Calendar</h1>
        </div>

        <button onClick={handleToday} className="btn rounded-full border-white px-5 mx-2">
          Today
        </button>

        <div className="flex items-center gap-3">
          <ChevronLeft className="cursor-pointer hover:bg-base-200 rounded p-1" onClick={handlePrev} />
          <ChevronRight className="cursor-pointer hover:bg-base-200 rounded p-1" onClick={handleNext} />
        </div>

        <h1 className="hidden text-lg lg:block">{format(currentDate, viewMode === "day" ? "EEEE, MMMM d yyyy" : viewMode === "week" ? "wo 'week of' MMMM yyyy" : "MMMM yyyy")}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          {!isSearchOpen ? (
            <button onClick={handleSearchToggle} className="btn btn-ghost btn-circle" title="Search events">
              <Search size={20} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="input input-bordered w-64 pr-8"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      clearSearch();
                    }
                  }}
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs btn-circle">
                    <X size={16} />
                  </button>
                )}
              </div>
              <button onClick={handleSearchToggle} className="btn btn-ghost btn-circle" title="Close search">
                <X size={20} />
              </button>
            </div>
          )}

          {isSearchOpen && searchQuery && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-base-100 rounded-lg shadow-lg border border-base-300 z-50 max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  <div className="text-sm text-gray-500 px-3 py-2 border-b">
                    {searchResults.length} event{searchResults.length !== 1 ? "s" : ""} found
                  </div>
                  {searchResults.map((event) => (
                    <div key={event.id} onClick={() => handleSearchResultClick(event)} className="p-3 hover:bg-base-200 cursor-pointer rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base-content">{event.title}</h4>
                          <p className="text-sm text-gray-500">
                            {format(new Date(event.date), "MMM d, yyyy")} • {event.startTime} - {event.endTime}
                          </p>
                          {event.description && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{event.description}</p>}
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ml-3 ${
                            event.color === "blue"
                              ? "bg-blue-500"
                              : event.color === "green"
                              ? "bg-green-500"
                              : event.color === "red"
                              ? "bg-red-500"
                              : event.color === "yellow"
                              ? "bg-yellow-400"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Search size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No events found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="select cursor-pointer">
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
        </select>

        <div className="avatar">
          <div className="w-12 h-12 rounded-full cursor-pointer">
            <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" alt="Profile" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
