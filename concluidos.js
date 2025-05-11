document.addEventListener('DOMContentLoaded', () => {
    const concluidosList = document.getElementById('concluidos-list');
    const tarefas = JSON.parse(localStorage.getItem('tasks')) || [];
  
    const concluidas = tarefas.filter(tarefa => tarefa.progress >= 100);
  
    if (concluidas.length === 0) {
      concluidosList.innerHTML = "<p>Nenhuma tarefa concluída ainda.</p>";
      return;
    }
  
    concluidas.forEach(tarefa => {
      console.log(tarefa); // <-- veja o que aparece no console
      const li = document.createElement('li');
      li.textContent = tarefa.name;
      concluidosList.appendChild(li);
    });
  });