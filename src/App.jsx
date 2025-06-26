import Header from "./components/Header";
import MainView from "./components/main/MainView";
import EventModal from "./components/modal/EventModal";
import ViewEventModal from "./components/modal/ViewEventModal";
import { useCalendar } from "./contexts/CalendarContext";
import { Toaster } from "react-hot-toast";

function App() {
  const { isModalOpen, isViewModalOpen } = useCalendar();

  return (
    <div className="relative">
      <Header />
      <MainView />
      {isModalOpen && <EventModal />}
      {isViewModalOpen && <ViewEventModal />}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
