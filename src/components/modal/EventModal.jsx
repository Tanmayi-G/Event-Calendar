import { useState, useEffect } from "react";
import { useCalendar } from "../../contexts/CalendarContext";
import { format, addDays, addWeeks, addMonths } from "date-fns";
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
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [color, setColor] = useState("default");
  const [customInterval, setCustomInterval] = useState(1);
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [endDate, setEndDate] = useState("");

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
      const { title, date, time, description, recurrence, color } = selectedEvent;
      setTitle(title);
      setDate(date);
      setTime(time);
      setDescription(description);
      setRecurrence(recurrence);
      setColor(color);
    } else if (selectedDate) {
      setDate(format(selectedDate, "yyyy-MM-dd"));
    }
  }, [isEditing, selectedDate, selectedEvent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !time || !date) {
      toast.error("Missing required fields");
      return;
    }

    const baseEvent = { title, date, time, description, recurrence, color };

    try {
      if (isEditing) {
        setEvents(events.map((event) => (event === selectedEvent ? baseEvent : event)));
        toast.success("Event edited successfully");
        setSelectedEvent(null);
        setIsViewModalOpen(false);
      } else {
        const newEvents = generateRecurringEvents(baseEvent);
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
      <div className="w-full max-w-xl rounded-2xl bg-base-100 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">{isEditing ? "Edit Event" : "Create Event"}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-control">
            <input type="text" placeholder="Add title" className="input input-bordered w-full text-lg" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="input input-bordered" value={date} onChange={(e) => setDate(e.target.value)} required />
            <select className="select select-bordered cursor-pointer" value={time} onChange={(e) => setTime(e.target.value)} required>
              <option value="" disabled>
                Select Time
              </option>
              {generateTimeSlots().map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <textarea className="textarea textarea-bordered" placeholder="Add description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
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
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
