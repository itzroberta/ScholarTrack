function registrarProgressoDiario() {
    const hoje = dayjs();
    const chave = `${hoje.year()}-${hoje.month() + 1}-${hoje.date()}`;
    localStorage.setItem(chave, "true");
}

const addTaskBtn = document.getElementById('add-task-btn');
const newTaskForm = document.getElementById('new-task-form');
const saveTaskBtn = document.getElementById('save-task-btn');

addTaskBtn.addEventListener('click', () => {
    if (newTaskForm.classList.contains('show')) {
        newTaskForm.classList.remove('show');
        setTimeout(() => newTaskForm.style.display = 'none', 300);
    } else {
        newTaskForm.style.display = 'flex';
        setTimeout(() => newTaskForm.classList.add('show'), 10);
    }
});

saveTaskBtn.addEventListener('click', () => {
    const taskNameInput = document.getElementById('task-name-input');
    const taskDeadlineInput = document.getElementById('task-deadline-input');
    const taskNoteInput = document.getElementById('edit-task-note');
    const taskPriorityInput = document.getElementById('task-priority-input');

    const taskName = taskNameInput.value.trim();
    const taskDeadline = taskDeadlineInput.value;
    const taskNote = taskNoteInput.value.trim();
    const taskPriority = taskPriorityInput.value;

    if (taskName === '' || taskDeadline === '') {
        alert('Fill in the name of the task and deadline!');
        return;
    }

    createTask(taskName, taskDeadline, 0, taskNote, taskPriority);
    registrarProgressoDiario();
    saveTasks();

    taskNameInput.value = '';
    taskDeadlineInput.value = '';
    taskNoteInput.value = '';
    taskPriorityInput.value = 'medium';
    newTaskForm.style.display = 'none';
});

function createTask(taskName, taskDeadline, progress, note = '', priority = 'medium') {
    const taskList = document.querySelector('.task-list');

    const newTaskItem = document.createElement('div');
    newTaskItem.className = 'task-item';
    newTaskItem.dataset.priority = priority;
    newTaskItem.innerHTML = `
        <div class="task-info">
            <span class="task-name">${taskName}</span>
            <span class="task-deadline">${taskDeadline}</span>
            <span class="task-priority">Priority: ${priority}</span>
        </div>
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-buttons">
                <button class="decrease-progress">-</button>
                <button class="increase-progress">+</button>
            </div>
        </div>
        <div class="task-actions">
            <button class="note-btn">📝 See Notes</button>
            <button class="edit-btn">✏️ Edit</button>
            <button class="delete-btn">🗑️ Delete</button>
        </div>
    `;

    newTaskItem.dataset.note = note;
    taskList.appendChild(newTaskItem);

    activateProgressButtons(newTaskItem);
    activateActions(newTaskItem);
    updateSummary();
    reorderTasks();
}

function activateProgressButtons(taskItem) {
    const decreaseBtn = taskItem.querySelector('.decrease-progress');
    const increaseBtn = taskItem.querySelector('.increase-progress');
    const fillDiv = taskItem.querySelector('.progress-fill');

    let current = parseInt(fillDiv.style.width) || 0;

    decreaseBtn.addEventListener('click', () => {
        current = Math.max(0, current - 5);
        fillDiv.style.width = `${current}%`;
        saveTasks();
        updateSummary();
        reorderTasks();
        registrarProgressoDiario();
    });

    increaseBtn.addEventListener('click', () => {
        const wasNotComplete = current < 100;
        current = Math.min(100, current + 5);
        fillDiv.style.width = `${current}%`;
        saveTasks();
        updateSummary();
        reorderTasks();
        registrarProgressoDiario();

        if (current === 100 && wasNotComplete) {
            dispararConfetes();
        }
    });
}

function activateActions(taskItem) {
    const editBtn = taskItem.querySelector('.edit-btn');
    const deleteBtn = taskItem.querySelector('.delete-btn');
    const noteBtn = taskItem.querySelector('.note-btn');

    editBtn.addEventListener('click', () => {
        const taskNameSpan = taskItem.querySelector('.task-name');
        const taskDeadlineSpan = taskItem.querySelector('.task-deadline');
        const taskPrioritySpan = taskItem.querySelector('.task-priority');

        const taskNameInput = document.createElement('input');
        taskNameInput.type = 'text';
        taskNameInput.value = taskNameSpan.innerText;
        taskNameInput.className = 'edit-input';

        const taskDeadlineInput = document.createElement('input');
        taskDeadlineInput.type = 'date';
        taskDeadlineInput.value = taskDeadlineSpan.innerText;
        taskDeadlineInput.className = 'edit-input';

        const prioritySelect = document.createElement('select');
        prioritySelect.innerHTML = `
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
        `;
        prioritySelect.value = taskItem.dataset.priority || 'medium';

        const noteButton = document.createElement('button');
        noteButton.textContent = '📝 Edit Notes';
        noteButton.className = 'edit-note-btn';

        const taskInfo = taskItem.querySelector('.task-info');
        taskInfo.innerHTML = '';
        taskInfo.appendChild(taskNameInput);
        taskInfo.appendChild(taskDeadlineInput);
        taskInfo.appendChild(prioritySelect);
        taskInfo.appendChild(noteButton);

        let temporaryNote = taskItem.dataset.note || '';

        noteButton.addEventListener('click', () => {
            document.getElementById('edit-note-textarea').value = temporaryNote;
            document.getElementById('edit-note-modal').style.display = 'flex';

            document.getElementById('save-note-edit').onclick = () => {
                temporaryNote = document.getElementById('edit-note-textarea').value;
                document.getElementById('edit-note-modal').style.display = 'none';
            };
        });

        const actionsContainer = taskItem.querySelector('.task-actions');
        actionsContainer.innerHTML = '';

        const saveEditBtn = document.createElement('button');
        saveEditBtn.innerText = 'Save';
        saveEditBtn.className = 'save-btn';
        actionsContainer.appendChild(saveEditBtn);

        saveEditBtn.addEventListener('click', () => {
            const updatedName = taskNameInput.value.trim();
            const updatedDeadline = taskDeadlineInput.value;
            const updatedPriority = prioritySelect.value;
            const updatedNote = temporaryNote.trim();

            if (updatedName === '' || updatedDeadline === '') {
                alert('Fill in the name and deadline!');
                return;
            }

            taskItem.dataset.priority = updatedPriority;
            taskItem.dataset.note = updatedNote;

            taskInfo.innerHTML = `
                <span class="task-name">${updatedName}</span>
                <span class="task-deadline">${updatedDeadline}</span>
                <span class="task-priority">Priority: ${updatedPriority}</span>
            `;

            actionsContainer.innerHTML = `
                <button class="note-btn">📝 See notes</button>
                <button class="edit-btn">✏️ Edit</button>
                <button class="delete-btn">🗑️ Delete</button>
            `;
            activateActions(taskItem);
            saveTasks();
            reorderTasks();
            registrarProgressoDiario();
        });
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            taskItem.remove();
            saveTasks();
            updateSummary();
        }
    });

    noteBtn?.addEventListener('click', () => {
        const noteText = taskItem.dataset.note || '';
        showNoteModal(noteText);
    });
}

