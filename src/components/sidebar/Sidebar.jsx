import CreateButton from "./CreateButton";
import MiniCalendar from "./MiniCalendar";
import EventCategoryFilter from "./EventCategoryFilter";
import { useCalendar } from "../../contexts/CalendarContext";

const Sidebar = () => {
  const { isSidebarOpen } = useCalendar();

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-92 hidden border-t px-2 py-3 transition-all duration-300 ease-in-out lg:block">
      <CreateButton />
      <MiniCalendar />
      <EventCategoryFilter />
    </aside>
  );
};

export default Sidebar;
