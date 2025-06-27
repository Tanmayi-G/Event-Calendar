import { format, isSameDay } from "date-fns";
import { useCalendar } from "../../../contexts/CalendarContext";
import { useDrop } from "react-dnd";
import { DraggableEvent } from "./DraggableEvent";
import { useMonthViewBoxLogic } from "../../../hooks/useMonthViewBoxLogic";

export default function MonthViewBox({ day, rowIndex }) {
  const today = new Date();
  const isToday = isSameDay(day, today);
  const isFirst = format(day, "d") === "1";

  const { setIsModalOpen, setSelectedDate, filteredEvents, setSelectedEvent, setIsViewModalOpen, setEvents } = useCalendar();

  const { showAll, setShowAll, dayString, eventsForDay, displayedEvents, handleEventDrop } = useMonthViewBoxLogic(day, filteredEvents, setEvents);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "event",
    drop: (item) => handleEventDrop(item, format(day, "yyyy-MM-dd")),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handleClick = () => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleEventClick = (e, event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  return (
    <div
      ref={drop}
      onClick={handleClick}
      className={`
        group relative flex flex-col items-center gap-y-2 border transition-all cursor-pointer min-h-[100px]
        ${isOver && canDrop ? "bg-blue-50 border-blue-300 border-2 border-dashed" : "hover:bg-base-200"}
        ${isOver && !canDrop ? "bg-red-50 border-red-300" : ""}
      `}
    >
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-75 rounded flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">Drop here to reschedule</div>
        </div>
      )}

      {isOver && !canDrop && (
        <div className="absolute inset-0 bg-red-100 bg-opacity-75 rounded flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">Cannot drop here</div>
        </div>
      )}

      <div className="flex flex-col items-center">
        {rowIndex === 0 && <h4 className="text-xs text-gray-400">{format(day, "EEE").toUpperCase()}</h4>}
        <h4 className={"text-center text-sm " + (isToday ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white" : "")}>
          {isFirst ? format(day, "MMM d") : format(day, "d")}
        </h4>
      </div>

      <div className="w-full px-1 flex flex-col gap-1">
        {displayedEvents.map((event, idx) => (
          <DraggableEvent key={`${event.id || event.title}-${idx}`} event={event} onEventClick={handleEventClick} index={idx} />
        ))}

        {!showAll && eventsForDay.length > 2 && (
          <span
            className="text-[10px] text-blue-400 cursor-pointer hover:text-blue-600 transition-colors"
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
