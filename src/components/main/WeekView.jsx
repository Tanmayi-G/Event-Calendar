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
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  return (
    <div className="h-[89vh] overflow-auto">
      <div className="grid grid-cols-8 border-t text-sm sticky top-0 z-10 bg-white">
        <div className="border-r p-2"></div>
        {days.map((day, i) => (
          <div key={i} className="border-r p-2 text-center font-semibold">
            {format(day, "EEE d")}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8 min-h-[calc(100%-2rem)]">
        <div className="flex flex-col border-r">
          {hours.map((hour, i) => (
            <div key={i} className="h-20 border-b px-2 text-xs text-gray-500">
              {hour}
            </div>
          ))}
        </div>

        {days.map((day, colIdx) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
          return (
            <div key={colIdx} className="flex flex-col border-r relative">
              {hours.map((_, rowIdx) => (
                <div key={rowIdx} className="h-20 border-b relative">
                  {dayEvents
                    .filter((e) => parseInt(e.time) === rowIdx || e.time.startsWith(`${rowIdx % 12 === 0 ? 12 : rowIdx % 12}`))
                    .map((event, j) => (
                      <div
                        key={j}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsViewModalOpen(true);
                        }}
                        className={`absolute left-1 right-1 top-1 px-2 py-1 text-xs text-white rounded cursor-pointer hover:opacity-90 ${COLOR_MAP[event.color] || "bg-gray-500"}`}
                      >
                        {event.title}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
