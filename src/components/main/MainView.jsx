import Sidebar from "../sidebar/Sidebar";
import MonthView from "./MonthView";

const MainView = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full flex-1">
        <MonthView />
      </div>
    </div>
  );
};

export default MainView;
