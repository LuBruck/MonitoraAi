/**
 * Build do MonitoraAí.
 *
 * A aplicação é HTML/CSS/JS puro, então o "build" é preparar uma pasta de entrega:
 *   1. limpa a pasta dist/
 *   2. copia src/ para dist/
 *   3. verifica se os arquivos essenciais existem
 *   4. verifica se todo CSS/JS referenciado no index.html existe
 *   5. grava dist/version.json (versão + commit), para rastrear o que foi entregue
 *
 * Se qualquer verificação falhar, o processo termina com código 1 e o pipeline para.
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const SRC = path.join(RAIZ, 'src');
const DIST = path.join(RAIZ, 'dist');

const ARQUIVOS_ESSENCIAIS = ['index.html', 'css/style.css', 'js/monitorias.js', 'js/app.js'];

function falhar(mensagem) {
  console.error(`❌ Build falhou: ${mensagem}`);
  process.exit(1);
}

// 1. Limpar
fs.rmSync(DIST, { recursive: true, force: true });

// 2. Copiar
if (!fs.existsSync(SRC)) falhar('pasta src/ não encontrada.');
fs.cpSync(SRC, DIST, { recursive: true });
console.log('📁 src/ copiado para dist/');

// 3. Arquivos essenciais
for (const arquivo of ARQUIVOS_ESSENCIAIS) {
  const caminho = path.join(DIST, arquivo);
  if (!fs.existsSync(caminho)) falhar(`arquivo essencial ausente: ${arquivo}`);
  if (fs.statSync(caminho).size === 0) falhar(`arquivo essencial vazio: ${arquivo}`);
}
console.log(`✅ ${ARQUIVOS_ESSENCIAIS.length} arquivos essenciais encontrados`);

// 4. Referências do index.html (href="..." e src="..." locais)
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const referencias = [...html.matchAll(/(?:href|src)="([^"#:]+\.(?:css|js))"/g)].map((m) => m[1]);
for (const ref of referencias) {
  if (!fs.existsSync(path.join(DIST, ref))) falhar(`index.html referencia "${ref}", que não existe.`);
}
console.log(`🔗 ${referencias.length} referências do index.html verificadas`);

// 5. Rastreabilidade
const { version } = require(path.join(RAIZ, 'package.json'));
const info = {
  versao: version,
  commit: process.env.GITHUB_SHA || 'local',
  branch: process.env.GITHUB_REF_NAME || 'local',
  execucao: process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null,
  geradoEm: new Date().toISOString(),
};
fs.writeFileSync(path.join(DIST, 'version.json'), JSON.stringify(info, null, 2));
console.log(`🏷️  version.json gerado: v${info.versao} (commit ${info.commit.slice(0, 7)})`);

console.log('🎉 Build concluído em dist/');
