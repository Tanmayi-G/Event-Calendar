import Header from "./components/Header";
import MainView from "./components/main/MainView";
import EventModal from "./components/event-modal/EventModal";
import { useCalendar } from "./contexts/CalendarContext";

function App() {
  const { isModalOpen } = useCalendar();

  return (
    <div className="relative">
      <Header />
      <MainView />
      {isModalOpen && <EventModal />}
    </div>
  );
}

export default App;
