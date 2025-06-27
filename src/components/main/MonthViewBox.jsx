import { format, isSameDay } from "date-fns";
import { useCalendar } from "../../contexts/CalendarContext";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";

const COLOR_MAP = {
  default: "bg-gray-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
};

const DraggableEvent = ({ event, onEventClick, index }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "event",
    item: () => ({
      ...event,
      originalDate: event.date,
      dragIndex: index,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(e, event);
    }
  };

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`
        text-xs truncate rounded px-1 py-0.5 text-white text-left w-full cursor-move
        ${COLOR_MAP[event.color] || "bg-gray-500"}
        ${isDragging ? "opacity-50 transform scale-95" : "opacity-100"}
        hover:shadow-md transition-all duration-200 hover:scale-105
      `}
      title={`${event.title} (${event.startTime} - ${event.endTime}) - Drag to reschedule`}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px] opacity-70">⋮⋮</span>
        <span className="truncate">{event.title}</span>
      </div>
    </div>
  );
};

export default function MonthViewBox({ day, rowIndex }) {
  const today = new Date();
  const isToday = isSameDay(day, today);
  const isFirst = format(day, "d") === "1";
  const { setIsModalOpen, setSelectedDate, filteredEvents, searchQuery, setSelectedEvent, setIsViewModalOpen, setEvents } = useCalendar();
  const [showAll, setShowAll] = useState(false);

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalHours = hours;

    if (ampm === "PM" && hours !== 12) totalHours += 12;
    if (ampm === "AM" && hours === 12) totalHours = 0;

    return totalHours * 60 + minutes;
  };

  const checkConflicts = (targetDate, eventStartTime, eventEndTime, excludeEventId = null) => {
    if (!eventStartTime || !eventEndTime) return [];

    const eventStart = timeToMinutes(eventStartTime);
    const eventEnd = timeToMinutes(eventEndTime);

    const conflictingEvents = filteredEvents.filter((event) => {
      const eventId = event.id || `${event.title}-${event.date}-${event.startTime}`;
      if (excludeEventId && eventId === excludeEventId) return false;
      if (event.date !== targetDate) return false;
      if (!event.startTime || !event.endTime) return false;

      const existingStart = timeToMinutes(event.startTime);
      const existingEnd = timeToMinutes(event.endTime);

      return eventStart < existingEnd && eventEnd > existingStart;
    });

    return conflictingEvents;
  };

  const handleEventDrop = (draggedEvent, targetDateString) => {
    try {
      if (draggedEvent.originalDate === targetDateString) {
        return;
      }

      const draggedEventId = draggedEvent.id || `${draggedEvent.title}-${draggedEvent.originalDate}-${draggedEvent.startTime}`;
      const conflicts = checkConflicts(targetDateString, draggedEvent.startTime, draggedEvent.endTime, draggedEventId);

      if (conflicts.length > 0) {
        toast.error(`Cannot move event: Time conflict with "${conflicts[0].title}" (${conflicts[0].startTime} - ${conflicts[0].endTime})`, { duration: 4000 });
        return;
      }

      if (draggedEvent.recurrence && draggedEvent.recurrence !== "none") {
        const result = window.confirm(
          `"${draggedEvent.title}" is a recurring event.\n\n` +
            "Moving it will break it from the recurring series and create a single event.\n\n" +
            "Click OK to move this event only, or Cancel to keep it as part of the series."
        );

        if (!result) {
          return;
        }

        const newEvent = {
          ...draggedEvent,
          date: targetDateString,
          recurrence: "none",
          id: `moved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        setEvents((prevEvents) => {
          const filteredEvents = prevEvents.filter((event) => {
            const eventId = event.id || `${event.title}-${event.date}-${event.startTime}`;
            const draggedId = draggedEvent.id || `${draggedEvent.title}-${draggedEvent.originalDate}-${draggedEvent.startTime}`;
            return !(eventId === draggedId && event.date === draggedEvent.originalDate);
          });
          return [...filteredEvents, newEvent];
        });

        toast.success("Event moved successfully (removed from recurring series)", { duration: 3000 });
      } else {
        setEvents((prevEvents) =>
          prevEvents.map((event) => {
            const eventId = event.id || `${event.title}-${event.date}-${event.startTime}`;
            const draggedId = draggedEvent.id || `${draggedEvent.title}-${draggedEvent.originalDate}-${draggedEvent.startTime}`;

            if (eventId === draggedId && event.date === draggedEvent.originalDate) {
              return {
                ...event,
                date: targetDateString,
              };
            }
            return event;
          })
        );

        toast.success("Event moved successfully", { duration: 2000 });
      }
    } catch (error) {
      console.error("Error moving event:", error);
      toast.error("Failed to move event. Please try again.");
    }
  };

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "event",
    drop: (item) => {
      const targetDateString = format(day, "yyyy-MM-dd");
      handleEventDrop(item, targetDateString);
    },
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

  const dayString = format(day, "yyyy-MM-dd");
  const eventsForDay = filteredEvents.filter((event) => event.date === dayString);
  const displayedEvents = showAll ? eventsForDay : eventsForDay.slice(0, 2);

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
