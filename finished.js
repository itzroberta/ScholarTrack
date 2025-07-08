document.addEventListener('DOMContentLoaded', () => {
  const concluidosList = document.getElementById('concluidos-list');
  const tarefas = JSON.parse(localStorage.getItem('tasks')) || [];

  const concluidas = tarefas.filter(tarefa => tarefa.progress >= 100);

  if (concluidas.length === 0) {
    concluidosList.innerHTML = "<p>There are no tasks completed yet.</p>";
    return;
  }

  concluidas.forEach(tarefa => {
    const li = document.createElement('li');

    const conteudo = document.createElement('div');
    conteudo.className = 'task-content';

    const nome = document.createElement('div');
    nome.textContent = tarefa.name;

    const data = document.createElement('div');
    data.className = 'completion-date';

    const dataConclusao = tarefa.completedAt
      ? formatarData(tarefa.completedAt)
      : "Unknown date";

    data.textContent = `Completed in: ${dataConclusao}`;

    conteudo.appendChild(nome);
    conteudo.appendChild(data);
    li.appendChild(conteudo);
    concluidosList.appendChild(li);
  });
});

function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleDateString("en-US", {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}