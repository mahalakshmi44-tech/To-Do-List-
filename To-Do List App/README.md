# TaskMaster — Modern To-Do List Web Application

A lightweight, feature-packed To-Do List web application built with Vanilla HTML5, CSS3, and JavaScript (ES6+). It provides real-time state management, CRUD task operations, dynamic UI updates, and persistence across browser sessions using `window.localStorage`.

---

## ✨ Features

- **Full CRUD Operations**:
  - **Create**: Add tasks with customizable priority levels (**High**, **Medium**, **Low**) and due dates.
  - **Read / View**: Real-time rendering of task items with priority badges, overdue indicators, and animated completion progress meter.
  - **Update**:
    - Toggle completion status with checkmark feedback and strikethrough styling.
    - Inline task editing (edit title, priority, due date) with keyboard support (`Enter` to save, `Escape` to cancel) or double-clicking any task.
  - **Delete**: Single task removal and batch "Clear Completed" action.
- **Persistence Across Sessions**: Automatically saves and synchronizes task state, completion counts, and theme preferences via `window.localStorage`.
- **Filtering & Search**:
  - Quick-filter tabs: **All**, **Active**, and **Completed** with live counter badges.
  - Real-time instant search bar.
  - Sorting options: **Newest First**, **Oldest First**, **Highest Priority**, and **Earliest Due Date**.
- **Modern Responsive Design**:
  - Clean card-based aesthetic with custom checkboxes, badges, and smooth transitions.
  - Light & Dark mode switch (preference saved to `localStorage`).
  - Mobile-first responsive layout (works seamlessly on desktop, tablet, and mobile browsers).
  - Empty state feedback customized to the current filter or search query.
  - Non-intrusive toast notifications for user interactions.

---

## 📁 Project Structure

```
To-Do List App/
├── index.html       # Semantic HTML layout and UI components
├── style.css        # Responsive styling, CSS variables, dark/light themes
├── app.js           # State management, LocalStorage, event handling, DOM rendering
└── README.md        # Documentation and usage guide
```

---

## 🚀 How to Run the Application

No build tools or server installation required!

1. **Directly in Browser**:
   - Double-click `index.html` to open it in your default web browser (Chrome, Edge, Firefox, Safari).
2. **Via Local Server (Optional)**:
   - If using VS Code: Right-click `index.html` and select **"Open with Live Server"**.
   - Or run with Python:
     ```bash
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000` in your browser.

---

## 🛠️ Technical Details & Concepts Implemented

- **DOM Manipulation & Dynamic Elements**:
  - Elements dynamically created, updated, and removed using safe text-escaping to prevent XSS.
  - Event delegation used on the task container to handle clicks on checkboxes, edit triggers, and delete buttons efficiently.
- **Task-State Management**:
  - Centralized in-memory state object (`state.tasks`, `state.currentFilter`, `state.searchQuery`, `state.sortBy`, `state.editingTaskId`).
  - Decoupled state mutation and UI rendering pipeline (`render()` function).
- **Web Storage API (`window.localStorage`)**:
  - JSON serialization (`JSON.stringify` / `JSON.parse`) with fallback default seed tasks.
  - Persistent theme mode selection.
