import { Menu, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendar } from "../contexts/CalendarContext";
import { format, startOfToday, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";

const Header = () => {
  const { currentDate, setCurrentDate, viewMode, setViewMode } = useCalendar();

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

  return (
    <div className="mx-3 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="hidden items-center lg:flex">
          <button className="btn btn-ghost p-2 mx-2">
            <Menu />
          </button>
          <CalendarDays />
          <h1 className="text-lg font-bold ml-1">Calendar</h1>
        </div>

        <button onClick={handleToday} className="btn btn-outline mx-2">
          Today
        </button>

        <div className="flex items-center gap-3">
          <ChevronLeft className="cursor-pointer" onClick={handlePrev} />
          <ChevronRight className="cursor-pointer" onClick={handleNext} />
        </div>

        <h1 className="hidden text-lg lg:block">{format(currentDate, viewMode === "day" ? "EEEE, MMMM d yyyy" : viewMode === "week" ? "wo 'week of' MMMM yyyy" : "MMMM yyyy")}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="select cursor-pointer">
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
        </select>
        <div className="avatar">
          <div className="w-12 h-12 rounded-full cursor-pointer">
            <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
