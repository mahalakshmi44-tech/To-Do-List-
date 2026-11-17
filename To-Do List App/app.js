/**
 * TaskMaster — Modern To-Do List Application
 * Core JavaScript logic: State Management, LocalStorage Persistence,
 * DOM Manipulation, Event Handling, and CRUD operations.
 */

// ==========================================================================
// Storage Keys & Seed Data
// ==========================================================================

const STORAGE_KEYS = {
  TASKS: 'taskmaster_tasks_v1',
  THEME: 'taskmaster_theme_v1'
};

const SAMPLE_TASKS = [
  {
    id: 'task_' + (Date.now() - 3600000 * 24),
    title: 'Review project requirements and setup codebase',
    priority: 'high',
    dueDate: getFormattedDate(0), // today
    completed: true,
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: 'task_' + (Date.now() - 3600000 * 12),
    title: 'Design responsive UI components with Light/Dark mode',
    priority: 'medium',
    dueDate: getFormattedDate(1), // tomorrow
    completed: false,
    createdAt: Date.now() - 3600000 * 12
  },
  {
    id: 'task_' + Date.now(),
    title: 'Integrate LocalStorage CRUD operations and event handling',
    priority: 'high',
    dueDate: getFormattedDate(2),
    completed: false,
    createdAt: Date.now()
  },
  {
    id: 'task_' + (Date.now() + 1000),
    title: 'Read MDN documentation on Web Storage APIs',
    priority: 'low',
    dueDate: '',
    completed: false,
    createdAt: Date.now() + 1000
  }
];

// ==========================================================================
// Application State
// ==========================================================================

const state = {
  tasks: [],
  currentFilter: 'all', // 'all' | 'active' | 'completed'
  searchQuery: '',
  sortBy: 'date-desc',
  editingTaskId: null
};

// ==========================================================================
// DOM Element Selectors
// ==========================================================================

const elements = {
  html: document.documentElement,
  themeToggle: document.getElementById('theme-toggle'),
  currentDate: document.getElementById('current-date'),
  
  // Progress
  progressBar: document.getElementById('progress-bar'),
  progressPercent: document.getElementById('progress-percent'),
  progressCounts: document.getElementById('progress-counts'),

  // Input Form
  taskForm: document.getElementById('task-form'),
  taskTitleInput: document.getElementById('task-title-input'),
  taskPrioritySelect: document.getElementById('task-priority-select'),
  taskDueDateInput: document.getElementById('task-duedate-input'),

  // Controls
  searchInput: document.getElementById('search-input'),
  filterTabs: document.querySelectorAll('.filter-tab'),
  countAll: document.getElementById('count-all'),
  countActive: document.getElementById('count-active'),
  countCompleted: document.getElementById('count-completed'),
  sortSelect: document.getElementById('sort-select'),

  // Task List & States
  taskList: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-title'),
  emptySubtitle: document.getElementById('empty-subtitle'),

  // Footer Actions
  itemsLeft: document.getElementById('items-left'),
  clearCompletedBtn: document.getElementById('clear-completed-btn'),
  resetSampleBtn: document.getElementById('reset-sample-btn'),

  // Toast
  toast: document.getElementById('toast')
};

// ==========================================================================
// LocalStorage Service
// ==========================================================================

const StorageService = {
  getTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!stored) {
        // First visit: Seed sample tasks
        this.saveTasks(SAMPLE_TASKS);
        return [...SAMPLE_TASKS];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading tasks from LocalStorage:', error);
      return [];
    }
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error persisting tasks to LocalStorage:', error);
      showToast('⚠️ Storage limit reached or error saving');
    }
  },

  getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Error persisting theme preference:', error);
    }
  }
};

// ==========================================================================
// Helper Utilities
// ==========================================================================

function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let toastTimer = null;
function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2400);
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = getFormattedDate(0);
  return dueDate < today;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// ==========================================================================
// Theme Management
// ==========================================================================

function initTheme() {
  const savedTheme = StorageService.getTheme();
  setTheme(savedTheme);

  elements.themeToggle.addEventListener('click', () => {
    const current = elements.html.getAttribute('data-theme') || 'light';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme} theme`);
  });
}

function setTheme(theme) {
  elements.html.setAttribute('data-theme', theme);
  StorageService.saveTheme(theme);
}

// ==========================================================================
// CRUD Operations
// ==========================================================================

/**
 * Create a new task and persist
 */
function handleAddTask(e) {
  e.preventDefault();
  const title = elements.taskTitleInput.value.trim();
  const priority = elements.taskPrioritySelect.value;
  const dueDate = elements.taskDueDateInput.value;

  if (!title) {
    elements.taskTitleInput.focus();
    return;
  }

  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    title: title,
    priority: priority,
    dueDate: dueDate,
    completed: false,
    createdAt: Date.now()
  };

  // Add to top of list
  state.tasks.unshift(newTask);
  StorageService.saveTasks(state.tasks);

  // Reset form inputs
  elements.taskTitleInput.value = '';
  elements.taskPrioritySelect.value = 'medium';
  elements.taskDueDateInput.value = '';
  elements.taskTitleInput.focus();

  render();
  showToast('Task added successfully!');
}

/**
 * Toggle task completion status
 */
function toggleTaskCompletion(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  StorageService.saveTasks(state.tasks);
  render();

  if (task.completed) {
    showToast('Task completed! 🎉');
  }
}

/**
 * Delete a specific task
 */
function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  if (state.editingTaskId === id) {
    state.editingTaskId = null;
  }
  StorageService.saveTasks(state.tasks);
  render();
  showToast('Task deleted');
}

/**
 * Clear all completed tasks
 */
function clearCompletedTasks() {
  const completedCount = state.tasks.filter(t => t.completed).length;
  if (completedCount === 0) return;

  state.tasks = state.tasks.filter(t => !t.completed);
  state.editingTaskId = null;
  StorageService.saveTasks(state.tasks);
  render();
  showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`);
}

