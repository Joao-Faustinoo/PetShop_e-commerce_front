/**
 * [CONFIG] Cypress
 *
 * O QUE FAZ: configura a suíte de testes de ponta a ponta.
 *
 * COMO FARÁ: aponta a base para o servidor de desenvolvimento do Next e
 * desliga o vídeo, que pesa e não é consultado. Os testes exigem a API
 * no ar em localhost:3333 — sem ela o login falha, que é justamente o
 * que eles verificam.
 *
 * ATENDE: RNF0048 (testes automatizados)
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    // O Next em modo dev compila a rota na primeira visita; o padrão de 4s
    // estoura nisso e transforma compilação lenta em teste vermelho.
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 120000,

    setupNodeEvents(on) {
      /**
       * Sem isto o Electron morre na largada neste Windows, com
       * STATUS_BREAKPOINT (0x80000003) e nenhuma mensagem — é a aceleração
       * de GPU. Desligá-la não muda o que os testes verificam.
       */
      on('before:browser:launch', (browser, opcoes) => {
        // O Electron ignora estas opções e ainda emite um aviso; quem o
        // configura é a variável de ambiente em scripts/e2e.mjs.
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          opcoes.args.push('--disable-gpu', '--disable-software-rasterizer');
        }

        return opcoes;
      });
    },
  },
});
