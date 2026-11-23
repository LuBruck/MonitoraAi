/**
 * MonitoraAí — regras de negócio.
 *
 * Este arquivo contém apenas funções puras (sem DOM e sem localStorage).
 * Assim, a mesma lógica é usada no navegador (app.js) e testada pelo Jest.
 */
(function (global) {
  'use strict';

  const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const SALAS = ['Sala 101', 'Sala 102', 'Sala 204', 'Lab 1', 'Lab 2', 'Biblioteca'];

  const CAMPOS_OBRIGATORIOS = {
    disciplina: 'Disciplina',
    monitor: 'Monitor',
    dia: 'Dia',
    inicio: 'Horário de início',
    fim: 'Horário de fim',
    local: 'Local',
  };

  /** Remove acentos, espaços nas pontas e deixa minúsculo: " Cálculo " -> "calculo" */
  function normalizar(texto) {
    return String(texto ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim()
      .toLowerCase();
  }

  /** Converte "HH:MM" em minutos desde 00:00. Retorna null se o formato for inválido. */
  function horaParaMinutos(hora) {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(hora ?? '').trim());
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  /** Remove espaços extras de todos os campos de texto. */
  function limparDados(dados) {
    const limpo = {};
    for (const campo of Object.keys(CAMPOS_OBRIGATORIOS)) {
      limpo[campo] = String(dados?.[campo] ?? '').trim();
    }
    return limpo;
  }

  /**
   * Valida os dados de uma monitoria.
   * @returns {{ valido: boolean, erros: string[] }}
   */
  function validarMonitoria(dados) {
    const limpo = limparDados(dados);
    const erros = [];

    for (const [campo, rotulo] of Object.entries(CAMPOS_OBRIGATORIOS)) {
      if (limpo[campo] === '') erros.push(`${rotulo} é obrigatório.`);
    }
    if (erros.length > 0) return { valido: false, erros };

    if (!DIAS_SEMANA.includes(limpo.dia)) {
      erros.push('Dia inválido. Escolha um dia de segunda a sábado.');
    }
    if (!SALAS.includes(limpo.local)) {
      erros.push('Local inválido. Escolha uma sala da lista.');
    }

    const inicio = horaParaMinutos(limpo.inicio);
    const fim = horaParaMinutos(limpo.fim);
    if (inicio === null || fim === null) {
      erros.push('Horário inválido. Use o formato HH:MM.');
    } else if (inicio >= fim) {
      erros.push('O horário de início deve ser antes do horário de fim.');
    }

    return { valido: erros.length === 0, erros };
  }

  /** Dois intervalos se sobrepõem se um começa antes do outro terminar (e vice-versa). */
  function horariosSeSobrepoem(a, b) {
    return (
      horaParaMinutos(a.inicio) <= horaParaMinutos(b.fim) &&
      horaParaMinutos(b.inicio) <= horaParaMinutos(a.fim)
    );
  }

  /**
   * Procura uma monitoria existente no mesmo local, mesmo dia e com horário sobreposto.
   * @returns {object|null} a monitoria em conflito, ou null se não houver
   */
  function encontrarConflito(nova, existentes) {
    return (
      existentes.find(
        (m) => m.dia === nova.dia && m.local === nova.local && horariosSeSobrepoem(m, nova)
      ) || null
    );
  }

  function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * Cadastra uma monitoria se ela for válida e não tiver conflito.
   * Não altera a lista recebida: devolve uma nova lista.
   * @returns {{ ok: boolean, erros: string[], lista: object[], monitoria?: object }}
   */
  function cadastrarMonitoria(lista, dados) {
    const limpo = limparDados(dados);

    const validacao = validarMonitoria(limpo);
    if (!validacao.valido) return { ok: false, erros: validacao.erros, lista };

    const conflito = encontrarConflito(limpo, lista);
    if (conflito) {
      return {
        ok: false,
        erros: [
          `Choque de horário: ${conflito.local} já está ocupada (${conflito.dia}, ` +
            `${conflito.inicio}–${conflito.fim}, ${conflito.disciplina}).`,
        ],
        lista,
      };
    }

    const monitoria = { id: gerarId(), ...limpo };
    return { ok: true, erros: [], lista: [...lista, monitoria], monitoria };
  }

  /** Filtra pela disciplina, ignorando maiúsculas e acentos. Termo vazio devolve tudo. */
  function buscarPorDisciplina(lista, termo) {
    const alvo = normalizar(termo);
    if (alvo === '') return [...lista];
    return lista.filter((m) => normalizar(m.disciplina).includes(alvo));
  }

  /** Agrupa por dia (segunda a sábado) e ordena cada dia pelo horário de início. */
  function agruparPorDia(lista) {
    const grade = {};
    for (const dia of DIAS_SEMANA) grade[dia] = [];
    for (const m of lista) {
      if (grade[m.dia]) grade[m.dia].push(m);
    }
    for (const dia of DIAS_SEMANA) {
      grade[dia].sort((a, b) => horaParaMinutos(a.inicio) - horaParaMinutos(b.inicio));
    }
    return grade;
  }

  const api = {
    DIAS_SEMANA,
    SALAS,
    normalizar,
    horaParaMinutos,
    validarMonitoria,
    encontrarConflito,
    cadastrarMonitoria,
    buscarPorDisciplina,
    agruparPorDia,
  };

  // Node/Jest usa module.exports; o navegador recebe window.Monitorias
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.Monitorias = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
