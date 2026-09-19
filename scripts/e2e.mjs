/**
 * [CONFIG] Execução da suíte de ponta a ponta
 *
 * O QUE FAZ: roda o Cypress com a aceleração de GPU desligada.
 *
 * COMO FARÁ: invoca o CLI do Cypress em um processo filho, injetando
 * ELECTRON_EXTRA_LAUNCH_ARGS no ambiente dele. A variável precisa estar
 * no processo que sobe o aplicativo do Cypress; o hook
 * `before:browser:launch` do cypress.config.ts configura só o navegador
 * onde os testes rodam, não o aplicativo em si.
 *
 * POR QUE: sem `--disable-gpu`, o Cypress morre na largada neste Windows
 * com STATUS_BREAKPOINT (0x80000003) e nenhuma mensagem de erro. Em
 * máquinas onde a GPU não dá problema, a flag é inofensiva.
 *
 * USO: `yarn e2e` (headless) ou `yarn e2e:abrir` (interativo).
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// O pacote do Cypress não expõe o CLI em `exports`, então o caminho é
// montado a partir daqui em vez de resolvido pelo Node.
const aqui = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(aqui, '..', 'node_modules', 'cypress', 'bin', 'cypress');

const interativo = process.argv.includes('--abrir');
const comando = interativo ? 'open' : 'run';

const filho = spawn(process.execPath, [cli, comando, '--e2e'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_EXTRA_LAUNCH_ARGS: [
      process.env.ELECTRON_EXTRA_LAUNCH_ARGS,
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--no-sandbox',
    ]
      .filter(Boolean)
      .join(' '),
  },
});

filho.on('exit', codigo => process.exit(codigo ?? 1));
