import { createContext, useContext } from "react";
import useCalendarData from "../hooks/useCalendarData";

const CalendarContext = createContext();
export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider = ({ children }) => {
  const value = useCalendarData();

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};
