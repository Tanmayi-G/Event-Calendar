import { useEffect, useState } from "react";
import { useCalendar } from "../../contexts/CalendarContext";
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MiniCalendar = () => {
  const { currentDate, setCurrentDate } = useCalendar();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(currentDate));

  useEffect(() => {
    setCurrentMonth(startOfMonth(currentDate));
  }, [currentDate]);

  const getCalendarMatrix = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

    const matrix = [];
    let day = start;
    while (day <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      matrix.push(week);
    }
    return matrix;
  };

  const handleDayClick = (day) => {
    setCurrentDate(day);
  };

  const handleMonthChange = (direction) => {
    const newMonth = direction === "prev" ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
  };

  const matrix = getCalendarMatrix();

  return (
    <div className="rounded-xl bg-base-100 p-4 shadow">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => handleMonthChange("prev")} className="btn btn-sm btn-ghost">
          <ChevronLeft />
        </button>
        <h3 className="text-sm font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
        <button onClick={() => handleMonthChange("next")} className="btn btn-sm btn-ghost">
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {"SMTWTFS".split("").map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {matrix.flat().map((day, idx) => (
          <button
            key={idx}
            onClick={() => handleDayClick(day)}
            className={`rounded-full cursor-pointer px-1 py-1 h-8 w-8 text-sm transition-all duration-150 hover:bg-base-200
              ${isSameDay(day, currentDate) ? "bg-blue-300 text-black hover:bg-blue-400" : ""}
              ${isSameDay(day, new Date()) && !isSameDay(day, currentDate) ? "border border-blue-600 text-blue-600" : ""}
              ${!isSameMonth(day, currentMonth) ? "text-gray-400" : ""}
            `}
          >
            {format(day, "d")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MiniCalendar;
