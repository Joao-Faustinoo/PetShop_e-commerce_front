/**
 * [TESTE] Criação de pedido, do carrinho à finalização
 *
 * O QUE FAZ: exercita o caminho feliz da compra pela interface, contra a
 * API e o banco reais — carrinho com mais de um item, endereço e cartão do
 * perfil ou criados durante a compra, divisão em cartões, cupons e o
 * registro do pedido em EM PROCESSAMENTO.
 *
 * COMO FARÁ: dirige as telas como um cliente faria, sem atalho de estado e
 * sem stub de rede; o `cy.intercept` só observa. O carrinho é esvaziado
 * pela API antes de cada caso, para que um teste não herde o estado do
 * anterior. O título de cada teste declara o RF/RN que ele valida.
 *
 * EXIGE: API em localhost:3333 e front em localhost:3000, com o banco
 * populado pelo seed. Os casos CT-05 e CT-06 CONSOMEM cupons, e o CT-03
 * cria endereço e cartão: rode `npm run limpar:testes` na API para repor a
 * base antes de executar de novo.
 *
 * ATENDE: RF0031, RF0032, RF0033, RF0034, RF0035, RF0036, RF0037, RF0038,
 * RN0023, RN0024, RN0025, RN0031, RN0033, RN0034, RN0035, RN0036
 */

const API = 'http://localhost:3333/api';
const CHAVE_TOKEN = '@petshop: accessToken';

/** Esvazia o carrinho pela API, para cada caso começar do mesmo estado. */
const limparCarrinho = () => {
  cy.window().then(win => {
    cy.request({
      method: 'DELETE',
      url: `${API}/carrinho`,
      headers: { Authorization: `Bearer ${win.localStorage.getItem(CHAVE_TOKEN)}` },
      failOnStatusCode: false,
    });
  });
};

/** Põe `quantidade` unidades do produto no carrinho, pela tela de detalhe. */
const adicionarAoCarrinho = (produtoId: number, quantidade = 1) => {
  cy.intercept('POST', '**/carrinho/itens').as('adicionar');

  cy.visit(`/produtos/${produtoId}`);
  for (let i = 1; i < quantidade; i += 1) {
    cy.get('button[aria-label="Aumentar quantidade"]').click();
  }
  cy.contains('button', 'Adicionar ao carrinho').click();

  cy.wait('@adicionar').its('response.statusCode').should('be.oneOf', [200, 201]);
};

/**
 * Espera o frete fechar. Até ele chegar, o resumo mostra "A calcular" e o
 * valor pendente ainda não contempla a entrega — informar o cartão antes
 * disso cobre só o subtotal e deixa a compra impossível de finalizar.
 */
const esperarFrete = () =>
  cy.get('aside').contains('Frete').find('span').should('not.contain', 'A calcular');

/**
 * Lê um valor em reais do cartão de resumo, já convertido para número. A
 * busca é escopada ao `aside` do resumo porque o checkout também tem um
 * título "Frete" na etapa 2, e o `cy.contains` solto acharia o título.
 */
const valorDoResumo = (rotulo: string) =>
  cy
    .get('aside')
    .contains(rotulo)
    .find('span')
    .invoke('text')
    .then(texto => Number(texto.replace(/[^\d,-]/g, '').replace(',', '.')));

describe('Carrinho', () => {
  beforeEach(() => {
    cy.entrarComo('cliente');
    limparCarrinho();
  });

  it('CT-01 · carrinho com mais de um item e quantidade editável [RF0031, RF0032, RN0031]', () => {
    // RF0031: a quantidade já é definida na adição.
    adicionarAoCarrinho(13, 2);
    adicionarAoCarrinho(12, 1);

    cy.visit('/carrinho');

    cy.contains('Bandana Pet Xadrez').should('be.visible');
    cy.contains('Ratinho de Pelúcia com Catnip').should('be.visible');

    // RF0032: e também é editável na visualização do carrinho.
    cy.intercept('PUT', '**/carrinho/itens/*').as('alterar');

    cy.contains('Ratinho de Pelúcia com Catnip')
      .closest('li')
      .within(() => {
        cy.get('button[aria-label="Aumentar quantidade"]').click();
        cy.get('input[aria-label="Quantidade"]').should('have.value', '2');
      });

    cy.wait('@alterar').its('response.statusCode').should('eq', 200);

    // RN0031: o campo não deixa passar do saldo em estoque.
    cy.get('input[aria-label="Quantidade"]')
      .first()
      .should('have.attr', 'max')
      .and('not.eq', '0');
  });
});

