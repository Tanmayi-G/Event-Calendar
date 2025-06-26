import { format, isSameDay } from "date-fns";
import { useCalendar } from "../../contexts/CalendarContext";

const COLOR_MAP = {
  default: "bg-gray-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
};

// Helper to convert 12-hour time string to 24-hour number
const get24Hour = (time) => {
  const [timePart, ampm] = time.split(" ");
  let [hour, minute] = timePart.split(":").map(Number);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return hour;
};

const DayView = () => {
  const { currentDate, events, setSelectedEvent, setIsViewModalOpen } = useCalendar();
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const dayEvents = events.filter((event) => isSameDay(new Date(event.date), currentDate));

  return (
    <div className="h-[89vh] overflow-y-auto p-4">
      <h2 className="text-xl font-bold mb-4">{format(currentDate, "EEEE, MMMM d yyyy")}</h2>
      <div className="space-y-2">
        {hours.map((hourLabel, i) => {
          const hourEvents = dayEvents.filter((e) => get24Hour(e.time) === i);
          return (
            <div key={i} className="relative border-b py-3 text-sm text-gray-700">
              <div>{hourLabel}</div>
              {hourEvents.map((event, j) => (
                <div
                  key={j}
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsViewModalOpen(true);
                  }}
                  className={`absolute left-24 top-0 px-2 py-1 text-xs text-white rounded cursor-pointer hover:opacity-90 ${COLOR_MAP[event.color] || "bg-gray-500"}`}
                >
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;
