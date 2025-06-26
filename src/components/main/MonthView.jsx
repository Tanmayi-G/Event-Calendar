import { Fragment } from "react";
import { getMonth } from "../../../utils/getTime";
import MonthViewBox from "./MonthViewBox";

const MonthView = () => {
  const currentMonth = getMonth();

  return (
    <section className="grid grid-cols-7 grid-rows-5 lg:h-[89vh]">
      {currentMonth.map((row, i) => (
        <Fragment key={i}>
          {row.map((day, index) => (
            <MonthViewBox key={index} day={day} rowIndex={i} />
          ))}
        </Fragment>
      ))}
    </section>
  );
};

export default MonthView;