describe('Compra', () => {
  beforeEach(() => {
    cy.entrarComo('cliente');
    limparCarrinho();
  });

  it('CT-02 · compra com endereço e cartão já cadastrados [RF0033, RF0034, RF0035, RF0036, RF0038]', () => {
    adicionarAoCarrinho(11);

    cy.visit('/carrinho');
    cy.contains('button', 'Finalizar compra').click();

    // RF0035: o endereço de entrega do perfil já vem selecionado.
    cy.get('input[name="endereco"]').first().should('be.checked');

    // RF0034: o frete é calculado a partir dos itens e do destino.
    esperarFrete();
    valorDoResumo('Frete').should('be.greaterThan', 0);

    // RF0036: cartão já cadastrado, sem digitar nada novo.
    cy.get('#cartao').select(1);
    cy.contains('button', 'Adicionar').click();

    cy.intercept('POST', '**/pedidos').as('finalizar');
    cy.contains('button', 'Finalizar compra').click();

    cy.wait('@finalizar').its('response.statusCode').should('eq', 201);
    cy.contains('Compra registrada!').should('be.visible');
  });

  it('CT-03 · endereço e cartão criados na compra e incorporados ao perfil [RF0035, RF0036, RN0023, RN0024, RN0025]', () => {
    adicionarAoCarrinho(7);

    cy.visit('/carrinho');
    cy.contains('button', 'Finalizar compra').click();

    // RF0035 e RN0023: endereço novo durante a compra, com todos os campos.
    cy.contains('button', 'Novo endereço').click();
    cy.get('#apelido').clear().type('Entrega CT03');
    cy.get('#tipoResidenciaId').select('Apartamento');
    cy.get('#tipoLogradouroId').select('Avenida');
    cy.get('#logradouro').clear().type('Paulista');
    cy.get('#numero').clear().type('1578');
    cy.get('#bairro').clear().type('Bela Vista');
    cy.get('#cep').clear().type('01310200');
    cy.get('#cidade').clear().type('São Paulo');
    cy.get('#estado').clear().type('SP');
    cy.get('#pais').clear().type('Brasil');
    cy.contains('button', 'Adicionar endereço').click();

    cy.contains('Entrega CT03').should('be.visible');

    // RF0036, RN0024 e RN0025: cartão novo, de bandeira aceita.
    cy.contains('button', 'Novo cartão').click();
    cy.get('#numero').clear().type('5555666677778884');
    cy.get('#nomeImpresso').clear().type('CLIENTE CT03');
    cy.get('#bandeiraId').select('Mastercard');
    cy.get('#codigoSeguranca').clear().type('321');
    cy.contains('button', 'Adicionar cartão').click();

    cy.get('#cartao').should('contain.value', '');
    cy.contains('option', '8884').should('exist');
    cy.get('#cartao').select('**** **** **** 8884');
    cy.contains('button', 'Adicionar').click();

    cy.intercept('POST', '**/pedidos').as('finalizar');
    cy.contains('button', 'Finalizar compra').click();
    cy.wait('@finalizar').its('response.statusCode').should('eq', 201);

    // Os dois foram incorporados ao perfil, como a RF0035 e a RF0036 pedem.
    cy.visit('/perfil/enderecos');
    cy.contains('Entrega CT03').should('be.visible');

    cy.visit('/perfil/cartoes');
    cy.contains('8884').should('be.visible');
  });

  it('CT-04 · dividir em dois cartões exige o mínimo de R$ 10,00 em cada [RN0034]', () => {
    adicionarAoCarrinho(3);

    cy.visit('/carrinho');
    cy.contains('button', 'Finalizar compra').click();

    esperarFrete();

    // Sem cupom, a exceção da RN0035 não vale: cada cartão precisa de R$ 10.
    cy.get('#cartao').select(1);
    cy.get('#valorCartao').clear().type('5');
    cy.contains('button', 'Adicionar').click();

    cy.contains('mínimo por cartão').should('be.visible');

    // E a compra não pode ser finalizada enquanto a divisão for inválida.
    cy.contains('button', 'Finalizar compra').should('be.disabled');
  });

  it('CT-05 · cupom promocional deixa o cartão abaixo de R$ 10,00 [RN0033, RN0035]', () => {
    adicionarAoCarrinho(12);

    cy.visit('/carrinho');
    cy.contains('button', 'Finalizar compra').click();

    // RN0033: um cupom promocional por compra.
    cy.intercept('GET', '**/cupons/*').as('conferirCupom');
    cy.get('#cupom').clear().type('PETLOVER25');
    cy.contains('button', 'Aplicar').click();
    cy.wait('@conferirCupom');

    cy.contains('PETLOVER25').should('be.visible');

    // RN0035: com cupom, o que sobra para o cartão pode ficar abaixo do mínimo.
    valorDoResumo('Restante no cartão').should('be.lessThan', 10);

    cy.get('#cartao').select(1);
    cy.contains('button', 'Adicionar').click();

    cy.intercept('POST', '**/pedidos').as('finalizar');
    cy.contains('button', 'Finalizar compra').click();
    cy.wait('@finalizar').its('response.statusCode').should('eq', 201);
    cy.contains('Compra registrada!').should('be.visible');
  });

  it('CT-06 · cupons acima do total emitem cupom de troca com a diferença [RF0037, RN0036]', () => {
    adicionarAoCarrinho(2, 2);

    cy.visit('/carrinho');
    cy.contains('button', 'Finalizar compra').click();

    esperarFrete();

    // Os três cupons do exemplo da RN0036: 20 + 40 + 35 = 95. A espera é
    // pelo botão de remover: o código também aparece na lista de cupons
    // disponíveis, então procurá-lo solto casaria antes de ser aplicado.
    ['TROCA-A20', 'TROCA-B40', 'TROCA-C35'].forEach(codigo => {
      cy.get('#cupom').clear().type(codigo);
      cy.contains('button', 'Aplicar').click();
      cy.get(`button[aria-label="Remover cupom ${codigo}"]`).should('exist');
    });

    // Cobrem o total, então não há cartão a informar.
    cy.contains('Os cupons aplicados já cobrem o total').should('be.visible');
    cy.contains('Sobra de').should('be.visible');

    cy.intercept('POST', '**/pedidos').as('finalizar');
    cy.contains('button', 'Finalizar compra').click();

    // RN0036: a diferença volta ao cliente como um cupom de troca novo.
    cy.wait('@finalizar').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      expect(response?.body.cupomTrocoCodigo, 'cupom da diferença').to.be.a('string');
    });

    cy.contains('com a diferença').should('be.visible');
  });

  it('CT-07 · a compra finalizada nasce EM PROCESSAMENTO [RF0038]', () => {
    adicionarAoCarrinho(13);

    cy.visit('/carrinho');
    cy.contains('button', 'Finalizar compra').click();

    esperarFrete();
    cy.get('#cartao').select(1);
    cy.contains('button', 'Adicionar').click();

    cy.intercept('POST', '**/pedidos').as('finalizar');
    cy.contains('button', 'Finalizar compra').click();

    /*
     * A compra nasce EM PROCESSAMENTO e, na mesma requisição, a validação
     * do pagamento (RN0037/RN0038) já a move para APROVADA. O estado
     * inicial não sobra na resposta, mas fica registrado: é o primeiro
     * degrau do histórico do pedido, e é ele que prova a RF0038.
     */
    cy.wait('@finalizar')
      .then(({ response }) => {
        expect(response?.statusCode).to.eq(201);

        return response?.body.id as number;
      })
      .then(id => {
        cy.visit(`/meus-pedidos/${id}`);
      });

    cy.contains('li', 'Em processamento').should('be.visible');

    // E o registro guarda quando isso aconteceu, como a RNF0012 exige.
    cy.contains('li', 'Em processamento')
      .find('small')
      .invoke('text')
      .should('match', /\d{2}\/\d{2}\/\d{4}/);
  });
});
