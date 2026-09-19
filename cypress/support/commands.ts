/**
 * [CONFIG] Comandos customizados do Cypress
 *
 * O QUE FAZ: encurta o que todo teste de sessão precisa repetir.
 *
 * COMO FARÁ: `entrarComo` preenche o formulário de login pelo atalho de
 * demonstração da própria tela e espera a resposta da API, para que o
 * teste seguinte só comece com a sessão gravada.
 */

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      entrarComo(perfil: 'cliente' | 'administrador'): Chainable<void>;
    }
  }
}

Cypress.Commands.add('entrarComo', (perfil: 'cliente' | 'administrador') => {
  cy.intercept('POST', '**/auth/login').as('login');

  cy.visit('/');
  cy.contains('button', `Entrar como ${perfil}`).click();
  cy.contains('button', 'Entrar').click();

  // Espera a API responder: sem isso o teste corre contra o redirecionamento.
  cy.wait('@login').its('response.statusCode').should('eq', 200);
});
