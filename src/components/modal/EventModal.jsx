import { COLOR_OPTIONS } from "./constants";
import toast from "react-hot-toast";
import useEventModal from "../../hooks/useEventModal";

const EventModal = () => {
  const {
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
  } = useEventModal();

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

    if (recurrence !== "none" && !endDate) {
      toast.error("End date is required for recurring events");
      return;
    }

    const baseEvent = {
      id: isEditing ? selectedEvent.id : `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      date,
      startTime,
      endTime,
      time: startTime,
      description,
      recurrence,
      color,
      endDate: recurrence !== "none" ? endDate : undefined,
      customInterval: recurrence === "custom" ? customInterval : undefined,
      weeklyDays: recurrence === "weekly" ? weeklyDays : undefined,
    };

    try {
      if (isEditing) {
        setEvents(events.map((event) => (event === selectedEvent ? baseEvent : event)));
        toast.success("Event edited successfully");
        setSelectedEvent(null);
        setIsViewModalOpen(false);
      } else {
        const newEvents = generateRecurringEvents(baseEvent);
        const hasConflicts = newEvents.some((event) => checkConflicts(event.date, event.startTime, event.endTime).length > 0);

        if (hasConflicts) {
          toast.error("Some recurring events conflict with existing events");
          return;
        }

        newEvents.forEach(addEvent);
        toast.success(newEvents.length === 1 ? "Event created successfully" : `${newEvents.length} recurring events created successfully`);
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
              <div className="label">
                <span className="label-text-alt text-gray-500">{!endDate && recurrence !== "none" && "A default end date will be set based on recurrence type"}</span>
              </div>
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
              <div className="flex items-center gap-2">
                <input type="number" min="1" className="input input-bordered w-20" value={customInterval} onChange={(e) => setCustomInterval(Number(e.target.value))} />
                <span className="text-sm text-gray-500">week(s)</span>
              </div>
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
