// Dashboard JavaScript

// ==================== Checklist ====================
let taskIdCounter = 4;

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
    localStorage.setItem('tasks', JSON.stringify(tasks));
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
            dayElement.textContent = day;
            
            // Highlight today
            if (day === today.getDate() && 
                this.currentMonth === today.getMonth() && 
                this.currentYear === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            calendarDays.appendChild(dayElement);
        }
    }
}

// Initialize calendar
new Calendar();

// Load tasks on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        // Only restore if checklist is empty initially
        if (checklist.children.length === 3) { // Default 3 tasks
            // Keep existing implementation for now
        }
    }
});