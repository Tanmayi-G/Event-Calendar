import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export function useMonthViewBoxLogic(day, filteredEvents, setEvents) {
  const [showAll, setShowAll] = useState(false);

  const dayString = format(day, "yyyy-MM-dd");
  const eventsForDay = filteredEvents.filter((event) => event.date === dayString);
  const displayedEvents = showAll ? eventsForDay : eventsForDay.slice(0, 2);

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalHours = hours;

    if (ampm === "PM" && hours !== 12) totalHours += 12;
    if (ampm === "AM" && hours === 12) totalHours = 0;

    return totalHours * 60 + minutes;
  };

  const checkConflicts = (targetDate, eventStartTime, eventEndTime, excludeEventId = null) => {
    if (!eventStartTime || !eventEndTime) return [];

    const eventStart = timeToMinutes(eventStartTime);
    const eventEnd = timeToMinutes(eventEndTime);

    const conflictingEvents = filteredEvents.filter((event) => {
      const eventId = event.id || `${event.title}-${event.date}-${event.startTime}`;
      if (excludeEventId && eventId === excludeEventId) return false;
      if (event.date !== targetDate) return false;
      if (!event.startTime || !event.endTime) return false;

      const existingStart = timeToMinutes(event.startTime);
      const existingEnd = timeToMinutes(event.endTime);

      return eventStart < existingEnd && eventEnd > existingStart;
    });

    return conflictingEvents;
  };

  const handleEventDrop = (draggedEvent, targetDateString) => {
    try {
      if (draggedEvent.originalDate === targetDateString) return;

      const draggedEventId = draggedEvent.id || `${draggedEvent.title}-${draggedEvent.originalDate}-${draggedEvent.startTime}`;
      const conflicts = checkConflicts(targetDateString, draggedEvent.startTime, draggedEvent.endTime, draggedEventId);

      if (conflicts.length > 0) {
        toast.error(`Cannot move event: Time conflict with \"${conflicts[0].title}\" (${conflicts[0].startTime} - ${conflicts[0].endTime})`, { duration: 4000 });
        return;
      }

      if (draggedEvent.recurrence && draggedEvent.recurrence !== "none") {
        const result = window.confirm(
          `\"${draggedEvent.title}\" is a recurring event.\n\nMoving it will break it from the recurring series and create a single event.\n\nClick OK to move this event only, or Cancel to keep it as part of the series.`
        );

        if (!result) return;

        const newEvent = {
          ...draggedEvent,
          date: targetDateString,
          recurrence: "none",
          id: `moved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        setEvents((prevEvents) => {
          const filtered = prevEvents.filter((event) => {
            const eventId = event.id || `${event.title}-${event.date}-${event.startTime}`;
            const draggedId = draggedEvent.id || `${draggedEvent.title}-${draggedEvent.originalDate}-${draggedEvent.startTime}`;
            return !(eventId === draggedId && event.date === draggedEvent.originalDate);
          });
          return [...filtered, newEvent];
        });

        toast.success("Event moved successfully (removed from recurring series)", { duration: 3000 });
      } else {
        setEvents((prevEvents) =>
          prevEvents.map((event) => {
            const eventId = event.id || `${event.title}-${event.date}-${event.startTime}`;
            const draggedId = draggedEvent.id || `${draggedEvent.title}-${draggedEvent.originalDate}-${draggedEvent.startTime}`;

            if (eventId === draggedId && event.date === draggedEvent.originalDate) {
              return {
                ...event,
                date: targetDateString,
              };
            }
            return event;
          })
        );

        toast.success("Event moved successfully", { duration: 2000 });
      }
    } catch (error) {
      console.error("Error moving event:", error);
      toast.error("Failed to move event. Please try again.");
    }
  };

  return {
    showAll,
    setShowAll,
    dayString,
    eventsForDay,
    displayedEvents,
    handleEventDrop,
  };
}
