import { useCalendar } from "../../contexts/CalendarContext";

const EVENT_COLORS = [
  { name: "Blue", color: "blue-500" },
  { name: "Green", color: "green-500" },
  { name: "Red", color: "red-500" },
  { name: "Yellow", color: "yellow-400" },
  { name: "Gray", color: "gray-400" },
];

const EventCategoryFilter = () => {
  const { activeColorFilters, setActiveColorFilters } = useCalendar();

  const toggleColorFilter = (colorName) => {
    setActiveColorFilters((prev) => (prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]));
  };

  return (
    <div className="mt-4 space-y-2 ml-5">
      <h3 className="text-base font-medium text-base-content mb-2">Filter by category</h3>
      {EVENT_COLORS.map(({ name, color }) => (
        <label key={name} className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={activeColorFilters.includes(name)} onChange={() => toggleColorFilter(name)} className="checkbox checkbox-sm" />
          <span className="flex items-center gap-1 text-sm text-base-content">
            <span className={`w-3 h-3 rounded-full bg-${color}`} />
            {name}
          </span>
        </label>
      ))}
    </div>
  );
};

export default EventCategoryFilter;
