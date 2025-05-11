function registrarProgressoDiario() {
    const hoje = `${dayjs().year()}-${dayjs().month() + 1}-${dayjs().date()}`;
    const chave = `${hoje.year()}-${hoje.month() + 1}-${hoje.date()}`;
    localStorage.setItem(chave, "true");
}

// Botão "+ Nova Tarefa"
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskForm = document.getElementById('new-task-form');
const saveTaskBtn = document.getElementById('save-task-btn');

// Mostrar e esconder o formulário
addTaskBtn.addEventListener('click', () => {
    if (newTaskForm.classList.contains('show')) {
        newTaskForm.classList.remove('show');
        setTimeout(() => newTaskForm.style.display = 'none', 300);
    } else {
        newTaskForm.style.display = 'flex';
        setTimeout(() => newTaskForm.classList.add('show'), 10);
    }
});

// Quando clicar em "Adicionar" nova tarefa
saveTaskBtn.addEventListener('click', () => {
    console.log("Botão 'Adicionar' clicado"); // debug

    const taskNameInput = document.getElementById('task-name-input');
    const taskDeadlineInput = document.getElementById('task-deadline-input');

    const taskName = taskNameInput.value.trim();
    const taskDeadline = taskDeadlineInput.value;

    if (taskName === '' || taskDeadline === '') {
        alert('Preencha o nome da tarefa e o prazo!');
        return;
    }

    createTask(taskName, taskDeadline, 0); // Começa com 0% de progresso
    registrarProgressoDiario();

    taskNameInput.value = '';
    taskDeadlineInput.value = '';
    newTaskForm.style.display = 'none';
});

