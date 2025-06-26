import { isSameDay, parseISO } from "date-fns";

export const getEventsForDateAndHour = (events, targetDate, hour) => {
  return events.filter((event) => {
    const eventDate = parseISO(event.date);
    const eventHour = parseInt(event.time.split(":")[0]);
    return isSameDay(eventDate, targetDate) && eventHour === hour;
  });
};
