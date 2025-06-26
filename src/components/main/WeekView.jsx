import { format, startOfWeek, addDays } from "date-fns";
import { useCalendar } from "../../contexts/CalendarContext";

const WeekView = () => {
  const { currentDate } = useCalendar();
  const start = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  return (
    <div className="h-[89vh] overflow-auto">
      <div className="grid grid-cols-8 border-t text-sm sticky top-0 z-10">
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

        {days.map((_, colIdx) => (
          <div key={colIdx} className="flex flex-col border-r">
            {hours.map((_, rowIdx) => (
              <div key={rowIdx} className="h-20 border-b hover:bg-base-200 cursor-pointer"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
