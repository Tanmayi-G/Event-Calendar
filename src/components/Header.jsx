import { Menu, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const Header = () => {
  return (
    <div className="mx-3 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="hidden items-center lg:flex">
          <button className="btn btn-ghost p-2 mx-2">
            <Menu />
          </button>
          <CalendarDays />
          <h1 className="text-lg font-bold ml-1">Calendar</h1>
        </div>

        <button className="btn btn-outline mx-2">Today</button>

        <div className="flex items-center gap-3">
          <ChevronLeft className="cursor-pointer" />
          <ChevronRight className="cursor-pointer" />
        </div>

        <h1 className="hidden text-lg lg:block">June 26 2025</h1>
      </div>

      <div className="flex items-center space-x-4">
        <select defaultValue="month" className="select cursor-pointer">
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
        </select>
        <div className="avatar">
          <div className="w-12 h-12 rounded-full cursor-pointer">
            <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
