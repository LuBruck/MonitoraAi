/**
 * MonitoraAí — camada de interface.
 * Liga o HTML às regras de negócio (monitorias.js) e salva os dados no localStorage.
 */
(function () {
  'use strict';

  const { DIAS_SEMANA, SALAS, cadastrarMonitoria, buscarPorDisciplina, agruparPorDia } =
    window.Monitorias;

  const CHAVE_STORAGE = 'monitoraai:monitorias';

  const form = document.getElementById('form-monitoria');
  const campoDia = document.getElementById('campo-dia');
  const campoLocal = document.getElementById('campo-local');
  const listaErros = document.getElementById('erros');
  const msgSucesso = document.getElementById('sucesso');
  const campoBusca = document.getElementById('busca');
  const grade = document.getElementById('grade');
  const contador = document.getElementById('contador');

  // ---------- Persistência ----------
  function carregar() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE_STORAGE));
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  }

  function salvar(lista) {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
  }

  let monitorias = carregar();

  // ---------- Helpers de DOM ----------
  function preencherSelect(select, opcoes) {
    for (const valor of opcoes) {
      const opt = document.createElement('option');
      opt.value = valor;
      opt.textContent = valor;
      select.appendChild(opt);
    }
  }

  function el(tag, classe, texto) {
    const node = document.createElement(tag);
    if (classe) node.className = classe;
    if (texto !== undefined) node.textContent = texto; // textContent evita injeção de HTML
    return node;
  }

  function mostrarErros(erros) {
    listaErros.replaceChildren(...erros.map((e) => el('li', null, e)));
    listaErros.hidden = erros.length === 0;
  }

  function mostrarSucesso(texto) {
    msgSucesso.textContent = texto;
    msgSucesso.hidden = !texto;
  }

  // ---------- Renderização da grade ----------
  function renderizar() {
    const filtradas = buscarPorDisciplina(monitorias, campoBusca.value);
    const porDia = agruparPorDia(filtradas);

    contador.textContent = campoBusca.value.trim()
      ? `${filtradas.length} monitoria(s) encontrada(s) para "${campoBusca.value.trim()}"`
      : `${monitorias.length} monitoria(s) cadastrada(s)`;

    const colunas = DIAS_SEMANA.map((dia) => {
      const coluna = el('div', 'dia');
      coluna.appendChild(el('h3', null, dia));

      if (porDia[dia].length === 0) {
        coluna.appendChild(el('p', 'vazio', 'Sem monitorias'));
      }

      for (const m of porDia[dia]) {
        const item = el('article', 'monitoria');
        item.appendChild(el('span', 'hora', `${m.inicio}–${m.fim}`));
        item.appendChild(el('strong', null, m.disciplina));
        item.appendChild(el('span', 'detalhe', `${m.monitor} · ${m.local}`));
        coluna.appendChild(item);
      }
      return coluna;
    });

    grade.replaceChildren(...colunas);
  }

  // ---------- Eventos ----------
  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(form));
    const resultado = cadastrarMonitoria(monitorias, dados);

    if (!resultado.ok) {
      mostrarErros(resultado.erros);
      mostrarSucesso('');
      return;
    }

    monitorias = resultado.lista;
    salvar(monitorias);
    mostrarErros([]);
    mostrarSucesso(`Monitoria de ${resultado.monitoria.disciplina} cadastrada!`);
    form.reset();
    renderizar();
  });

  campoBusca.addEventListener('input', renderizar);

  // ---------- Inicialização ----------
  preencherSelect(campoDia, DIAS_SEMANA);
  preencherSelect(campoLocal, SALAS);
  renderizar();
})();
