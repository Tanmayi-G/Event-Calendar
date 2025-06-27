import { useCalendar } from "../../contexts/CalendarContext";
import toast from "react-hot-toast";
import { COLOR_MAP } from "./constants";

const ViewEventModal = () => {
  const { isViewModalOpen, setIsViewModalOpen, selectedEvent, setIsModalOpen, setSelectedEvent, setSelectedDate, setEvents, events, searchQuery } = useCalendar();

  if (!isViewModalOpen || !selectedEvent) return null;

  const { title, date, startTime, endTime, description, recurrence, color } = selectedEvent;

  const handleEdit = () => {
    setIsViewModalOpen(false);
    setSelectedDate(new Date(date));
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    const confirmDelete = confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      setEvents(events.filter((e) => e !== selectedEvent));
      setIsViewModalOpen(false);
      setSelectedEvent(null);
      toast.success("Event deleted successfully");
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  const highlightText = (text, query) => {
    if (!query || !text) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Event Details</h2>
          <button onClick={() => setIsViewModalOpen(false)} className="btn btn-sm btn-ghost">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-400">Title</p>
            <p className="text-base font-medium">{highlightText(title, searchQuery)}</p>
          </div>
          <div>
            <p className="text-gray-400">Date & Time</p>
            <p>
              {date} | {startTime} - {endTime}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Description</p>
            <p className="whitespace-pre-wrap">{description ? highlightText(description, searchQuery) : "—"}</p>
          </div>
          <div>
            <p className="text-gray-400">Recurrence</p>
            <p>{recurrence === "none" ? "None" : recurrence}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-400">Color</p>
            <span className={`w-4 h-4 rounded-full ${COLOR_MAP[color]}`}></span>
            <span className="capitalize">{color}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={handleDelete} className="btn btn-error btn-outline">
            Delete
          </button>
          <button onClick={handleEdit} className="btn btn-primary">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEventModal;
