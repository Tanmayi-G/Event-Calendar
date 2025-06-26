import { format, isSameDay } from "date-fns";
import { useCalendar } from "../../contexts/CalendarContext";

const COLOR_MAP = {
  default: "bg-gray-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
};

const DayView = () => {
  const { currentDate, events, setSelectedEvent, setIsViewModalOpen } = useCalendar();
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

  const formatTimeRange = (event) => {
    const startTime = event.startTime || event.time;
    const endTime = event.endTime;

    if (!startTime) return "";
    if (!endTime) return startTime;

    return `${startTime} - ${endTime}`;
  };

  const getEventDuration = (event) => {
    const startTime = event.startTime || event.time;
    const endTime = event.endTime;

    if (!startTime || !endTime) return 60;

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    return endMinutes - startMinutes;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
          <div key={i} className="relative h-20 border-b border-gray-200">
            <div className="absolute top-0 text-xs text-gray-500 bg-white px-1">{hour === 0 ? "12:00 AM" : hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}</div>
            <div className="absolute left-16 right-4 top-10 border-t border-gray-100"></div>
          </div>
        ))}

        {isSameDay(currentDate, new Date()) && (
          <div
            className="absolute left-4 right-4 z-20 border-t-2 border-red-500"
            style={{
              top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 60) * 80}px`,
            }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -mt-1.5 -ml-1.5"></div>
          </div>
        )}

        <div className="absolute left-20 right-4 top-0 bottom-0">
          {eventColumns.map((column, columnIndex) =>
            column.map((event, eventIndex) => {
              const { top, height } = getEventStyle(event);
              const width = totalColumns > 1 ? `${95 / totalColumns}%` : "100%";
              const leftOffset = totalColumns > 1 ? `${(columnIndex * 95) / totalColumns}%` : "0%";
              const duration = getEventDuration(event);

              return (
                <div
                  key={`${columnIndex}-${eventIndex}`}
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsViewModalOpen(true);
                  }}
                  className={`absolute px-3 py-2 text-white rounded-lg cursor-pointer hover:opacity-90 shadow-md transition-all hover:shadow-lg z-10 ${COLOR_MAP[event.color] || "bg-gray-500"}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: leftOffset,
                    width: width,
                    minHeight: "30px",
                  }}
                >
                  <div className="font-semibold text-sm truncate">{event.title}</div>
                  <div className="text-xs opacity-90 mt-1">{formatTimeRange(event)}</div>
                  {height > 60 && <div className="text-xs opacity-75 mt-1">{formatDuration(duration)}</div>}
                  {height > 80 && event.description && <div className="text-xs opacity-75 mt-2 line-clamp-2">{event.description}</div>}
                </div>
              );
            })
          )}
        </div>

        {dayEvents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-lg">No events scheduled</p>
              <p className="text-sm">Click on a time slot to add an event</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
