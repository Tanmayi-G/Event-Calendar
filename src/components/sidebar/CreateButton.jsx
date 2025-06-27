import { Plus } from "lucide-react";
import { useCalendar } from "../../contexts/CalendarContext";

const CreateButton = () => {
  const { setIsModalOpen, setSelectedDate, currentDate } = useCalendar();

  const handleClick = () => {
    setSelectedDate(currentDate);
    setIsModalOpen(true);
  };

  return (
    <button onClick={handleClick} className="my-4 ml-2 flex justify-center w-1/3 items-center gap-2 rounded-2xl cursor-pointer bg-blue-200 text-black py-3 hover:bg-blue-500">
      <Plus /> <span>Create</span>
    </button>
  );
};

export default CreateButton;
