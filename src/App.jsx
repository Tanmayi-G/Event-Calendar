import Header from "./components/Header";
import MainView from "./components/main/MainView";
import EventModal from "./components/modal/EventModal";
import ViewEventModal from "./components/modal/ViewEventModal";
import { useCalendar } from "./contexts/CalendarContext";

function App() {
  const { isModalOpen, isViewModalOpen } = useCalendar();

  return (
    <div className="relative">
      <Header />
      <MainView />
      {isModalOpen && <EventModal />}
      {isViewModalOpen && <ViewEventModal />}
    </div>
  );
}

export default App;