// Função principal para criar uma tarefa
function createTask(taskName, taskDeadline, progress) {
    const taskList = document.querySelector('.task-list');

    const newTaskItem = document.createElement('div');
    newTaskItem.className = 'task-item';
    newTaskItem.innerHTML = `
        <div class="task-info">
            <span class="task-name">${taskName}</span>
            <span class="task-deadline">${taskDeadline}</span>
        </div>
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-buttons">
                <button class="decrease-progress">-</button>
                <button class="increase-progress">+</button>
            </div>
        </div>
        <div class="task-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    // Define o progresso corretamente no DOM
    const fillDiv = newTaskItem.querySelector('.progress-fill');
    fillDiv.style.width = `${progress}%`;

    // Adiciona visualmente a classe "completed-task" se estiver 100%
    if (progress === 100) {
        newTaskItem.classList.add('completed-task');
    }

    taskList.appendChild(newTaskItem);

    activateProgressButtons(newTaskItem); // já usa o valor atual de progresso
    activateActions(newTaskItem);
    updateSummary(); // cuidado: só atualiza depois de adicionar tudo
    reorderTasks(); // agora pode reordenar com base em progresso
}

// Ativar os botões + e - de progresso
function activateProgressButtons(taskItem) {
    const decreaseBtn = taskItem.querySelector('.decrease-progress');
    const increaseBtn = taskItem.querySelector('.increase-progress');
    const fillDiv = taskItem.querySelector('.progress-fill');

    let current = parseInt(fillDiv.style.width); // pega o progresso atual inicial

    decreaseBtn.addEventListener('click', () => {
        current = Math.max(0, current - 5);
        fillDiv.style.width = `${current}%`;
        saveTasks();
        updateSummary();
        reorderTasks();
        registrarProgressoDiario();
    });

    increaseBtn.addEventListener('click', () => {
        current = Math.min(100, current + 5);
        fillDiv.style.width = `${current}%`;
        saveTasks();
        updateSummary();
        reorderTasks();
        registrarProgressoDiario();
    });
}

// Ativar os botões de editar e excluir
function activateActions(taskItem) {
    const editBtn = taskItem.querySelector('.edit-btn');
    const deleteBtn = taskItem.querySelector('.delete-btn');

    editBtn.addEventListener('click', () => {
        const taskNameSpan = taskItem.querySelector('.task-name');
        const taskDeadlineSpan = taskItem.querySelector('.task-deadline');

        const taskNameInput = document.createElement('input');
        taskNameInput.type = 'text';
        taskNameInput.value = taskNameSpan.innerText;
        taskNameInput.className = 'edit-input';

        const taskDeadlineInput = document.createElement('input');
        taskDeadlineInput.type = 'date';
        taskDeadlineInput.value = taskDeadlineSpan.innerText;
        taskDeadlineInput.className = 'edit-input';

        taskItem.querySelector('.task-info').innerHTML = '';
        taskItem.querySelector('.task-info').appendChild(taskNameInput);
        taskItem.querySelector('.task-info').appendChild(taskDeadlineInput);

        const saveEditBtn = document.createElement('button');
        saveEditBtn.innerText = 'Salvar';
        saveEditBtn.className = 'save-btn';

        const actionsContainer = taskItem.querySelector('.task-actions');
        actionsContainer.innerHTML = '';
        actionsContainer.appendChild(saveEditBtn);

        saveEditBtn.addEventListener('click', () => {
            const updatedName = taskNameInput.value.trim();
            const updatedDeadline = taskDeadlineInput.value;

            if (updatedName === '' || updatedDeadline === '') {
                alert('Preencha o nome e o prazo!');
                return;
            }

            const newTaskNameSpan = document.createElement('span');
            newTaskNameSpan.className = 'task-name';
            newTaskNameSpan.innerText = updatedName;

            const newTaskDeadlineSpan = document.createElement('span');
            newTaskDeadlineSpan.className = 'task-deadline';
            newTaskDeadlineSpan.innerText = updatedDeadline;

            const taskInfo = taskItem.querySelector('.task-info');
            taskInfo.innerHTML = '';
            taskInfo.appendChild(newTaskNameSpan);
            taskInfo.appendChild(newTaskDeadlineSpan);

            actionsContainer.innerHTML = `
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">🗑️</button>
            `;
            activateActions(taskItem);
            saveTasks();
            reorderTasks();
            registrarProgressoDiario();
        });
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            taskItem.remove();
            saveTasks();
            updateSummary();
        }
    });
}

// Salvar tarefas
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(task => {
        const name = task.querySelector('.task-name').textContent;
        const deadline = task.querySelector('.task-deadline').textContent;
        const progress = parseInt(task.querySelector('.progress-fill').style.width);
        tasks.push({ name, deadline, progress });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Carregar tarefas salvas
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const onlyCompleted = window.location.pathname.includes('concluidos');

    tasks.forEach(task => {
        if (!onlyCompleted || task.progress === 100) {
            createTask(task.name, task.deadline, task.progress);
        }
    });
}

// Atualizar resumo geral
function updateSummary() {
    const tasks = document.querySelectorAll('.task-item');
    const total = tasks.length;
    let completed = 0;
    let sumProgress = 0;

    tasks.forEach(task => {
        const progress = parseInt(task.querySelector('.progress-fill').style.width);
        if (progress === 100) completed++;
        sumProgress += progress;
    });

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('average-progress').textContent = total ? `${Math.round(sumProgress / total)}%` : '0%';
}

window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateSummary();
    registrarProgressoDiario();
});

function reorderTasks() {
    const taskList = document.querySelector('.task-list');
    const tasks = Array.from(taskList.children);

    const incomplete = tasks.filter(task => parseInt(task.querySelector('.progress-fill').style.width) < 100);
    const complete = tasks.filter(task => parseInt(task.querySelector('.progress-fill').style.width) === 100);

    // Limpa a lista e adiciona as tarefas em ordem
    taskList.innerHTML = '';
    [...incomplete, ...complete].forEach(task => {
        // Aplica classe visual em concluídas
        const progress = parseInt(task.querySelector('.progress-fill').style.width);
        if (progress === 100) {
            task.classList.add('completed-task');
        } else {
            task.classList.remove('completed-task');
        }
        taskList.appendChild(task);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const calendarEl = document.getElementById("calendar");
  
    if (!calendarEl) return;
  
    const now = dayjs();
    const startOfMonth = now.startOf("month");
    const endOfMonth = now.endOf("month");
    const startDay = startOfMonth.day(); // domingo = 0
  
    const daysInMonth = endOfMonth.date();
  
    // Semana
    const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const header = weekdays.map(day => `<div class="weekday">${day}</div>`).join('');
    let daysHtml = '';
  
    // Espaços vazios antes do 1º dia
    for (let i = 0; i < startDay; i++) {
      daysHtml += '<div class="empty"></div>';
    }
  
    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
        const dateKey = dayjs().date(i).format('YYYY-M-D');
        const isMarked = localStorage.getItem(dateKey) === "true";
      const className = isMarked ? "day marked" : "day";
      daysHtml += `<div class="${className}" data-dia="${today}" style="pointer-events: none;">${i}</div>`;
    }
  
    calendarEl.innerHTML = `
      <div class="calendar-grid">
        ${header}
        ${daysHtml}
      </div>
    `;
  });