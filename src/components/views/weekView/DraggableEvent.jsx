import { useDrag } from "react-dnd";
import { COLOR_MAP } from "../constants";

export const DraggableEvent = ({ event, style, onEventClick, dayIndex }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "event",
    item: () => ({
      ...event,
      originalDate: event.date,
      originalStartTime: event.startTime || event.time,
      originalEndTime: event.endTime,
      dayIndex: dayIndex,
    }),
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

  const formatTimeRange = (event) => {
    const startTime = event.startTime || event.time;
    const endTime = event.endTime;

    if (!startTime) return "";
    if (!endTime) return startTime;

    return `${startTime} - ${endTime}`;
  };

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`px-1 py-1 text-xs text-white rounded cursor-move hover:opacity-90 shadow-sm z-10 overflow-hidden transition-all hover:shadow-lg ${COLOR_MAP[event.color] || "bg-gray-500"} ${
        isDragging ? "opacity-50 transform scale-95" : "opacity-100"
      }`}
      style={style}
      title={`${event.title} (${formatTimeRange(event)}) - Drag to reschedule`}
    >
      <div className="flex items-center gap-1">
        <span className="text-[8px] opacity-70">⋮⋮</span>
        <div className="flex-1">
          <div className="font-semibold truncate">{event.title}</div>
          {style.height > 30 && <div className="text-xs opacity-90 truncate">{formatTimeRange(event)}</div>}
        </div>
      </div>
    </div>
  );
};
