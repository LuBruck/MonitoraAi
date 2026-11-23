# MonitoraAí

Aplicação web para **cadastrar e consultar monitorias** da faculdade por disciplina, dia e horário.

🌐 **Aplicação publicada:** https://lubruck.github.io/MonitoraAi/
📄 **Documento técnico:** [`docs/documento-tecnico.pdf`](docs/documento-tecnico.pdf)

---

## Problema

As informações de monitoria (disciplina, monitor, dia, horário e sala) ficam espalhadas em murais, grupos e avisos em sala. O aluno não tem um lugar único para descobrir quando e onde há monitoria, e quem organiza acaba marcando duas monitorias na mesma sala no mesmo horário.

O MonitoraAí centraliza o cadastro e a consulta, e **impede choque de horário no mesmo local**.

## Funcionalidades

- **Cadastrar monitoria:** disciplina, monitor, dia (segunda a sábado), horário de início e fim, e local (lista fixa de salas)
- **Grade da semana:** monitorias agrupadas por dia e ordenadas por horário
- **Busca por disciplina:** ignora maiúsculas e acentos ("calculo" encontra "Cálculo I")
- **Validações:**
  - campos obrigatórios
  - dia e sala válidos
  - início antes do fim
  - sem conflito de horário na mesma sala (horários encostados, como 10–12 e 12–14, são permitidos)
- **Versão no rodapé:** mostra a versão e o commit publicados, com link para o GitHub

## Integrantes

| Integrante | Responsabilidade principal |
|---|---|
| Lucas Bruck ([@LuBruck](https://github.com/LuBruck)) | Integração, pipeline CI/CD, interface e publicação |
| Marcelo Yuji Ruiz ([@MarceloYujiRuiz](https://github.com/MarceloYujiRuiz)) | Regras de negócio e validações |
| Julia Pivello ([@juliapivello](https://github.com/juliapivello)) | Testes automatizados, qualidade e evidências |

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML, CSS, JavaScript | Aplicação (sem framework) |
| localStorage | Persistência dos dados no navegador |
| Node.js 22 + npm | Scripts de build e testes |
| Jest | Testes automatizados |
| GitHub Actions | Pipeline CI/CD |
| GitHub Pages | Publicação |

## Como executar

**Online:** acesse https://lubruck.github.io/MonitoraAi/

**Localmente:**

```bash
git clone https://github.com/LuBruck/MonitoraAi.git
cd MonitoraAi
npm ci                 # instala as dependências exatas do package-lock.json
npm run build          # gera a pasta dist/
cd dist && python3 -m http.server 8080
# abra http://localhost:8080
```

> Também é possível abrir `src/index.html` direto no navegador. Nesse caso o rodapé mostra "versão de desenvolvimento".

## Testes

```bash
npm test
```

| Teste | O que verifica |
|---|---|
| T1 / T1b | Busca por disciplina ignora caixa e acentos; termo vazio retorna tudo |
| T2 | Detecta conflito (mesma sala, mesmo dia, horário sobreposto) e recusa o cadastro |
| T3 | Rejeita campo obrigatório vazio |
| T4 | Não acusa conflito em horários encostados, em outra sala ou em outro dia |
| T5 | Rejeita início igual ou depois do fim |
| T6 | Cadastro válido aparece na grade em ordem de horário |

As regras ficam em `src/js/monitorias.js` como funções puras, então os testes rodam no Node, sem navegador.

## Pipeline CI/CD

Arquivo: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

```
Build e testes ──► Entrega ──► Publicação (GitHub Pages)
     (CI)            (CD)        só na main + aprovação manual
```

| Job | Quando roda | O que faz |
|---|---|---|
| **Build e testes** | Todo push, todo PR para a `main` e execução manual | `npm ci` → `npm run build` → `npm test` → guarda o `dist/` como artefato `monitoraai-<commit>` |
| **Entrega** | Só se o job anterior passou | Empacota o `dist/` validado para o GitHub Pages |
| **Publicação** | Só na `main`, depois da entrega | Aguarda **aprovação manual** no environment `github-pages` e publica |

**Build** (`npm run build`, em `scripts/build.js`):
- copia `src/` para `dist/`;
- verifica se os arquivos essenciais existem e se as referências do HTML existem;
- gera `dist/version.json` com versão, commit e link da execução.

**Se um teste falhar**, Entrega e Publicação ficam *skipped*, e a proteção da `main` (ruleset `protege-main`) bloqueia o merge do PR. Isso foi demonstrado no [PR #9](https://github.com/LuBruck/MonitoraAi/pull/9).

## Entrega e publicação

O projeto usa **entrega contínua** (*Continuous Delivery*). Depois do merge na `main`, a versão fica pronta e o job de publicação fica *Waiting* até um revisor clicar em **Review deployments → Approve and deploy**. Só então o GitHub Pages é atualizado.

Merges que alteram **só documentação** (como os de evidências e deste README) não são aprovados para publicação, porque não mudam a aplicação. Por isso a versão no ar continua sendo a da última mudança de código.

Para saber qual versão está no ar, veja o rodapé do site ou [`version.json`](https://lubruck.github.io/MonitoraAi/version.json). Ele mostra o commit e o link da execução que gerou o pacote publicado.

| | |
|---|---|
| Versão entregue | **v0.2.1** (tag `v0.2.1`) |
| Commit | [`e771b94`](https://github.com/LuBruck/MonitoraAi/commit/e771b9466ff8042aec62aab3104db74f7cbf9e23) |
| Execução que publicou | [Actions run 45249932743](https://github.com/LuBruck/MonitoraAi/actions/runs/45249932743) |

## Fluxo de trabalho (Git)

- `main` protegida: alterações só entram por pull request com o check **Build e testes** aprovado.
- Branches por tipo: `feature/`, `fix/`, `refactor/`, `ci/`, `cd/` e `docs/`.
- Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) (`feat:`, `fix:`, `test:`, `ci:`, `build:`, `docs:`).

## Estrutura

```
.github/workflows/ci-cd.yml   pipeline
docs/                         planejamento, documento técnico e evidências
scripts/build.js              etapa de build
src/                          aplicação (index.html, css/, js/)
tests/                        testes Jest
```

## Limitações conhecidas

- Dados no localStorage: cada navegador tem sua própria lista, sem compartilhamento.
- Não há edição nem remoção de monitorias.
- Lista de salas fixa no código.
- Os testes cobrem as regras de negócio, não a interface.
- A proteção da `main` exige o CI aprovado, mas não exige aprovação de outro integrante.