/**
 * Enter inline edit mode
 */
function enterEditMode(id) {
  state.editingTaskId = id;
  render();
}

/**
 * Cancel inline edit mode
 */
function cancelEditMode() {
  state.editingTaskId = null;
  render();
}

/**
 * Save inline edit changes
 */
function saveTaskEdit(id, newTitle, newPriority, newDueDate) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  const trimmed = newTitle.trim();
  if (!trimmed) {
    showToast('Task title cannot be empty');
    return;
  }

  task.title = trimmed;
  task.priority = newPriority;
  task.dueDate = newDueDate;

  state.editingTaskId = null;
  StorageService.saveTasks(state.tasks);
  render();
  showToast('Task updated');
}

/**
 * Reset tasks to sample demonstration set
 */
function resetDemoTasks() {
  state.tasks = [...SAMPLE_TASKS];
  state.editingTaskId = null;
  state.searchQuery = '';
  elements.searchInput.value = '';
  StorageService.saveTasks(state.tasks);
  render();
  showToast('Reset to sample tasks');
}

// ==========================================================================
// Filtering & Sorting
// ==========================================================================

function getProcessedTasks() {
  let list = [...state.tasks];

  // 1. Filter by Status Tab
  if (state.currentFilter === 'active') {
    list = list.filter(t => !t.completed);
  } else if (state.currentFilter === 'completed') {
    list = list.filter(t => t.completed);
  }

  // 2. Search query filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(t => t.title.toLowerCase().includes(q));
  }

  // 3. Sorting
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  switch (state.sortBy) {
    case 'date-asc':
      list.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'priority-desc':
      list.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
      break;
    case 'duedate-asc':
      list.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
      break;
    case 'date-desc':
    default:
      list.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return list;
}

// ==========================================================================
// DOM Rendering
// ==========================================================================

function render() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const active = total - completed;

  // Update Header Progress
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  elements.progressBar.style.width = `${percent}%`;
  elements.progressPercent.textContent = `${percent}%`;
  elements.progressCounts.textContent = `${completed} of ${total} completed`;

  // Update Tab Badges
  elements.countAll.textContent = total;
  elements.countActive.textContent = active;
  elements.countCompleted.textContent = completed;

  // Update Footer Counts & Clear button
  elements.itemsLeft.textContent = `${active} active item${active === 1 ? '' : 's'} left`;
  elements.clearCompletedBtn.disabled = completed === 0;

  // Process and Render Task List
  const tasksToDisplay = getProcessedTasks();
  elements.taskList.innerHTML = '';

  if (tasksToDisplay.length === 0) {
    elements.emptyState.classList.remove('hidden');
    if (state.searchQuery) {
      elements.emptyTitle.textContent = 'No matching tasks';
      elements.emptySubtitle.textContent = `No tasks matched "${state.searchQuery}"`;
    } else if (state.currentFilter === 'active') {
      elements.emptyTitle.textContent = 'All caught up!';
      elements.emptySubtitle.textContent = 'You have no active tasks left.';
    } else if (state.currentFilter === 'completed') {
      elements.emptyTitle.textContent = 'No completed tasks yet';
      elements.emptySubtitle.textContent = 'Complete tasks to see them tracked here.';
    } else {
      elements.emptyTitle.textContent = 'No tasks found';
      elements.emptySubtitle.textContent = 'Add your first task above to get started!';
    }
  } else {
    elements.emptyState.classList.add('hidden');

    tasksToDisplay.forEach(task => {
      const isEditing = state.editingTaskId === task.id;
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      if (isEditing) {
        // Render Inline Edit Mode
        li.innerHTML = `
          <form class="edit-task-form" onsubmit="return false;">
            <input 
              type="text" 
              class="edit-task-input" 
              value="${escapeHtml(task.title)}" 
              maxlength="150" 
              aria-label="Edit task title"
              required
            >
            <select class="edit-task-priority" aria-label="Edit priority">
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
              <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
            </select>
            <input 
              type="date" 
              class="edit-task-date" 
              value="${task.dueDate || ''}" 
              aria-label="Edit due date"
            >
            <button type="button" class="btn-inline-save" title="Save (Enter)">✓</button>
            <button type="button" class="btn-inline-cancel" title="Cancel (Esc)">✕</button>
          </form>
        `;

        // Focus the edit input
        setTimeout(() => {
          const editInput = li.querySelector('.edit-task-input');
          if (editInput) {
            editInput.focus();
            editInput.select();
          }
        }, 10);
      } else {
        // Render Standard Task Card
        const overdue = !task.completed && isOverdue(task.dueDate);
        const formattedDate = formatDisplayDate(task.dueDate);

        li.innerHTML = `
          <div class="task-checkbox-container" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
            <input 
              type="checkbox" 
              class="task-checkbox" 
              ${task.completed ? 'checked' : ''} 
              aria-label="Toggle task completion"
            >
          </div>

          <div class="task-content-area" title="Click or edit to modify">
            <span class="task-text">${escapeHtml(task.title)}</span>
            <div class="task-metadata">
              <span class="priority-badge priority-${task.priority}">
                ${task.priority}
              </span>
              ${task.dueDate ? `
                <span class="duedate-badge ${overdue ? 'overdue' : ''}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  ${formattedDate} ${overdue ? '(Overdue)' : ''}
                </span>
              ` : ''}
            </div>
          </div>

          <div class="task-actions">
            <button class="action-btn btn-edit" title="Edit task" aria-label="Edit task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn btn-delete" title="Delete task" aria-label="Delete task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        `;
      }

      elements.taskList.appendChild(li);
    });
  }
}

