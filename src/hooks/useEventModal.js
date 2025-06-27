import { useEffect, useState } from "react";
import { useCalendar } from "../contexts/CalendarContext";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";

const generateEventId = () => `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const useEventModal = () => {
  const { selectedDate, selectedEvent, events, addEvent, setIsModalOpen, setEvents, setSelectedEvent, setIsViewModalOpen } = useCalendar();

  const isEditing = !!selectedEvent;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [color, setColor] = useState("default");
  const [customInterval, setCustomInterval] = useState(1);
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [endDate, setEndDate] = useState("");
  const [conflicts, setConflicts] = useState([]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h % 12 === 0 ? 12 : h % 12;
        const minute = m.toString().padStart(2, "0");
        const ampm = h < 12 ? "AM" : "PM";
        slots.push(`${hour}:${minute} ${ampm}`);
      }
    }
    return slots;
  };

  const timeToMinutes = (timeStr) => {
    const [time, ampm] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalHours = hours;

    if (ampm === "PM" && hours !== 12) totalHours += 12;
    if (ampm === "AM" && hours === 12) totalHours = 0;

    return totalHours * 60 + minutes;
  };

  const checkConflicts = (eventDate, eventStartTime, eventEndTime, excludeEvent = null) => {
    const eventStart = timeToMinutes(eventStartTime);
    const eventEnd = timeToMinutes(eventEndTime);

    return events.filter((event) => {
      if (excludeEvent && event === excludeEvent) return false;
      if (event.date !== eventDate) return false;

      const existingStart = timeToMinutes(event.startTime);
      const existingEnd = timeToMinutes(event.endTime);

      return eventStart < existingEnd && eventEnd > existingStart;
    });
  };

  const getDefaultEndDate = (startDate, recurrenceType) => {
    const start = new Date(startDate);
    switch (recurrenceType) {
      case "daily":
        return format(addMonths(start, 3), "yyyy-MM-dd");
      case "weekly":
        return format(addMonths(start, 6), "yyyy-MM-dd");
      case "monthly":
        return format(addYears(start, 1), "yyyy-MM-dd");
      case "custom":
        return format(addMonths(start, 6), "yyyy-MM-dd");
      default:
        return format(addMonths(start, 6), "yyyy-MM-dd");
    }
  };

  const validateTimes = () => {
    if (!startTime || !endTime) return true;
    return timeToMinutes(endTime) > timeToMinutes(startTime);
  };

  const generateRecurringEvents = (baseEvent) => {
    const events = [baseEvent];
    const start = new Date(baseEvent.date);
    const limit = endDate ? new Date(endDate) : null;

    if (recurrence === "daily") {
      for (let i = 1; i < 365; i++) {
        const nextDate = addDays(start, i);
        if (limit && nextDate > limit) break;
        events.push({ ...baseEvent, date: format(nextDate, "yyyy-MM-dd"), id: generateEventId() });
      }
    } else if (recurrence === "weekly") {
      const selectedDays = weeklyDays.length ? weeklyDays.map(Number) : [start.getDay()];
      for (let week = 0; week < 52; week++) {
        selectedDays.forEach((dow) => {
          const next = new Date(start);
          next.setDate(start.getDate() + 7 * week + dow - start.getDay());
          if (next > start && (!limit || next <= limit)) {
            events.push({ ...baseEvent, date: format(next, "yyyy-MM-dd"), id: generateEventId() });
          }
        });
      }
    } else if (recurrence === "monthly") {
      for (let i = 1; i < 24; i++) {
        const nextDate = addMonths(start, i);
        if (limit && nextDate > limit) break;
        events.push({ ...baseEvent, date: format(nextDate, "yyyy-MM-dd"), id: generateEventId() });
      }
    } else if (recurrence === "custom") {
      for (let i = 1; i < 100; i++) {
        const nextDate = addWeeks(start, i * customInterval);
        if (limit && nextDate > limit) break;
        events.push({ ...baseEvent, date: format(nextDate, "yyyy-MM-dd"), id: generateEventId() });
      }
    }

    return events;
  };

  useEffect(() => {
    if (date && startTime && endTime) {
      setConflicts(checkConflicts(date, startTime, endTime, isEditing ? selectedEvent : null));
    } else {
      setConflicts([]);
    }
  }, [date, startTime, endTime, events, isEditing, selectedEvent]);

  useEffect(() => {
    if (recurrence !== "none" && date && !endDate) {
      setEndDate(getDefaultEndDate(date, recurrence));
    }
  }, [recurrence, date, endDate]);

  useEffect(() => {
    if (isEditing) {
      const ev = selectedEvent;
      setTitle(ev.title);
      setDate(ev.date);
      setStartTime(ev.startTime || ev.time);
      setEndTime(ev.endTime || "");
      setDescription(ev.description);
      setRecurrence(ev.recurrence || "none");
      setColor(ev.color || "default");
      setCustomInterval(ev.customInterval || 1);
      setWeeklyDays(ev.weeklyDays || []);
      setEndDate(ev.recurrence && ev.recurrence !== "none" ? ev.endDate || getDefaultEndDate(ev.date, ev.recurrence) : "");
    } else if (selectedDate) {
      setDate(format(selectedDate, "yyyy-MM-dd"));
      setTitle("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      setRecurrence("none");
      setColor("default");
      setCustomInterval(1);
      setWeeklyDays([]);
      setEndDate("");
    }
  }, [isEditing, selectedDate, selectedEvent]);

  return {
    title,
    date,
    startTime,
    endTime,
    description,
    recurrence,
    color,
    customInterval,
    weeklyDays,
    endDate,
    conflicts,
    setTitle,
    setDate,
    setStartTime,
    setEndTime,
    setDescription,
    setRecurrence,
    setColor,
    setCustomInterval,
    setWeeklyDays,
    setEndDate,
    generateTimeSlots,
    validateTimes,
    generateRecurringEvents,
    checkConflicts,
    isEditing,
    selectedEvent,
    selectedDate,
    setIsModalOpen,
    setEvents,
    events,
    addEvent,
    setSelectedEvent,
    setIsViewModalOpen,
  };
};

export default useEventModal;
