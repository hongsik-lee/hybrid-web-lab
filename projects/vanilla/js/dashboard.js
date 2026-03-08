// Dashboard JavaScript

// ==================== Checklist ====================
let taskIdCounter = 4;
const TASKS_STORAGE_KEY = 'tasks';
const CALENDAR_STORAGE_KEY = 'calendarSchedules';

const addTaskBtn = document.getElementById('addTaskBtn');
const addTaskForm = document.querySelector('.add-task-form');
const newTaskInput = document.getElementById('newTaskInput');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');
const checklist = document.querySelector('.checklist');

// Show add task form
addTaskBtn.addEventListener('click', () => {
    addTaskForm.style.display = 'block';
    newTaskInput.focus();
});

// Cancel add task
cancelTaskBtn.addEventListener('click', () => {
    addTaskForm.style.display = 'none';
    newTaskInput.value = '';
});

// Save new task
saveTaskBtn.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    if (taskText) {
        addTask(taskText);
        newTaskInput.value = '';
        addTaskForm.style.display = 'none';
    }
});

// Add task on Enter key
newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveTaskBtn.click();
    }
});

// Add task function
function addTask(text) {
    const taskId = `task${taskIdCounter++}`;
    const taskItem = document.createElement('div');
    taskItem.className = 'checklist-item';
    taskItem.dataset.id = taskIdCounter - 1;
    
    taskItem.innerHTML = `
        <input type="checkbox" id="${taskId}">
        <label for="${taskId}">${text}</label>
        <button class="btn-delete">×</button>
    `;
    
    checklist.appendChild(taskItem);
    
    // Add event listeners
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    const deleteBtn = taskItem.querySelector('.btn-delete');
    
    checkbox.addEventListener('change', handleCheckboxChange);
    deleteBtn.addEventListener('click', () => deleteTask(taskItem));
}

// Handle checkbox change
function handleCheckboxChange(e) {
    const label = e.target.nextElementSibling;
    if (e.target.checked) {
        label.style.textDecoration = 'line-through';
        label.style.opacity = '0.5';
    } else {
        label.style.textDecoration = 'none';
        label.style.opacity = '1';
    }
    saveTasks();
}

// Delete task
function deleteTask(taskItem) {
    taskItem.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
        taskItem.remove();
        saveTasks();
    }, 300);
}

// Add event listeners to existing checkboxes and delete buttons
document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
});

document.querySelectorAll('.checklist-item .btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.checklist-item');
        deleteTask(taskItem);
    });
});

// Save tasks to localStorage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.checklist-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const label = item.querySelector('label');
        tasks.push({
            id: checkbox.id,
            text: label.textContent,
            checked: checkbox.checked
        });
    });
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'checklist-item';
    taskItem.dataset.id = Number(task.id.replace('task', '')) || taskIdCounter;

    taskItem.innerHTML = `
        <input type="checkbox" id="${task.id}" ${task.checked ? 'checked' : ''}>
        <label for="${task.id}">${task.text}</label>
        <button class="btn-delete">×</button>
    `;

    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    const deleteBtn = taskItem.querySelector('.btn-delete');

    checkbox.addEventListener('change', handleCheckboxChange);
    deleteBtn.addEventListener('click', () => deleteTask(taskItem));

    if (task.checked) {
        const label = taskItem.querySelector('label');
        label.style.textDecoration = 'line-through';
        label.style.opacity = '0.5';
    }

    return taskItem;
}

function restoreTasks() {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!savedTasks) {
        return;
    }

    const tasks = JSON.parse(savedTasks);
    checklist.innerHTML = '';

    let maxId = 0;
    tasks.forEach((task) => {
        checklist.appendChild(createTaskElement(task));
        const numericId = Number(task.id.replace('task', ''));
        if (numericId > maxId) {
            maxId = numericId;
        }
    });

    taskIdCounter = maxId + 1;
}

// ==================== Recent Posts ====================
const postsContainer = document.querySelector('.posts-list');

// Navigate to board view
postsContainer.addEventListener('click', (e) => {
    const postItem = e.target.closest('.post-item');
    if (postItem) {
        const postId = postItem.dataset.id;
        window.location.href = `board-view.html?id=${postId}`;
    }
});

