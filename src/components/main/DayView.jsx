import { format } from "date-fns";
import { useCalendar } from "../../contexts/CalendarContext";

const DayView = () => {
  const { currentDate } = useCalendar();

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  return (
    <div className="h-[89vh] overflow-y-auto p-4">
      <h2 className="text-xl font-bold mb-4">{format(currentDate, "EEEE, MMMM d yyyy")}</h2>
      <div className="space-y-2">
        {hours.map((hour, i) => (
          <div key={i} className="border-b py-2 text-sm text-gray-700">
            {hour}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayView;
