import { createContext, useContext, useState } from "react";
import { startOfToday } from "date-fns";

const CalendarContext = createContext();

export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(startOfToday());

  return <CalendarContext.Provider value={{ currentDate, setCurrentDate }}>{children}</CalendarContext.Provider>;
};
