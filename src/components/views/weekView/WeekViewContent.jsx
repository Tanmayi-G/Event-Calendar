import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useCalendar } from "../../../contexts/CalendarContext";
import toast from "react-hot-toast";
import { DraggableEvent } from "./DraggableEvent";
import { TimeSlotDropZone } from "../TimeSlotDropZone";

export default function WeekViewContent() {
  const { currentDate, events, setSelectedEvent, setIsViewModalOpen, setEvents } = useCalendar();
  const start = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

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
    if (!startTime) return { top: 0, height: 80 };
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = endTime ? timeToMinutes(endTime) : startMinutes + 60;
    const top = (startMinutes / 60) * 80;
    const height = Math.max(((endMinutes - startMinutes) / 60) * 80, 20);
    return { top, height };
  };

  const getEventColumns = (dayEvents) => {
    const sortedEvents = dayEvents.filter((e) => e.startTime || e.time).sort((a, b) => timeToMinutes(a.startTime || a.time) - timeToMinutes(b.startTime || b.time));
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
      const eventId = event.id || `${event.title}-${event.date}-${event.startTime}`;
      if (excludeEventId && eventId === excludeEventId) return false;
      if (event.date !== targetDate) return false;
      if (!event.startTime || !event.endTime) return false;
      const existingStart = timeToMinutes(event.startTime);
      const existingEnd = timeToMinutes(event.endTime);
      return eventStart < existingEnd && eventEnd > existingStart;
    });
  };

  const calculateNewEndTime = (newStartTime, originalStartTime, originalEndTime) => {
    if (!originalEndTime) return newStartTime;
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
    if (draggedEvent.originalDate === targetDateString && draggedEvent.originalStartTime === newStartTime) return;
    const draggedEventId = draggedEvent.id || `${draggedEvent.title}-${draggedEvent.originalDate}-${draggedEvent.originalStartTime}`;
    const conflicts = checkConflicts(targetDateString, newStartTime, newEndTime, draggedEventId);
    if (conflicts.length > 0) {
      toast.error(`Cannot move event: Time conflict with "${conflicts[0].title}" (${conflicts[0].startTime} - ${conflicts[0].endTime})`);
      return;
    }

    if (draggedEvent.recurrence && draggedEvent.recurrence !== "none") {
      const confirm = window.confirm(`\"${draggedEvent.title}\" is a recurring event. Moving it will make it a single event. Proceed?`);
      if (!confirm) return;
      const newEvent = {
        ...draggedEvent,
        date: targetDateString,
        startTime: newStartTime,
        endTime: newEndTime,
        time: newStartTime,
        recurrence: "none",
        id: `moved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      setEvents((prev) => [
        ...prev.filter((event) => {
          const eventId = event.id || `${event.title}-${event.date}-${event.startTime}`;
          return !(eventId === draggedEventId && event.date === draggedEvent.originalDate);
        }),
        newEvent,
      ]);
      toast.success("Event moved (recurrence broken)");
    } else {
      setEvents((prev) =>
        prev.map((event) => {
          const eventId = event.id || `${event.title}-${event.date}-${event.startTime}`;
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
        })
      );
      toast.success("Event moved successfully");
    }
  };

  return (
    <div className="h-[89vh] overflow-auto">
      <div className="grid grid-cols-8 border-t text-sm sticky top-0 z-20 shadow-sm">
        <div className="border-r p-2"></div>
        {days.map((day, i) => (
          <div key={i} className="border p-2 text-center font-semibold bg-base-300">
            <div className={`${isSameDay(day, new Date()) ? "text-blue-600 font-bold" : ""}`}>{format(day, "EEE")}</div>
            <div className={`text-lg ${isSameDay(day, new Date()) ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>{format(day, "d")}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8 relative" style={{ minHeight: `${24 * 80}px` }}>
        <div className="flex flex-col border-r border bg-base-300">
          {hours.map((hour, i) => (
            <div key={i} className="h-20 border-b px-2 py-1 text-xs text-gray-500 flex items-start">
              {hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>
          ))}
        </div>

        {days.map((day, colIdx) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
          const eventColumns = getEventColumns(dayEvents);
          const totalColumns = eventColumns.length;

          return (
            <div key={colIdx} className="flex flex-col border-r relative">
              {hours.map((hour, rowIdx) => (
                <TimeSlotDropZone key={rowIdx} hour={hour} day={day} dayIndex={colIdx} onDrop={handleEventDrop}>
                  <div></div>
                </TimeSlotDropZone>
              ))}

              {isSameDay(day, new Date()) && (
                <div className="absolute left-0 right-0 z-20 border-t-2 border-red-500" style={{ top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 60) * 80}px` }}>
                  <div className="w-2 h-2 bg-red-500 rounded-full -mt-1 -ml-1"></div>
                </div>
              )}

              {eventColumns.map((column, columnIndex) =>
                column.map((event, eventIndex) => {
                  const { top, height } = getEventStyle(event);
                  const width = totalColumns > 1 ? `${90 / totalColumns}%` : "90%";
                  const leftOffset = totalColumns > 1 ? `${(columnIndex * 90) / totalColumns + 5}%` : "5%";

                  return (
                    <DraggableEvent
                      key={`${columnIndex}-${eventIndex}`}
                      event={event}
                      dayIndex={colIdx}
                      onEventClick={() => {
                        setSelectedEvent(event);
                        setIsViewModalOpen(true);
                      }}
                      style={{
                        position: "absolute",
                        top: `${top}px`,
                        height: `${height}px`,
                        left: leftOffset,
                        width: width,
                        minHeight: "20px",
                      }}
                    />
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
