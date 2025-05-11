document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-edital');
    const lista = document.getElementById('lista-editais');
    const nomeInput = document.getElementById('nome');
    const aberturaInput = document.getElementById('abertura');
    const encerramentoInput = document.getElementById('encerramento');
    const anotacaoInput = document.getElementById('edital-anotacao-input');
  
    // Criar o modal uma vez e reaproveitar
    const modal = document.createElement('div');
    modal.id = 'modal-anotacao';
    modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    modal.innerHTML = `
      <div class="modal-conteudo" style="
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        white-space: pre-wrap;
        position: relative;
      ">
        <span class="modal-fechar" style="
          position: absolute;
          top: 1rem;
          right: 1rem;
          cursor: pointer;
          font-size: 1.25rem;
        ">&times;</span>
        <h3>Anotações</h3>
        <p id="modal-texto" style="white-space: pre-wrap;"></p>
      </div>
    `;
    document.body.appendChild(modal);
  
    const modalTexto = document.getElementById('modal-texto');
    const fecharModal = modal.querySelector('.modal-fechar');
  
    fecharModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  
    const carregarEditais = () => {
      lista.innerHTML = '';
      const editais = JSON.parse(localStorage.getItem('editais')) || [];
  
      editais.forEach((edital, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="edital-topo">
            <div>
              <strong>${edital.nome}</strong>
              <div class="edital-datas">Abertura: ${edital.abertura} | Encerramento: ${edital.encerramento}</div>
            </div>
            <div class="edital-dias">${calcularDiasRestantes(edital.encerramento)}</div>
          </div>
          ${edital.anotacao ? `
            <div class="edital-anotacao">
              <button class="btn-ver-anotacao">📝 See notes</button>
            </div>
          ` : ''}
          <div class="edital-botoes">
            <button class="btn-editar">✏️ Edit</button>
            <button class="btn-excluir">🗑️ Delete</button>
          </div>
        `;
  
        // Botão "Ver anotação"
        const verBtn = li.querySelector('.btn-ver-anotacao');
        if (verBtn) {
          verBtn.addEventListener('click', () => {
            modalTexto.innerHTML = edital.anotacao.replace(/\n/g, '<br>');
            modal.style.display = 'flex';
          });
        }
  
        // Excluir
        li.querySelector('.btn-excluir').addEventListener('click', () => {
          if (confirm('Are you sure you want to delete this call for applications?')) {
            editais.splice(index, 1);
            localStorage.setItem('editais', JSON.stringify(editais));
            carregarEditais();
          }
        });
  
        // Editar
        li.querySelector('.btn-editar').addEventListener('click', () => {
          nomeInput.value = edital.nome;
          aberturaInput.value = edital.abertura;
          encerramentoInput.value = edital.encerramento;
          anotacaoInput.value = edital.anotacao;
  
          editais.splice(index, 1);
          localStorage.setItem('editais', JSON.stringify(editais));
          carregarEditais();
          nomeInput.focus();
        });
  
        lista.appendChild(li);
      });
    };
  
    const calcularDiasRestantes = (dataEncerramento) => {
      const hoje = new Date();
      const encerramento = new Date(dataEncerramento);
      const diff = Math.ceil((encerramento - hoje) / (1000 * 60 * 60 * 24));
      if (diff > 0) return `There are ${diff} days left`;
      if (diff === 0) return `Closes today`;
      return `Closed`;
    };
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const nome = nomeInput.value.trim();
      const abertura = aberturaInput.value;
      const encerramento = encerramentoInput.value;
      const anotacao = anotacaoInput.value.trim();
  
      if (!nome || !abertura || !encerramento) {
        alert('Please fill in all fields!');
        return;
      }
  
      const novoEdital = { nome, abertura, encerramento, anotacao };
      const editais = JSON.parse(localStorage.getItem('editais')) || [];
      editais.push(novoEdital);
      localStorage.setItem('editais', JSON.stringify(editais));
  
      form.reset();
      carregarEditais();
    });
  
    carregarEditais();
  });