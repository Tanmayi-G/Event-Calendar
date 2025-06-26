import { getYear, getMonth as dfGetMonth, startOfMonth, getDay, addDays } from "date-fns";

export const getMonth = (month = dfGetMonth(new Date())) => {
  const year = getYear(new Date());
  const firstDayOfMonth = getDay(startOfMonth(new Date(year, month)));

  let dayCounter = -firstDayOfMonth;

  return Array.from({ length: 5 }, () => Array.from({ length: 7 }, () => addDays(new Date(year, month, 1), dayCounter++)));
};
