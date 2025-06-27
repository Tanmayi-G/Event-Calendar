import Sidebar from "../sidebar/Sidebar";
import MonthView from "./monthView/MonthView";
import WeekView from "./weekView/WeekView";
import DayView from "./dayView/DayView";
import { useCalendar } from "../../contexts/CalendarContext";

const MainView = () => {
  const { viewMode } = useCalendar();

  const renderView = () => {
    switch (viewMode) {
      case "week":
        return <WeekView />;
      case "day":
        return <DayView />;
      default:
        return <MonthView />;
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full flex-1">{renderView()}</div>
    </div>
  );
};

export default MainView;
