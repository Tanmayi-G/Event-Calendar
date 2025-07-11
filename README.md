# 📅 Custom Event Calendar

A fully-featured interactive calendar application built with React. This calendar allows users to manage events, schedule recurring activities, and reschedule them using intuitive drag-and-drop interactions.

## 🚀 Live Demo

[Click here to view the live demo](https://event-calendar-teal.vercel.app/)

---

## 📌 Features

### ✅ Multiple Calendar Views

- **📆 Monthly View**  
  Traditional calendar grid that highlights the current day and allows navigation between months.

- **🗓️ Weekly View**  
  Displays events in a week-by-week layout with hourly time slots.

- **📅 Daily View**  
  Focused view for a single day’s schedule, perfect for managing busy days.

### 📝 Event Management

- **Add Events:** Click on any day to create an event with title, time, description, recurrence, and color/category.
- **Edit Events:** Modify event details easily by clicking on them.
- **Delete Events:** Remove events directly from the calendar or event details popup.

### 🔁 Recurring Events

- Supports:
  - Daily
  - Weekly (specific days)
  - Monthly (specific date)
  - Custom patterns (e.g., every 2 weeks)
- Recurring instances are rendered properly in the calendar.

### 🔄 Drag-and-Drop Rescheduling

- Reschedule events by dragging them to a different time or date.
- Conflict prevention and visual feedback during dragging.

### ⚠️ Event Conflict Management

- Prevents creation or movement of events that overlap in time.
- Shows user-friendly warnings when conflicts occur.

### 🔍 Event Filtering & Search

- Filter by category.
- Search events by title in real-time.

### 💾 Persistence

- Uses **LocalStorage** to persist events across page reloads and sessions.

### 📱 Responsive Design

- Optimized for desktop and mobile.
- Adaptive layout (Day/Week view fallback on smaller screens).

---

## 🛠️ Tech Stack

| Tech             | Usage                             |
| ---------------- | --------------------------------- |
| **React**        | Frontend Framework                |
| **Tailwind CSS** | Styling                           |
| **date-fns**     | Date & Time Utilities             |
| **React DnD**    | Drag-and-drop interactions        |
| **LocalStorage** | Event persistence                 |
| **Vite**         | Build tool for lightning-fast dev |

---

## 📦 Installation & Running Locally

```bash
# Clone the repository
git clone https://github.com/Tanmayi-G/Event-Calendar.git
cd Event-Calendar

# Install dependencies
npm install

# Start the development server
npm run dev
```
