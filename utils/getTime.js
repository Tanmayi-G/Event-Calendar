import { startOfMonth, startOfWeek, addDays, addWeeks } from "date-fns";

export const getMonth = (date = new Date()) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const weeks = [];

  for (let i = 0; i < 5; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      week.push(addDays(addWeeks(start, i), j));
    }
    weeks.push(week);
  }

  return weeks;
};
