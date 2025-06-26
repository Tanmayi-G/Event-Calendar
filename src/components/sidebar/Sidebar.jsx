import CreateButton from "./CreateButton";
import MiniCalendar from "./MiniCalendar";

const Sidebar = () => {
  return (
    <aside className={`w-92 hidden border-t px-2 py-3 transition-all duration-300 ease-in-out lg:block`}>
      <CreateButton />
      <MiniCalendar />
    </aside>
  );
};

export default Sidebar;
