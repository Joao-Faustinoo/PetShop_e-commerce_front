/**
 * [TESTE] Autenticação de ponta a ponta
 *
 * O QUE FAZ: verifica o login contra a API real, o redirecionamento por
 * perfil e a proteção das rotas.
 *
 * COMO FARÁ: dirige a tela de login como um usuário faria, sem atalhos de
 * estado, e confere o que chegou ao localStorage e à URL. Exige a API no
 * ar em localhost:3333 com o banco populado pelo seed.
 *
 * ATENDE: premissas do projeto (login por perfil), RF0023, RNF0048
 */

/** Lê o payload do JWT sem depender de biblioteca. */
const lerPayload = (token: string) =>
  JSON.parse(atob(token.split('.')[1])) as {
    sub: number;
    perfil: string;
    clienteId?: number;
    exp: number;
  };

/**
 * O Next compila cada rota na primeira visita em modo dev. Esperar o
 * redirecionamento com o padrão de 15s deixa o teste instável quando a
 * máquina está ocupada — a rota ainda nem renderizou.
 */
const ESPERA_ROTA = { timeout: 60000 };

const CHAVE_TOKEN = '@petshop: accessToken';
const CHAVE_USUARIO = '@petshop: user';

describe('Autenticação', () => {
  it('cliente entra e cai no catálogo', () => {
    cy.entrarComo('cliente');

    cy.location('pathname').should('eq', '/produtos');
    cy.contains('Catálogo').should('be.visible');

    cy.window().then(win => {
      const usuario = JSON.parse(
        win.localStorage.getItem(CHAVE_USUARIO) ?? '{}',
      );

      expect(usuario.perfil).to.eq('CLIENTE');
      expect(usuario.email).to.eq('user.cliente@email.com');
      // O nome vem do banco, não de mock: prova que a API respondeu.
      expect(usuario.nome).to.be.a('string').and.not.be.empty;
      expect(usuario.clienteId).to.eq(1);
    });
  });

  it('administrador entra e cai na área administrativa', () => {
    cy.entrarComo('administrador');

    cy.location('pathname').should('eq', '/admin/pedidos');
    cy.contains('Pedidos').should('be.visible');

    cy.window().then(win => {
      const usuario = JSON.parse(
        win.localStorage.getItem(CHAVE_USUARIO) ?? '{}',
      );

      expect(usuario.perfil).to.eq('ADMIN');
      // O administrador não compra: não tem cadastro de cliente vinculado.
      expect(usuario.clienteId).to.eq(undefined);
    });
  });

  it('o token guardado é um JWT assinado pela API, não um token fake', () => {
    cy.entrarComo('cliente');

    // O token só é gravado no onSuccess da mutation; esperar a rota trocar
    // garante que ele já está lá.
    cy.location('pathname').should('eq', '/produtos');

    cy.window().then(win => {
      const token = win.localStorage.getItem(CHAVE_TOKEN) ?? '';

      expect(token.split('.')).to.have.length(3);

      const payload = lerPayload(token);

      expect(payload.perfil).to.eq('CLIENTE');
      expect(payload.clienteId).to.eq(1);
      expect(payload.exp * 1000).to.be.greaterThan(Date.now());
    });
  });

  it('recusa e-mail que não está cadastrado', () => {
    cy.intercept('POST', '**/auth/login').as('login');

    cy.visit('/');
    cy.get('#email').type('naoexiste@email.com');
    cy.get('#senha').type('123@Pass');
    cy.contains('button', 'Entrar').click();

    cy.wait('@login').its('response.statusCode').should('eq', 401);

    cy.contains('E-mail ou senha inválidos').should('be.visible');
    cy.location('pathname').should('eq', '/');
    cy.window().then(win => {
      expect(win.localStorage.getItem(CHAVE_TOKEN)).to.eq(null);
    });
  });

  it('barra e-mail malformado antes de chamar a API', () => {
    cy.intercept('POST', '**/auth/login', cy.spy().as('chamouApi'));

    cy.visit('/');
    cy.get('#email').type('nao-e-um-email');
    cy.get('#senha').type('123@Pass');
    cy.contains('button', 'Entrar').click();

    // Quem barra aqui é o próprio navegador: o campo é type="email", então
    // o submit nem acontece e o yup não chega a rodar. A mensagem
    // "Insira um e-mail válido" do LoginSchema só apareceria se o valor
    // fosse preenchido por código, contornando a validação nativa.
    cy.get('#email').then(campo => {
      expect((campo[0] as HTMLInputElement).checkValidity()).to.eq(false);
    });

    cy.get('@chamouApi').should('not.have.been.called');
    cy.location('pathname').should('eq', '/');
  });

  it('exige a senha', () => {
    cy.visit('/');
    cy.get('#email').type('user.cliente@email.com');
    cy.contains('button', 'Entrar').click();

    cy.contains('Senha é obrigatória').should('be.visible');
    cy.location('pathname').should('eq', '/');
  });
});

describe('Proteção de rotas', () => {
  it('visitante não alcança a área administrativa', () => {
    cy.visit('/admin/pedidos');

    cy.location('pathname', ESPERA_ROTA).should('eq', '/');
  });

  it('visitante não alcança o catálogo', () => {
    cy.visit('/produtos');

    cy.location('pathname', ESPERA_ROTA).should('eq', '/');
  });

  it('cliente logado é devolvido ao tentar a área administrativa', () => {
    cy.entrarComo('cliente');
    cy.location('pathname').should('eq', '/produtos');

    cy.visit('/admin/pedidos');

    cy.location('pathname', ESPERA_ROTA).should('eq', '/produtos');
  });

  it('administrador logado é devolvido ao tentar a loja', () => {
    cy.entrarComo('administrador');
    cy.location('pathname').should('eq', '/admin/pedidos');

    cy.visit('/produtos');

    cy.location('pathname', ESPERA_ROTA).should('eq', '/admin/pedidos');
  });
});

describe('Encerrar a sessão', () => {
  it('sair limpa a sessão e volta para o login', () => {
    cy.entrarComo('cliente');
    cy.location('pathname').should('eq', '/produtos');

    cy.contains('button', 'Sair').click();

    // O botão do topo abre uma confirmação antes de encerrar.
    cy.contains('Você vai sair da sua conta').should('be.visible');
    cy.get('button:visible').filter(':contains("Sair")').last().click();

    cy.location('pathname').should('eq', '/');
    cy.window().then(win => {
      expect(win.localStorage.getItem(CHAVE_TOKEN)).to.eq(null);
      expect(win.localStorage.getItem(CHAVE_USUARIO)).to.eq(null);
    });
  });
});
