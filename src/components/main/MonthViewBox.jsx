import { format, isSameDay } from "date-fns";

export default function MonthViewBox({ day, rowIndex, events }) {
  const today = new Date();
  const isToday = isSameDay(day, today);
  const isFirst = format(day, "d") === "1";

  return (
    <div className="group relative flex flex-col items-center gap-y-2 border transition-all hover:bg-violet-50">
      <div className="flex flex-col items-center">
        {rowIndex === 0 && <h4 className="text-xs text-gray-500">{format(day, "EEE").toUpperCase()}</h4>}
        <h4 className={"text-center text-sm " + (isToday ? "flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white" : "")}>
          {isFirst ? format(day, "MMM d") : format(day, "d")}
        </h4>
      </div>
    </div>
  );
}
