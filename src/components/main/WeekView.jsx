import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useCalendar } from "../../contexts/CalendarContext";

const COLOR_MAP = {
  default: "bg-gray-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
};

const WeekView = () => {
  const { currentDate, events, setSelectedEvent, setIsViewModalOpen } = useCalendar();
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

  const formatTimeRange = (event) => {
    const startTime = event.startTime || event.time;
    const endTime = event.endTime;

    if (!startTime) return "";
    if (!endTime) return startTime;

    return `${startTime} - ${endTime}`;
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

      if (columnIndex === columns.length) {
        columns.push([]);
      }

      columns[columnIndex].push(event);
    });

    return columns;
  };

  return (
    <div className="h-[89vh] overflow-auto">
      <div className="grid grid-cols-8 border-t text-sm sticky top-0 z-10 shadow-sm">
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
              {hours.map((_, rowIdx) => (
                <div key={rowIdx} className="h-20 border-b"></div>
              ))}

              {eventColumns.map((column, columnIndex) =>
                column.map((event, eventIndex) => {
                  const { top, height } = getEventStyle(event);
                  const width = totalColumns > 1 ? `${90 / totalColumns}%` : "90%";
                  const leftOffset = totalColumns > 1 ? `${(columnIndex * 90) / totalColumns + 5}%` : "5%";

                  return (
                    <div
                      key={`${columnIndex}-${eventIndex}`}
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsViewModalOpen(true);
                      }}
                      className={`absolute px-1 py-1 text-xs text-white rounded cursor-pointer hover:opacity-90 shadow-sm z-10 overflow-hidden ${COLOR_MAP[event.color] || "bg-gray-500"}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: leftOffset,
                        width: width,
                        minHeight: "20px",
                      }}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      {height > 30 && <div className="text-xs opacity-90 truncate">{formatTimeRange(event)}</div>}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
