# Planejamento — MonitoraAí (Missão 01)

## Identificação
- **Sistema:** MonitoraAí
- **Equipe:** MonitoraAí Team *(ajustar se houver outro nome)*
- **Disciplina:** Gerência de Configuração e Manutenção de Software
- **Repositório:** https://github.com/LuBruck/MonitoraAi

## Problema
Na faculdade, as informações sobre monitorias (qual disciplina, quem é o monitor, dia, horário e sala) ficam espalhadas em murais, grupos de mensagem e avisos em sala. O aluno não tem um lugar único para descobrir quando e onde há monitoria da disciplina que precisa. Além disso, ao organizar os horários, é comum marcar duas monitorias na mesma sala e no mesmo horário.

## Objetivo
Uma aplicação web simples que centraliza o cadastro e a consulta de monitorias, com busca por disciplina, visão da grade semanal e bloqueio de choque de horário no mesmo local.

## Público
Alunos que procuram monitoria e monitores/coordenação que cadastram os horários.

## Funcionalidades (escopo)
| # | Funcionalidade | Tipo |
|---|---|---|
| F1 | Cadastrar monitoria (disciplina, monitor, dia, horário início/fim, local) | Manipulação de dados |
| F2 | Listar monitorias da semana agrupadas por dia e ordenadas por horário | Consulta |
| F3 | Buscar monitorias por disciplina (sem diferenciar maiúsculas e acentos) | Consulta |
| F4 | Remover monitoria | Manipulação de dados (opcional) |

### Validações
- V1: todos os campos são obrigatórios (sem espaços em branco)
- V2: o horário de início precisa ser anterior ao de fim
- V3: não pode haver choque de horário no mesmo local e no mesmo dia

### Fora do escopo
Login/autenticação, banco de dados remoto, edição de monitoria, notificações.

## Testes automatizados planejados (mínimo 3)
| # | Teste | Resultado esperado |
|---|---|---|
| T1 | Busca por disciplina | Retorna só as monitorias daquela disciplina, ignorando caixa e acento |
| T2 | Detecta conflito | Mesma sala, mesmo dia e horários sobrepostos → conflito |
| T3 | Rejeita campo vazio | Monitoria com campo vazio → inválida, com mensagem |
| T4 | Sem falso conflito | Horários encostados (10–12 e 12–14) ou salas diferentes → sem conflito |
| T5 | Horário invertido | Início ≥ fim → inválida |

## Tecnologias
HTML, CSS, JavaScript puro, localStorage, Node.js + Jest (testes), GitHub, GitHub Actions (CI/CD) e GitHub Pages (publicação).

## Papéis (equipe de 3)
| Integrante | Papéis principais |
|---|---|
| Lucas | Líder de integração + Engenheiro de pipeline (repositório, branches, PRs, CI/CD, publicação) |
| Marcelo | Desenvolvedor 1 + 2 (interface, cadastro, listagem, busca, validações) |
| Julia | Responsável por testes + Qualidade e documentação (casos de teste, README, evidências, documento PDF) |

> Todos revisam PRs e precisam saber explicar o projeto inteiro.

## Fluxo de branches
- `main`: versão estável; só recebe código via Pull Request com CI aprovado.
- `feature/<nome>`: uma branch por funcionalidade (ex.: `feature/cadastro`, `feature/busca`).
- `fix/<nome>`: correções (será usada na demonstração de falha e recuperação).

## Cronograma
| Data | Meta |
|---|---|
| até 17/11 | Fase 1 e 2: estrutura, aplicação, branches/PRs |
| 18/11 | Aula: levar dúvidas sobre o pipeline |
| até 21/11 | Fase 3 e 4: CI, CD, Pages, falha e recuperação com evidências |
| até 24/11 | Fase 5: documento PDF, README final, ensaio da apresentação |
| 25/11 | Entrega no Moodle e apresentações |