// ==========================================================================
// Event Listeners & Event Delegation
// ==========================================================================

function setupEventListeners() {
  // Add task form submission
  elements.taskForm.addEventListener('submit', handleAddTask);

  // Search input with instant filtering
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    render();
  });

  // Filter tabs
  elements.filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentFilter = tab.dataset.filter;
      render();
    });
  });

  // Sort dropdown
  elements.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    render();
  });

  // Clear completed button
  elements.clearCompletedBtn.addEventListener('click', clearCompletedTasks);

  // Reset sample button
  elements.resetSampleBtn.addEventListener('click', resetDemoTasks);

  // Event delegation on task list
  elements.taskList.addEventListener('click', (e) => {
    const li = e.target.closest('.task-item');
    if (!li) return;
    const taskId = li.dataset.id;

    // 1. Toggle completion via checkbox
    if (e.target.closest('.task-checkbox')) {
      toggleTaskCompletion(taskId);
      return;
    }

    // 2. Delete button clicked
    if (e.target.closest('.btn-delete')) {
      deleteTask(taskId);
      return;
    }

    // 3. Edit button clicked
    if (e.target.closest('.btn-edit')) {
      enterEditMode(taskId);
      return;
    }

    // 4. Save inline edit clicked
    if (e.target.closest('.btn-inline-save')) {
      const editInput = li.querySelector('.edit-task-input');
      const editPriority = li.querySelector('.edit-task-priority');
      const editDate = li.querySelector('.edit-task-date');
      if (editInput) {
        saveTaskEdit(taskId, editInput.value, editPriority.value, editDate.value);
      }
      return;
    }

    // 5. Cancel inline edit clicked
    if (e.target.closest('.btn-inline-cancel')) {
      cancelEditMode();
      return;
    }
  });

  // Double-click task title to trigger inline editing
  elements.taskList.addEventListener('dblclick', (e) => {
    const taskContent = e.target.closest('.task-content-area');
    if (taskContent) {
      const li = taskContent.closest('.task-item');
      if (li && li.dataset.id) {
        enterEditMode(li.dataset.id);
      }
    }
  });

  // Keyboard navigation for inline edit (Enter to save, Esc to cancel)
  elements.taskList.addEventListener('keydown', (e) => {
    if (state.editingTaskId) {
      const li = e.target.closest('.task-item');
      if (!li) return;
      const taskId = li.dataset.id;

      if (e.key === 'Enter') {
        e.preventDefault();
        const editInput = li.querySelector('.edit-task-input');
        const editPriority = li.querySelector('.edit-task-priority');
        const editDate = li.querySelector('.edit-task-date');
        if (editInput) {
          saveTaskEdit(taskId, editInput.value, editPriority.value, editDate.value);
        }
      } else if (e.key === 'Escape') {
        cancelEditMode();
      }
    }
  });
}

// ==========================================================================
// Initialization
// ==========================================================================

function init() {
  // Set today's date badge in header
  if (elements.currentDate) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    elements.currentDate.textContent = new Date().toLocaleDateString(undefined, options);
  }

  initTheme();
  state.tasks = StorageService.getTasks();
  setupEventListeners();
  render();
}

// Start app once DOM is ready
document.addEventListener('DOMContentLoaded', init);