// ==================== Calendar ====================
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.selectedDateKey = null;
        this.schedules = JSON.parse(localStorage.getItem(CALENDAR_STORAGE_KEY)) || {};
        this.scheduleDateTitle = document.getElementById('scheduleDateTitle');
        this.scheduleInput = document.getElementById('scheduleInput');
        this.addScheduleBtn = document.getElementById('addScheduleBtn');
        this.scheduleList = document.getElementById('scheduleList');
        this.monthScheduleList = document.getElementById('monthScheduleList');
        
        this.init();
    }
    
    init() {
        this.renderCalendar();
        this.attachEvents();
    }
    
    attachEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
        });

        this.addScheduleBtn.addEventListener('click', () => this.addSchedule());
        this.scheduleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addSchedule();
            }
        });

        this.scheduleList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-schedule-btn');
            if (!deleteBtn || !this.selectedDateKey) {
                return;
            }

            const index = Number(deleteBtn.dataset.index);
            const items = this.schedules[this.selectedDateKey] || [];
            items.splice(index, 1);

            if (items.length === 0) {
                delete this.schedules[this.selectedDateKey];
            } else {
                this.schedules[this.selectedDateKey] = items;
            }

            this.saveSchedules();
            this.renderScheduleList();
            this.renderCalendar();
        });
    }

    getDateKey(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    saveSchedules() {
        localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(this.schedules));
    }

    selectDate(dateKey, day) {
        this.selectedDateKey = dateKey;
        this.scheduleDateTitle.textContent = `${this.currentYear}년 ${this.currentMonth + 1}월 ${day}일 일정`;
        this.addScheduleBtn.disabled = false;
        this.scheduleInput.focus();
        this.renderScheduleList();
    }

    renderScheduleList() {
        if (!this.selectedDateKey) {
            this.scheduleList.innerHTML = '';
            return;
        }

        const items = this.schedules[this.selectedDateKey] || [];
        this.scheduleList.innerHTML = '';

        if (items.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'calendar-schedule-empty';
            empty.textContent = '등록된 일정이 없습니다.';
            this.scheduleList.appendChild(empty);
            return;
        }

        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'calendar-schedule-item';
            li.innerHTML = `
                <span>${item}</span>
                <button class="delete-schedule-btn" data-index="${index}" type="button">삭제</button>
            `;
            this.scheduleList.appendChild(li);
        });
    }

    renderMonthScheduleList() {
        this.monthScheduleList.innerHTML = '';

        const monthPrefix = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-`;
        const monthEntries = Object.entries(this.schedules)
            .filter(([dateKey, items]) => dateKey.startsWith(monthPrefix) && items.length)
            .sort(([a], [b]) => a.localeCompare(b));

        if (monthEntries.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'month-schedule-empty';
            empty.textContent = '이번 달에 등록된 일정이 없습니다.';
            this.monthScheduleList.appendChild(empty);
            return;
        }

        monthEntries.forEach(([dateKey, items]) => {
            const day = Number(dateKey.split('-')[2]);
            const li = document.createElement('li');
            li.className = 'month-schedule-item';

            const summaries = items.slice(0, 2).map((item) => `• ${item}`).join(' ');
            const remainCount = items.length - 2;

            li.innerHTML = `
                <strong>${day}일</strong>
                <span>${summaries}${remainCount > 0 ? ` 외 ${remainCount}건` : ''}</span>
            `;

            this.monthScheduleList.appendChild(li);
        });
    }

    addSchedule() {
        if (!this.selectedDateKey) {
            return;
        }

        const text = this.scheduleInput.value.trim();
        if (!text) {
            return;
        }

        const items = this.schedules[this.selectedDateKey] || [];
        items.push(text);
        this.schedules[this.selectedDateKey] = items;
        this.saveSchedules();

        this.scheduleInput.value = '';
        this.renderScheduleList();
        this.renderCalendar();
    }
    
    renderCalendar() {
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월',
                          '7월', '8월', '9월', '10월', '11월', '12월'];
        
        document.getElementById('currentMonth').textContent = 
            `${this.currentYear}년 ${monthNames[this.currentMonth]}`;
        
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // Add days of month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            const dateKey = this.getDateKey(this.currentYear, this.currentMonth, day);
            const schedulesForDay = this.schedules[dateKey] || [];
            const previewText = schedulesForDay.length ? schedulesForDay[0] : '';
            dayElement.innerHTML = `
                <span class="day-number">${day}</span>
                <span class="day-preview">${previewText}</span>
            `;
            
            // Highlight today
            if (day === today.getDate() && 
                this.currentMonth === today.getMonth() && 
                this.currentYear === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            if (this.schedules[dateKey]?.length) {
                dayElement.classList.add('has-schedule');
            }

            if (this.selectedDateKey === dateKey) {
                dayElement.classList.add('selected');
            }

            dayElement.addEventListener('click', () => {
                this.selectDate(dateKey, day);
                this.renderCalendar();
            });
            
            calendarDays.appendChild(dayElement);
        }

        this.renderMonthScheduleList();
    }
}

// Initialize calendar
new Calendar();

// Load tasks on page load
window.addEventListener('DOMContentLoaded', () => {
    restoreTasks();
});