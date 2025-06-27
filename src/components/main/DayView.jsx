import { format, isSameDay } from "date-fns";
import { useCalendar } from "../../contexts/CalendarContext";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import toast from "react-hot-toast";

const COLOR_MAP = {
  default: "bg-gray-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
};

const DraggableEvent = ({ event, style, onEventClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "event",
    item: () => {
      console.log("Dragging event:", event);
      return {
        ...event,
        originalDate: event.date,
        originalStartTime: event.startTime || event.time,
        originalEndTime: event.endTime,
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalHours = hours;

    if (ampm === "PM" && hours !== 12) totalHours += 12;
    if (ampm === "AM" && hours === 12) totalHours = 0;

    return totalHours * 60 + minutes;
  };

  const getEventDuration = (event) => {
    const startTime = event.startTime || event.time;
    const endTime = event.endTime;

    if (!startTime || !endTime) return 60;

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    return endMinutes - startMinutes;
  };

  const formatTimeRange = (event) => {
    const startTime = event.startTime || event.time;
    const endTime = event.endTime;

    if (!startTime) return "";
    if (!endTime) return startTime;

    return `${startTime} - ${endTime}`;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const duration = getEventDuration(event);

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`px-3 py-2 text-white rounded-lg cursor-move hover:opacity-90 shadow-md transition-all hover:shadow-lg z-10 ${COLOR_MAP[event.color] || "bg-gray-500"} ${
        isDragging ? "opacity-50 transform scale-95" : "opacity-100"
      }`}
      style={style}
      title={`${event.title} (${formatTimeRange(event)}) - Drag to reschedule`}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px] opacity-70">⋮⋮</span>
        <div className="flex-1">
          <div className="font-semibold text-sm truncate">{event.title}</div>
          <div className="text-xs opacity-90 mt-1">{formatTimeRange(event)}</div>
          {style.height > 60 && <div className="text-xs opacity-75 mt-1">{formatDuration(duration)}</div>}
          {style.height > 80 && event.description && <div className="text-xs opacity-75 mt-2 line-clamp-2">{event.description}</div>}
        </div>
      </div>
    </div>
  );
};

const TimeSlotDropZone = ({ hour, date, onDrop, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "event",
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        const newStartHour = hour;
        const newStartMinute = 0;
        const newStartTime = `${newStartHour === 0 ? 12 : newStartHour > 12 ? newStartHour - 12 : newStartHour}:${newStartMinute.toString().padStart(2, "0")} ${newStartHour < 12 ? "AM" : "PM"}`;

        onDrop(item, format(date, "yyyy-MM-dd"), newStartTime);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`relative h-20 border-b border-gray-200 transition-colors ${isOver && canDrop ? "bg-blue-50 border-blue-300 border-2 border-dashed" : ""} ${
        isOver && !canDrop ? "bg-red-50 border-red-300" : ""
      }`}
    >
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-75 rounded flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">Drop here to reschedule</div>
        </div>
      )}

      {isOver && !canDrop && (
        <div className="absolute inset-0 bg-red-100 bg-opacity-75 rounded flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">Cannot drop here</div>
        </div>
      )}

      {children}
    </div>
  );
};

