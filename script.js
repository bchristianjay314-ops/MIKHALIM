// Task Management App
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    renderTasks();
    renderDashboard();
    renderCalendar();
    renderProgress();
    updateSubjectFilter();
}

// Event Listeners
function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // Add Task Button
    document.getElementById('add-task-btn').addEventListener('click', () => {
        document.getElementById('task-form').classList.remove('hidden');
    });

    // Cancel Task Form
    document.getElementById('cancel-task-btn').addEventListener('click', () => {
        document.getElementById('task-form').classList.add('hidden');
        document.getElementById('new-task-form').reset();
    });

    // Submit Task Form
    document.getElementById('new-task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addTask();
    });

    // Calendar Navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Filters
    document.getElementById('filter-subject').addEventListener('change', renderTasks);
    document.getElementById('filter-priority').addEventListener('change', renderTasks);
    document.getElementById('filter-status').addEventListener('change', renderTasks);
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Refresh content when switching tabs
    if (tabName === 'dashboard') {
        renderDashboard();
    } else if (tabName === 'calendar') {
        renderCalendar();
    } else if (tabName === 'progress') {
        renderProgress();
    }
}

// Add Task
function addTask() {
    const task = {
        id: Date.now(),
        title: document.getElementById('task-title').value,
        subject: document.getElementById('task-subject').value,
        priority: document.getElementById('task-priority').value,
        deadline: document.getElementById('task-deadline').value,
        difficulty: document.getElementById('task-difficulty').value,
        estimatedTime: document.getElementById('task-time').value || null,
        notes: document.getElementById('task-notes').value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    document.getElementById('new-task-form').reset();
    document.getElementById('task-form').classList.add('hidden');
    renderTasks();
    renderDashboard();
    renderCalendar();
    renderProgress();
    updateSubjectFilter();
}

// Save Tasks to LocalStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render Tasks
function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    const filterSubject = document.getElementById('filter-subject').value;
    const filterPriority = document.getElementById('filter-priority').value;
    const filterStatus = document.getElementById('filter-status').value;

    let filteredTasks = tasks.filter(task => {
        if (filterSubject && task.subject !== filterSubject) return false;
        if (filterPriority && task.priority !== filterPriority) return false;
        if (filterStatus === 'pending' && task.completed) return false;
        if (filterStatus === 'completed' && !task.completed) return false;
        return true;
    });

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<p class="empty-state">No tasks found matching your filters.</p>';
        return;
    }

    // Sort by deadline
    filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    tasksList.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
    
    // Add event listeners to task buttons
    filteredTasks.forEach(task => {
        document.getElementById(`complete-${task.id}`)?.addEventListener('click', () => toggleTaskComplete(task.id));
        document.getElementById(`delete-${task.id}`)?.addEventListener('click', () => deleteTask(task.id));
    });
}

// Create Task HTML
function createTaskHTML(task) {
    const deadline = new Date(task.deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    let deadlineText = '';
    if (daysUntil < 0) {
        deadlineText = `Overdue by ${Math.abs(daysUntil)} day(s)`;
    } else if (daysUntil === 0) {
        deadlineText = 'Due today';
    } else if (daysUntil === 1) {
        deadlineText = 'Due tomorrow';
    } else {
        deadlineText = `Due in ${daysUntil} days`;
    }

    return `
        <div class="task-item ${task.priority} ${task.completed ? 'completed' : ''}">
            <div class="task-header">
                <div>
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span>📚 ${task.subject}</span>
                        <span>📅 ${deadlineText}</span>
                        <span>⏱️ ${task.estimatedTime ? task.estimatedTime + 'h' : 'N/A'}</span>
                        <span>📊 ${task.difficulty}</span>
                    </div>
                </div>
                <span class="priority-badge ${task.priority}">${task.priority}</span>
            </div>
            ${task.notes ? `<p style="margin-top: 10px; color: var(--text-secondary);">${task.notes}</p>` : ''}
            <div class="task-actions">
                ${!task.completed ? `<button class="btn-small btn-complete" id="complete-${task.id}">✓ Complete</button>` : ''}
                <button class="btn-small btn-delete" id="delete-${task.id}">🗑️ Delete</button>
            </div>
        </div>
    `;
}

// Toggle Task Complete
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        renderDashboard();
        renderCalendar();
        renderProgress();
    }
}

// Delete Task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        renderDashboard();
        renderCalendar();
        renderProgress();
        updateSubjectFilter();
    }
}

