/**
 * [CONFIG] Suporte do Cypress
 *
 * O QUE FAZ: roda antes de cada arquivo de teste.
 *
 * COMO FARÁ: importa os comandos customizados. O isolamento entre testes
 * (limpeza de localStorage e cookies) é feito pelo próprio Cypress.
 */

import './commands';
