import { useState, useEffect } from "react";
import { useCalendar } from "../../contexts/CalendarContext";
import { format, addDays, addWeeks, addMonths, parse, isAfter, isBefore } from "date-fns";
import toast from "react-hot-toast";

const COLOR_OPTIONS = [
  { label: "Default", value: "default", bg: "bg-gray-400" },
  { label: "Blue", value: "blue", bg: "bg-blue-500" },
  { label: "Green", value: "green", bg: "bg-green-500" },
  { label: "Red", value: "red", bg: "bg-red-500" },
  { label: "Yellow", value: "yellow", bg: "bg-yellow-400" },
];

const EventModal = () => {
  const { selectedDate, setIsModalOpen, addEvent, selectedEvent, setSelectedEvent, setIsViewModalOpen, setEvents, events } = useCalendar();

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

    const conflictingEvents = events.filter((event) => {
      if (excludeEvent && event === excludeEvent) return false;

      if (event.date !== eventDate) return false;

      const existingStart = timeToMinutes(event.startTime);
      const existingEnd = timeToMinutes(event.endTime);

      return eventStart < existingEnd && eventEnd > existingStart;
    });

    return conflictingEvents;
  };

  useEffect(() => {
    if (date && startTime && endTime) {
      const conflictingEvents = checkConflicts(date, startTime, endTime, isEditing ? selectedEvent : null);
      setConflicts(conflictingEvents);
    } else {
      setConflicts([]);
    }
  }, [date, startTime, endTime, events, isEditing, selectedEvent]);

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
        events.push({ ...baseEvent, date: format(nextDate, "yyyy-MM-dd") });
      }
    } else if (recurrence === "weekly") {
      const selectedDays = weeklyDays.length ? weeklyDays.map(Number) : [start.getDay()];
      for (let week = 0; week < 52; week++) {
        selectedDays.forEach((dow) => {
          const next = new Date(start);
          next.setDate(start.getDate() + 7 * week + dow - start.getDay());
          if (next > start && (!limit || next <= limit)) {
            events.push({ ...baseEvent, date: format(next, "yyyy-MM-dd") });
          }
        });
      }
    } else if (recurrence === "monthly") {
      for (let i = 1; i < 24; i++) {
        const nextDate = addMonths(start, i);
        if (limit && nextDate > limit) break;
        events.push({ ...baseEvent, date: format(nextDate, "yyyy-MM-dd") });
      }
    } else if (recurrence === "custom") {
      for (let i = 1; i < 100; i++) {
        const nextDate = addWeeks(start, i * customInterval);
        if (limit && nextDate > limit) break;
        events.push({ ...baseEvent, date: format(nextDate, "yyyy-MM-dd") });
      }
    }

    return events;
  };

  useEffect(() => {
    if (isEditing) {
      const { title, date, startTime, endTime, description, recurrence, color } = selectedEvent;
      setTitle(title);
      setDate(date);
      setStartTime(startTime || selectedEvent.time);
      setEndTime(endTime || "");
      setDescription(description);
      setRecurrence(recurrence);
      setColor(color);
    } else if (selectedDate) {
      setDate(format(selectedDate, "yyyy-MM-dd"));
    }
  }, [isEditing, selectedDate, selectedEvent]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !startTime || !endTime || !date) {
      toast.error("Missing required fields");
      return;
    }

    if (!validateTimes()) {
      toast.error("End time must be after start time");
      return;
    }

    if (conflicts.length > 0) {
      toast.error(`Conflict detected with ${conflicts.length} existing event(s)!`);
      return;
    }

    const baseEvent = {
      title,
      date,
      startTime,
      endTime,
      time: startTime,
      description,
      recurrence,
      color,
    };

    try {
      if (isEditing) {
        setEvents(events.map((event) => (event === selectedEvent ? baseEvent : event)));
        toast.success("Event edited successfully");
        setSelectedEvent(null);
        setIsViewModalOpen(false);
      } else {
        const newEvents = generateRecurringEvents(baseEvent);

        const hasConflicts = newEvents.some((event) => {
          const eventConflicts = checkConflicts(event.date, event.startTime, event.endTime);
          return eventConflicts.length > 0;
        });

        if (hasConflicts) {
          toast.error("Some recurring events conflict with existing events");
          return;
        }

        newEvents.forEach(addEvent);
        toast.success("Event created successfully");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (!selectedDate && !selectedEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl bg-base-100 p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-xl font-semibold">{isEditing ? "Edit Event" : "Create Event"}</h2>

        {conflicts.length > 0 && (
          <div className="alert alert-warning mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.346 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Time Conflict Detected!</h3>
              <div className="text-xs">
                {conflicts.map((conflict, idx) => (
                  <div key={idx}>
                    • {conflict.title} ({conflict.startTime} - {conflict.endTime})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-control">
            <input type="text" placeholder="Add title" className="input input-bordered w-full text-lg" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-control">
            <input type="date" className="input input-bordered" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start Time</span>
              </label>
              <select className="select select-bordered cursor-pointer" value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
                <option value="" disabled>
                  Select Start Time
                </option>
                {generateTimeSlots().map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">End Time</span>
              </label>
              <select className="select select-bordered cursor-pointer" value={endTime} onChange={(e) => setEndTime(e.target.value)} required>
                <option value="" disabled>
                  Select End Time
                </option>
                {generateTimeSlots().map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {startTime && endTime && !validateTimes() && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>End time must be after start time</span>
            </div>
          )}

          <div className="form-control">
            <textarea className="textarea textarea-bordered" placeholder="Add description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text mr-3">Repeat</span>
            </label>
            <select className="select select-bordered cursor-pointer" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {recurrence !== "none" && (
            <div className="form-control">
              <label className="label">
                <span className="label-text mr-2">End date for recurrence</span>
              </label>
              <input type="date" className="input input-bordered" value={endDate} min={date} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          )}

          {recurrence === "weekly" && (
            <div className="form-control">
              <label className="label">
                <span className="label-text mb-2">Repeat on</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                  <label key={day} className="cursor-pointer label gap-1">
                    <input
                      type="checkbox"
                      checked={weeklyDays.includes(String(idx))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWeeklyDays([...weeklyDays, String(idx)]);
                        } else {
                          setWeeklyDays(weeklyDays.filter((d) => d !== String(idx)));
                        }
                      }}
                      className="checkbox"
                    />
                    <span className="label-text">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {recurrence === "custom" && (
            <div className="form-control">
              <label className="label">
                <span className="label-text mr-3">Repeat every</span>
              </label>
              <input type="number" min="1" className="input input-bordered w-20" value={customInterval} onChange={(e) => setCustomInterval(Number(e.target.value))} />
              <span className="text-sm mt-1 text-gray-500 ml-2">week(s)</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text mb-2">Event Color/Category</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setColor(opt.value)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm cursor-pointer transition-all hover:scale-105 ${
                    color === opt.value ? "border-primary" : "border-transparent"
                  }`}
                >
                  <span className={`h-4 w-4 rounded-full ${opt.bg}`}></span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedEvent(null);
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className={`btn btn-primary ${conflicts.length > 0 ? "btn-disabled" : ""}`} disabled={conflicts.length > 0 || !validateTimes()}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
