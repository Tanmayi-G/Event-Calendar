import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import WeekViewContent from "./WeekViewContent";

const WeekView = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <WeekViewContent />
    </DndProvider>
  );
};

export default WeekView;
