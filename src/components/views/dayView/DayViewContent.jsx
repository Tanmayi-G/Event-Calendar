import { format, isSameDay } from "date-fns";
import { useCalendar } from "../../../contexts/CalendarContext";
import toast from "react-hot-toast";
import { DraggableEvent } from "./DraggableEvent";
import { TimeSlotDropZone } from "../TimeSlotDropZone";

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
      if (columnIndex === columns.length) columns.push([]);
      columns[columnIndex].push(event);
    });
    return columns;
  };

  const checkConflicts = (targetDate, eventStartTime, eventEndTime, excludeEventId = null) => {
    if (!eventStartTime || !eventEndTime) return [];
    const eventStart = timeToMinutes(eventStartTime);
    const eventEnd = timeToMinutes(eventEndTime);
    return events.filter((event) => {
      const eventId = event.id || `${event.title}-${event.date}-${event.startTime || event.time}`;
      if (excludeEventId && eventId === excludeEventId) return false;
      if (event.date !== targetDate) return false;
      if (!event.startTime && !event.time) return false;
      const existingStart = timeToMinutes(event.startTime || event.time);
      const existingEnd = timeToMinutes(event.endTime || event.time) || existingStart + 60;
      return eventStart < existingEnd && eventEnd > existingStart;
    });
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
    const newEndTime = calculateNewEndTime(newStartTime, draggedEvent.originalStartTime, draggedEvent.originalEndTime);
    const draggedEventId = draggedEvent.id || `${draggedEvent.title}-${draggedEvent.originalDate}-${draggedEvent.originalStartTime}`;
    const conflicts = checkConflicts(targetDateString, newStartTime, newEndTime, draggedEventId);
    if (conflicts.length > 0) {
      toast.error(`Cannot move event: Time conflict with "${conflicts[0].title}"`, { duration: 4000 });
      return;
    }
    const newEvent = {
      ...draggedEvent,
      date: targetDateString,
      startTime: newStartTime,
      endTime: newEndTime,
      time: newStartTime,
      recurrence: draggedEvent.recurrence !== "none" ? "none" : draggedEvent.recurrence,
      id: draggedEvent.recurrence !== "none" ? `moved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : draggedEvent.id,
    };
    setEvents((prev) =>
      prev
        .filter((e) => {
          const eId = e.id || `${e.title}-${e.date}-${e.startTime || e.time}`;
          return !(eId === draggedEventId && e.date === draggedEvent.originalDate);
        })
        .concat(newEvent)
    );
    toast.success("Event moved successfully", { duration: 2000 });
  };

  const eventColumns = getEventColumns(dayEvents);
  const totalColumns = eventColumns.length;

  return (
    <div className="h-[89vh] overflow-y-auto">
      <div className="sticky top-0 bg-base-300 text-white z-20 shadow-sm p-4">
        <h2 className="text-2xl font-bold ">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
        {dayEvents.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""} scheduled
          </p>
        )}
      </div>

      <div className="relative" style={{ minHeight: `${24 * 80}px` }}>
        {hours.map((hour, i) => (
          <TimeSlotDropZone key={i} hour={hour} date={currentDate} onDrop={handleEventDrop} variant="day">
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
                  style={{ position: "absolute", top: `${top}px`, height: `${height}px`, left: leftOffset, width, minHeight: "30px" }}
                >
                  <DraggableEvent
                    event={event}
                    onEventClick={() => {
                      setSelectedEvent(event);
                      setIsViewModalOpen(true);
                    }}
                    style={{ width: "100%", height: "100%" }}
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

export default DayViewContent;
