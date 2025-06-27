import { format } from "date-fns";
import { useDrop } from "react-dnd";

export const TimeSlotDropZone = ({ hour, date, day, onDrop, children, variant = "week" }) => {
  const slotDate = day || date;

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "event",
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        const newStartTime = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${"00"} ${hour < 12 ? "AM" : "PM"}`;
        onDrop(item, format(slotDate, "yyyy-MM-dd"), newStartTime);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const baseClass = "relative h-20 border-b transition-colors " + (isOver && canDrop ? "bg-blue-50 border-blue-300 border-2 border-dashed" : isOver && !canDrop ? "bg-red-50 border-red-300" : "");

  return (
    <div ref={drop} className={baseClass}>
      {isOver && (
        <div className={`absolute inset-0 ${canDrop ? "bg-blue-100" : "bg-red-100"} bg-opacity-75 rounded flex items-center justify-center z-20 pointer-events-none`}>
          <div
            className={`$ {
              canDrop ? "bg-blue-500" : "bg-red-500"
            } text-white rounded text-[10px] font-medium px-1 py-0.5`}
          >
            {canDrop ? "Drop here" : "Cannot drop"}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
