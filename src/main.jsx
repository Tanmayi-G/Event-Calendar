import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CalendarProvider } from "./contexts/CalendarContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CalendarProvider>
      <App />
    </CalendarProvider>
  </StrictMode>
);
