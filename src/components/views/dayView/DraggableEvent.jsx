import { useDrag } from "react-dnd";
import { COLOR_MAP } from "../constants";

export const DraggableEvent = ({ event, style, onEventClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "event",
    item: () => {
      console.log("Dragging event:", event);
      return {
        ...event,
        originalDate: event.date,
        originalStartTime: event.startTime || event.time,
        originalEndTime: event.endTime,
      };
    },
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

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalHours = hours;

    if (ampm === "PM" && hours !== 12) totalHours += 12;
    if (ampm === "AM" && hours === 12) totalHours = 0;

    return totalHours * 60 + minutes;
  };

  const getEventDuration = (event) => {
    const startTime = event.startTime || event.time;
    const endTime = event.endTime;

    if (!startTime || !endTime) return 60;

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    return endMinutes - startMinutes;
  };

  const formatTimeRange = (event) => {
    const startTime = event.startTime || event.time;
    const endTime = event.endTime;

    if (!startTime) return "";
    if (!endTime) return startTime;

    return `${startTime} - ${endTime}`;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const duration = getEventDuration(event);

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`px-3 py-2 text-white rounded-lg cursor-move hover:opacity-90 shadow-md transition-all hover:shadow-lg z-10 ${COLOR_MAP[event.color] || "bg-gray-500"} ${
        isDragging ? "opacity-50 transform scale-95" : "opacity-100"
      }`}
      style={style}
      title={`${event.title} (${formatTimeRange(event)}) - Drag to reschedule`}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px] opacity-70">⋮⋮</span>
        <div className="flex-1">
          <div className="font-semibold text-sm truncate">{event.title}</div>
          <div className="text-xs opacity-90 mt-1">{formatTimeRange(event)}</div>
          {style.height > 60 && <div className="text-xs opacity-75 mt-1">{formatDuration(duration)}</div>}
          {style.height > 80 && event.description && <div className="text-xs opacity-75 mt-2 line-clamp-2">{event.description}</div>}
        </div>
      </div>
    </div>
  );
};