// Render Dashboard
function renderDashboard() {
    const urgentTasks = tasks.filter(t => !t.completed && isUrgent(t.deadline));
    const upcomingTasks = tasks.filter(t => !t.completed && !isUrgent(t.deadline));
    const completedTasks = tasks.filter(t => t.completed);
    
    document.getElementById('urgent-count').textContent = urgentTasks.length;
    document.getElementById('upcoming-count').textContent = upcomingTasks.length;
    document.getElementById('completed-count').textContent = completedTasks.length;
    document.getElementById('total-count').textContent = tasks.length;

    // Recent Tasks (upcoming 5)
    const recentTasksList = document.getElementById('recent-tasks-list');
    const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);
    
    if (pendingTasks.length === 0) {
        recentTasksList.innerHTML = '<p class="empty-state">No pending tasks. Great job!</p>';
    } else {
        recentTasksList.innerHTML = pendingTasks.map(task => createTaskHTML(task)).join('');
        pendingTasks.forEach(task => {
            document.getElementById(`complete-${task.id}`)?.addEventListener('click', () => toggleTaskComplete(task.id));
            document.getElementById(`delete-${task.id}`)?.addEventListener('click', () => deleteTask(task.id));
        });
    }
}

// Check if task is urgent (due within 3 days)
function isUrgent(deadline) {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    return daysUntil <= 3 && daysUntil >= 0;
}

// Render Calendar
function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('current-month-year').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const calendarGrid = document.getElementById('calendar-grid');
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = dayHeaders.map(day => `<div class="calendar-day-header">${day}</div>`).join('');
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday = date.toDateString() === today.toDateString();
        const dayTasks = getTasksForDate(date);
        
        html += `<div class="calendar-day ${isToday ? 'today' : ''}">
            <div class="calendar-day-number">${day}</div>
            <div class="calendar-tasks">
                ${dayTasks.map(task => `<div class="calendar-task-dot ${task.priority}" title="${task.title}"></div>`).join('')}
            </div>
        </div>`;
    }
    
    // Next month days to fill the grid
    const totalCells = calendarGrid.children.length || 42;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells && day <= 14; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    calendarGrid.innerHTML = html;
}

// Get tasks for a specific date
function getTasksForDate(date) {
    return tasks.filter(task => {
        if (task.completed) return false;
        const taskDate = new Date(task.deadline);
        return taskDate.toDateString() === date.toDateString();
    });
}

// Render Progress
function renderProgress() {
    // Completion Rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    document.getElementById('completion-percentage').textContent = `${completionRate}%`;
    
    const progressRing = document.querySelector('.progress-ring-progress');
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (completionRate / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
    
    // Tasks by Subject
    const subjectChart = document.getElementById('subject-chart');
    const subjectCounts = {};
    
    tasks.forEach(task => {
        if (!task.completed) {
            subjectCounts[task.subject] = (subjectCounts[task.subject] || 0) + 1;
        }
    });
    
    const totalPending = Object.values(subjectCounts).reduce((a, b) => a + b, 0);
    
    if (totalPending === 0) {
        subjectChart.innerHTML = '<p class="empty-state">No pending tasks</p>';
    } else {
        subjectChart.innerHTML = Object.entries(subjectCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([subject, count]) => {
                const percentage = Math.round((count / totalPending) * 100);
                return `
                    <div class="subject-item">
                        <div class="subject-label">${subject}</div>
                        <div class="subject-bar">
                            <div class="subject-bar-fill" style="width: ${percentage}%">${count}</div>
                        </div>
                    </div>
                `;
            }).join('');
    }
    
    // Activity Timeline
    const timeline = document.getElementById('activity-timeline');
    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentTasks.length === 0) {
        timeline.innerHTML = '<p class="empty-state">No activity yet</p>';
    } else {
        timeline.innerHTML = recentTasks.map(task => {
            const date = new Date(task.createdAt);
            return `
                <div class="timeline-item">
                    <div class="timeline-icon">${task.completed ? '✅' : '📝'}</div>
                    <div class="timeline-content">
                        <div class="timeline-title">${task.completed ? 'Completed' : 'Created'}: ${task.title}</div>
                        <div class="timeline-time">${date.toLocaleString()}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Update Subject Filter
function updateSubjectFilter() {
    const filterSelect = document.getElementById('filter-subject');
    const subjects = [...new Set(tasks.map(t => t.subject))].sort();
    
    filterSelect.innerHTML = '<option value="">All Subjects</option>' + 
        subjects.map(subject => `<option value="${subject}">${subject}</option>`).join('');
}