const DayViewContent = () => {
  const { currentDate, events, setSelectedEvent, setIsViewModalOpen, setEvents } = useCalendar();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayEvents = events.filter((event) => isSameDay(new Date(event.date), currentDate));

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalHours = hours;

    if (ampm === "PM" && hours !== 12) totalHours += 12;
    if (ampm === "AM" && hours === 12) totalHours = 0;

    return totalHours * 60 + minutes;
  };

  const getEventStyle = (event) => {
    const startTime = event.startTime || event.time;
    const endTime = event.endTime || event.time;

    if (!startTime) return { top: 0, height: 60 };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = endTime ? timeToMinutes(endTime) : startMinutes + 60;

    const top = (startMinutes / 60) * 80;
    const height = Math.max(((endMinutes - startMinutes) / 60) * 80, 30);

    return { top, height };
  };

  const getEventColumns = (events) => {
    const sortedEvents = events.filter((e) => e.startTime || e.time).sort((a, b) => timeToMinutes(a.startTime || a.time) - timeToMinutes(b.startTime || b.time));

    const columns = [];

    sortedEvents.forEach((event) => {
      const eventStart = timeToMinutes(event.startTime || event.time);
      const eventEnd = timeToMinutes(event.endTime || event.time) || eventStart + 60;

      let columnIndex = 0;
      while (columnIndex < columns.length) {
        const hasOverlap = columns[columnIndex].some((existingEvent) => {
          const existingStart = timeToMinutes(existingEvent.startTime || existingEvent.time);
          const existingEnd = timeToMinutes(existingEvent.endTime || existingEvent.time) || existingStart + 60;
          return eventStart < existingEnd && eventEnd > existingStart;
        });

        if (!hasOverlap) break;
        columnIndex++;
      }

      if (columnIndex === columns.length) {
        columns.push([]);
      }

      columns[columnIndex].push(event);
    });

    return columns;
  };

  const checkConflicts = (targetDate, eventStartTime, eventEndTime, excludeEventId = null) => {
    if (!eventStartTime || !eventEndTime) return [];

    const eventStart = timeToMinutes(eventStartTime);
    const eventEnd = timeToMinutes(eventEndTime);

    const conflictingEvents = events.filter((event) => {
      const eventId = event.id || `${event.title}-${event.date}-${event.startTime || event.time}`;
      if (excludeEventId && eventId === excludeEventId) return false;
      if (event.date !== targetDate) return false;
      if (!event.startTime && !event.time) return false;

      const existingStart = timeToMinutes(event.startTime || event.time);
      const existingEnd = timeToMinutes(event.endTime || event.time) || existingStart + 60;

      return eventStart < existingEnd && eventEnd > existingStart;
    });

    return conflictingEvents;
  };

  const calculateNewEndTime = (newStartTime, originalStartTime, originalEndTime) => {
    if (!originalEndTime) {
      const newStartMinutes = timeToMinutes(newStartTime);
      const newEndMinutes = newStartMinutes + 60;
      const hours = Math.floor(newEndMinutes / 60);
      const minutes = newEndMinutes % 60;
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours < 12 ? "AM" : "PM";
      return `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    }

    const originalDuration = timeToMinutes(originalEndTime) - timeToMinutes(originalStartTime);
    const newStartMinutes = timeToMinutes(newStartTime);
    const newEndMinutes = newStartMinutes + originalDuration;

    const hours = Math.floor(newEndMinutes / 60);
    const minutes = newEndMinutes % 60;
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours < 12 ? "AM" : "PM";

    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const handleEventDrop = (draggedEvent, targetDateString, newStartTime) => {
    console.log("handleEventDrop called:", { draggedEvent, targetDateString, newStartTime }); // Debug log

    try {
      const newEndTime = calculateNewEndTime(newStartTime, draggedEvent.originalStartTime, draggedEvent.originalEndTime);

      if (draggedEvent.originalDate === targetDateString && draggedEvent.originalStartTime === newStartTime) {
        console.log("Dropped on same time slot, no change needed");
        return;
      }

      const draggedEventId = draggedEvent.id || `${draggedEvent.title}-${draggedEvent.originalDate}-${draggedEvent.originalStartTime}`;
      const conflicts = checkConflicts(targetDateString, newStartTime, newEndTime, draggedEventId);

      if (conflicts.length > 0) {
        toast.error(`Cannot move event: Time conflict with "${conflicts[0].title}" (${conflicts[0].startTime || conflicts[0].time} - ${conflicts[0].endTime || "end"})`, { duration: 4000 });
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
          startTime: newStartTime,
          endTime: newEndTime,
          time: newStartTime,
          recurrence: "none",
          id: `moved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        setEvents((prevEvents) => {
          const filteredEvents = prevEvents.filter((event) => {
            const eventId = event.id || `${event.title}-${event.date}-${event.startTime || event.time}`;
            return !(eventId === draggedEventId && event.date === draggedEvent.originalDate);
          });
          return [...filteredEvents, newEvent];
        });

        toast.success("Event moved successfully (removed from recurring series)", { duration: 3000 });
      } else {
        setEvents((prevEvents) => {
          const updatedEvents = prevEvents.map((event) => {
            const eventId = event.id || `${event.title}-${event.date}-${event.startTime || event.time}`;

            if (eventId === draggedEventId && event.date === draggedEvent.originalDate) {
              return {
                ...event,
                date: targetDateString,
                startTime: newStartTime,
                endTime: newEndTime,
                time: newStartTime,
              };
            }
            return event;
          });

          return updatedEvents;
        });

        toast.success("Event moved successfully", { duration: 2000 });
      }
    } catch (error) {
      console.error("Error moving event:", error);
      toast.error("Failed to move event. Please try again.");
    }
  };

  const eventColumns = getEventColumns(dayEvents);
  const totalColumns = eventColumns.length;

  return (
    <div className="h-[89vh] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-base-300 text-white z-20 shadow-sm p-4">
        <h2 className="text-2xl font-bold ">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
        {dayEvents.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""} scheduled
          </p>
        )}
      </div>

      <div className="relative" style={{ minHeight: `${24 * 80}px` }}>
        {hours.map((hour, i) => (
          <TimeSlotDropZone key={i} hour={hour} date={currentDate} onDrop={handleEventDrop}>
            <div className="absolute top-0 left-0 text-xs text-gray-500 bg-white px-1 z-5">
              {hour === 0 ? "12:00 AM" : hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
            </div>
            <div className="absolute left-16 right-4 top-10 border-t border-gray-100"></div>
          </TimeSlotDropZone>
        ))}

        {isSameDay(currentDate, new Date()) && (
          <div
            className="absolute left-4 right-4 z-20 border-t-2 border-red-500 pointer-events-none"
            style={{
              top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 60) * 80}px`,
            }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -mt-1.5 -ml-1.5"></div>
          </div>
        )}

        <div className="absolute left-20 right-4 top-0 bottom-0 pointer-events-none">
          {eventColumns.map((column, columnIndex) =>
            column.map((event, eventIndex) => {
              const { top, height } = getEventStyle(event);
              const width = totalColumns > 1 ? `${95 / totalColumns}%` : "100%";
              const leftOffset = totalColumns > 1 ? `${(columnIndex * 95) / totalColumns}%` : "0%";

              return (
                <div
                  key={`${columnIndex}-${eventIndex}`}
                  className="pointer-events-auto"
                  style={{
                    position: "absolute",
                    top: `${top}px`,
                    height: `${height}px`,
                    left: leftOffset,
                    width: width,
                    minHeight: "30px",
                  }}
                >
                  <DraggableEvent
                    event={event}
                    onEventClick={() => {
                      setSelectedEvent(event);
                      setIsViewModalOpen(true);
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const DayView = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DayViewContent />
    </DndProvider>
  );
};

export default DayView;
