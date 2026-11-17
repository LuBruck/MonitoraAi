const {
  cadastrarMonitoria,
  buscarPorDisciplina,
  encontrarConflito,
  validarMonitoria,
  agruparPorDia,
} = require('../src/js/monitorias');

/** Monitoria válida usada como base; cada teste altera só o que precisa. */
function exemplo(sobrescrever = {}) {
  return {
    disciplina: 'Cálculo I',
    monitor: 'Ana Souza',
    dia: 'Segunda',
    inicio: '10:00',
    fim: '12:00',
    local: 'Sala 204',
    ...sobrescrever,
  };
}

describe('Busca por disciplina', () => {
  const lista = [
    exemplo({ id: '1', disciplina: 'Cálculo I' }),
    exemplo({ id: '2', disciplina: 'Algoritmos', local: 'Lab 1' }),
    exemplo({ id: '3', disciplina: 'Cálculo II', dia: 'Terça' }),
  ];

  test('T1: encontra a disciplina ignorando maiúsculas e acentos', () => {
    const resultado = buscarPorDisciplina(lista, 'CALCULO');
    expect(resultado.map((m) => m.id)).toEqual(['1', '3']);
  });

  test('T1b: termo vazio devolve todas as monitorias', () => {
    expect(buscarPorDisciplina(lista, '   ')).toHaveLength(3);
  });
});

describe('Conflito de horário', () => {
  const existentes = [exemplo({ id: '1' })]; // Segunda, 10:00–12:00, Sala 204

  test('T2: detecta conflito no mesmo local, mesmo dia e horário sobreposto', () => {
    const nova = exemplo({ disciplina: 'Física', inicio: '11:00', fim: '13:00' });

    expect(encontrarConflito(nova, existentes)).not.toBeNull();

    const resultado = cadastrarMonitoria(existentes, nova);
    expect(resultado.ok).toBe(false);
    expect(resultado.erros[0]).toMatch(/Choque de horário/);
    expect(resultado.lista).toHaveLength(1); // nada foi cadastrado
  });

  test('T4: não acusa conflito em horários encostados ou em outra sala', () => {
    const encostada = exemplo({ inicio: '12:00', fim: '14:00' });
    const outraSala = exemplo({ local: 'Lab 2' });
    const outroDia = exemplo({ dia: 'Quarta' });

    expect(encontrarConflito(encostada, existentes)).toBeNull();
    expect(encontrarConflito(outraSala, existentes)).toBeNull();
    expect(encontrarConflito(outroDia, existentes)).toBeNull();
  });
});

describe('Validação e cadastro', () => {
  test('T3: rejeita campo obrigatório vazio', () => {
    const resultado = cadastrarMonitoria([], exemplo({ monitor: '   ' }));

    expect(resultado.ok).toBe(false);
    expect(resultado.erros).toContain('Monitor é obrigatório.');
    expect(resultado.lista).toHaveLength(0);
  });

  test('T5: rejeita horário de início igual ou depois do fim', () => {
    const { valido, erros } = validarMonitoria(exemplo({ inicio: '14:00', fim: '13:00' }));

    expect(valido).toBe(false);
    expect(erros).toContain('O horário de início deve ser antes do horário de fim.');
  });

  test('T6: cadastra monitoria válida e mostra na grade em ordem de horário', () => {
    let lista = [];
    lista = cadastrarMonitoria(lista, exemplo({ inicio: '14:00', fim: '15:00' })).lista;
    lista = cadastrarMonitoria(lista, exemplo({ inicio: '08:00', fim: '09:00' })).lista;

    const grade = agruparPorDia(lista);

    expect(lista).toHaveLength(2);
    expect(grade.Segunda.map((m) => m.inicio)).toEqual(['08:00', '14:00']);
    expect(grade.Sábado).toEqual([]);
  });
});
