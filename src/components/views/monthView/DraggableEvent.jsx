import { useDrag } from "react-dnd";
import { COLOR_MAP } from "../constants";

export const DraggableEvent = ({ event, onEventClick, index }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "event",
    item: () => ({
      ...event,
      originalDate: event.date,
      dragIndex: index,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(e, event);
    }
  };

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`
        text-xs truncate rounded px-1 py-0.5 text-white text-left w-full cursor-move
        ${COLOR_MAP[event.color] || "bg-gray-500"}
        ${isDragging ? "opacity-50 transform scale-95" : "opacity-100"}
        hover:shadow-md transition-all duration-200 hover:scale-105
      `}
      title={`${event.title} (${event.startTime} - ${event.endTime}) - Drag to reschedule`}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px] opacity-70">⋮⋮</span>
        <span className="truncate">{event.title}</span>
      </div>
    </div>
  );
};