function showNoteModal(noteText) {
    const modal = document.getElementById('note-modal');
    const content = document.getElementById('modal-note-content');
    content.textContent = noteText || 'Sem anotações.';
    modal.style.display = 'block';

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('note-modal').style.display = 'none';
});

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(task => {
        const name = task.querySelector('.task-name')?.textContent || '';
        const deadline = task.querySelector('.task-deadline')?.textContent || '';
        const note = task.dataset.note || '';
        const priority = task.dataset.priority || 'medium';
        const progress = parseInt(task.querySelector('.progress-fill').style.width) || 0;
        tasks.push({ name, deadline, progress, note, priority });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const onlyCompleted = window.location.pathname.includes('concluidos');

    tasks.forEach(task => {
        if (!onlyCompleted || task.progress === 100) {
            createTask(task.name, task.deadline, task.progress, task.note || '', task.priority);
        }
    });
}

function updateSummary() {
    const tasks = document.querySelectorAll('.task-item');
    const total = tasks.length;
    let completed = 0;
    let sumProgress = 0;

    tasks.forEach(task => {
        const progress = parseInt(task.querySelector('.progress-fill').style.width) || 0;
        if (progress === 100) completed++;
        sumProgress += progress;
    });

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('average-progress').textContent = total ? `${Math.round(sumProgress / total)}%` : '0%';
}

function reorderTasks() {
    const taskList = document.querySelector('.task-list');
    const tasks = Array.from(taskList.children);

    const incomplete = tasks.filter(task => (parseInt(task.querySelector('.progress-fill').style.width) || 0) < 100);
    const complete = tasks.filter(task => (parseInt(task.querySelector('.progress-fill').style.width) || 0) === 100);

    taskList.innerHTML = '';
    [...incomplete, ...complete].forEach(task => {
        const progress = parseInt(task.querySelector('.progress-fill').style.width) || 0;
        task.classList.toggle('completed-task', progress === 100);
        taskList.appendChild(task);
    });
}

document.getElementById('open-edit-note-modal').addEventListener('click', () => {
    const note = document.getElementById('edit-task-note').value;
    document.getElementById('edit-note-textarea').value = note;
    document.getElementById('edit-note-modal').style.display = 'flex';
});

document.getElementById('close-edit-modal').addEventListener('click', () => {
    document.getElementById('edit-note-modal').style.display = 'none';
});

document.getElementById('save-note-edit').addEventListener('click', () => {
    const newNote = document.getElementById('edit-note-textarea').value;
    document.getElementById('edit-task-note').value = newNote;
    document.getElementById('edit-note-modal').style.display = 'none';
});

window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateSummary();
    registrarProgressoDiario();
});

function dispararConfetes() {
    const duration = 1 * 1000;
    const end = Date.now() + duration;

    const confettiInterval = setInterval(function () {
        if (Date.now() > end) {
            return clearInterval(confettiInterval);
        }

        confetti({
            particleCount: 30,
            origin: { x: 0, y: 1 },
            angle: 60,
            spread: 55
        });

        confetti({
            particleCount: 30,
            origin: { x: 1, y: 1 },
            angle: 120,
            spread: 55
        });
    }, 200);
}

document.getElementById('filter-tasks').addEventListener('change', () => {
    const filtro = document.getElementById('filter-tasks').value;
    const taskList = document.querySelector('.task-list');
    const tasks = Array.from(taskList.children);

    let sortedTasks;

    if (filtro === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        sortedTasks = tasks.sort((a, b) => {
            const aPriority = priorityOrder[a.dataset.priority] || 99;
            const bPriority = priorityOrder[b.dataset.priority] || 99;
            return aPriority - bPriority;
        });
    } else if (filtro === 'deadline') {
        sortedTasks = tasks.sort((a, b) => {
            const deadlineA = new Date(a.querySelector('.task-deadline').textContent);
            const deadlineB = new Date(b.querySelector('.task-deadline').textContent);
            return deadlineA - deadlineB;
        });
    } else {
        reorderTasks();
        return;
    }

    taskList.innerHTML = '';
    sortedTasks.forEach(task => {
        const progress = parseInt(task.querySelector('.progress-fill').style.width) || 0;
        task.classList.toggle('completed-task', progress === 100);
        taskList.appendChild(task);
    });
});