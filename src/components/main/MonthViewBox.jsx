import { format, isSameDay } from "date-fns";
import { useCalendar } from "../../contexts/CalendarContext";
import { useState } from "react";

const COLOR_MAP = {
  default: "bg-gray-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
};

export default function MonthViewBox({ day, rowIndex }) {
  const today = new Date();
  const isToday = isSameDay(day, today);
  const isFirst = format(day, "d") === "1";
  const { setIsModalOpen, setSelectedDate, events, setSelectedEvent, setIsViewModalOpen } = useCalendar();
  const [showAll, setShowAll] = useState(false);

  const handleClick = () => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleEventClick = (e, event) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const dayString = format(day, "yyyy-MM-dd");
  const eventsForDay = events.filter((event) => event.date === dayString);

  const displayedEvents = showAll ? eventsForDay : eventsForDay.slice(0, 2);

  return (
    <div onClick={handleClick} className="group relative flex flex-col items-center gap-y-2 border transition-all hover:bg-base-200 cursor-pointer">
      <div className="flex flex-col items-center">
        {rowIndex === 0 && <h4 className="text-xs text-gray-400">{format(day, "EEE").toUpperCase()}</h4>}
        <h4 className={"text-center text-sm " + (isToday ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white" : "")}>
          {isFirst ? format(day, "MMM d") : format(day, "d")}
        </h4>
      </div>

      <div className="w-full px-1 flex flex-col gap-1">
        {displayedEvents.map((event, idx) => (
          <div key={idx} onClick={(e) => handleEventClick(e, event)} className={`text-xs truncate rounded px-1 py-0.5 text-white text-left w-full ${COLOR_MAP[event.color] || "bg-gray-500"}`}>
            {event.title}
          </div>
        ))}
        {!showAll && eventsForDay.length > 2 && (
          <span
            className="text-[10px] text-blue-400 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowAll(true);
            }}
          >
            +{eventsForDay.length - 2} more
          </span>
        )}
      </div>
    </div>
  );
}
