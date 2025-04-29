import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { useEffect, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, getDay, parse, startOfWeek } from "date-fns";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function RoomCalendarView() {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    setIsLoading(true);
    // Fetch data and set events here
    setIsLoading(false);
  }, []);

  const handleCreateEvent = () => {
    if (selectedSlot && newTitle.trim() !== "") {
      const newEvent = {
        title: newTitle,
        start: selectedSlot.start,
        end: selectedSlot.end,
        allDay: selectedSlot.allDay,
      };
      setEvents([...events, newEvent]);
      setModalOpen(false);
      setNewTitle("");
    }
  };

  return (
    <div className="h-[800px] relative">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        onSelectEvent={(event) => console.log(event)}
        onSelectSlot={(slotInfo) => {
          setSelectedSlot(slotInfo);
          setModalOpen(true);
        }}
        onEventDrop={({ event, start, end }) => {
          const updatedEvents = events.map((evt) =>
            evt.id === event.id ? { ...evt, start, end } : evt
          );
          setEvents(updatedEvents);
        }}
        onEventResize={({ event, start, end }) => {
          const updatedEvents = events.map((evt) =>
            evt.id === event.id ? { ...evt, start, end } : evt
          );
          setEvents(updatedEvents);
        }}
        selectable
        resizable
      />

      {modalOpen && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded p-4 z-10">
          <h2 className="text-lg font-semibold mb-2">Tạo sự kiện mới</h2>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Nhập tiêu đề sự kiện"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => setModalOpen(false)}
            >
              Hủy
            </button>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={handleCreateEvent}
            >
              Tạo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
