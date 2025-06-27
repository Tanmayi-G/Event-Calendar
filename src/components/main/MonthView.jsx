import { Fragment } from "react";
import { getMonth } from "../../../utils/getTime";
import MonthViewBox from "./MonthViewBox";
import { useCalendar } from "../../contexts/CalendarContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const MonthView = () => {
  const { currentDate } = useCalendar();
  const currentMonth = getMonth(currentDate);

  return (
    <DndProvider backend={HTML5Backend}>
      <section className="grid grid-cols-7 grid-rows-5 lg:h-[89vh]">
        {currentMonth.map((row, i) => (
          <Fragment key={i}>
            {row.map((day, index) => (
              <MonthViewBox key={index} day={day} rowIndex={i} />
            ))}
          </Fragment>
        ))}
      </section>
    </DndProvider>
  );
};

export default MonthView;
