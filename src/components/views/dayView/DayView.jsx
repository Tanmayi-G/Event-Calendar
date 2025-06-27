import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DayViewContent from "./DayViewContent";

const DayView = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DayViewContent />
    </DndProvider>
  );
};

export default DayView;
