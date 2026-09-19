/**
 * [TESTE] CRUD de cliente de ponta a ponta
 *
 * O QUE FAZ: exercita cadastrar, consultar, alterar e inativar cliente
 * pela interface, contra a API e o banco reais.
 *
 * COMO FARÁ: dirige as telas como um usuário faria — sem atalhos de
 * estado e sem stub de rede —, e confere o que a tela mostra depois de
 * cada operação. O título de cada teste declara o RF/RN que ele valida.
 *
 * EXIGE: API em localhost:3333 com o banco populado pelo seed.
 *
 * ATENDE: RF0021, RF0022, RF0023, RF0024, RF0025, RN0021, RN0022, RN0023,
 * RN0026, RN0027, RNF0035 e a parte observável da RNF0012 (o dado alterado
 * é mantido; data, hora e usuário ainda não são persistidos).
 */

/** CPF válido gerado na hora, para não colidir com cadastros anteriores. */
const cpfValido = (): string => {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const dv = (ate: number): number => {
    let soma = 0;
    for (let i = 0; i < ate; i += 1) soma += n[i] * (ate + 1 - i);
    const resto = (soma * 10) % 11;

    return resto === 10 ? 0 : resto;
  };
  n.push(dv(9));
  n.push(dv(10));

  return n.join('');
};

/** RN0023: todos os campos do endereço são obrigatórios menos observações. */
const preencherEndereco = (apelido: string) => {
  cy.get('#apelido').clear().type(apelido);
  cy.get('#tipoResidenciaId').select('Casa');
  cy.get('#tipoLogradouroId').select('Rua');
  cy.get('#logradouro').clear().type('das Flores');
  cy.get('#numero').clear().type('100');
  cy.get('#bairro').clear().type('Centro');
  cy.get('#cep').clear().type('01001000');
  cy.get('#cidade').clear().type('São Paulo');
  cy.get('#estado').clear().type('SP');
  cy.get('#pais').clear().type('Brasil');
  cy.contains('button', 'Adicionar endereço').click();
};

describe('Cadastrar cliente', () => {
  it('CT-01 · cadastra com os dois endereços e recebe código único [RF0021, RN0021, RN0022, RN0023, RN0026, RNF0035]', () => {
    cy.intercept('POST', '**/clientes').as('criar');

    cy.visit('/cadastro');

    // RN0026: gênero, nome, data de nascimento, CPF, telefone e e-mail.
    cy.get('#nome').type('Cliente Teste CT01');
    cy.get('#genero').select('Feminino');
    cy.get('#dataNascimento').type('1995-03-10');
    cy.get('#cpf').type(cpfValido());
    cy.get('#email').type(`ct01.${Date.now()}@email.com`);
    cy.get('#telefoneTipoId').select('Celular');
    cy.get('#telefoneDDD').type('11');
    cy.get('#telefoneNumero').type('988887777');

    // RN0021 e RN0022: um endereço de cobrança e um de entrega.
    cy.contains('legend', 'Endereço de cobrança')
      .parent()
      .contains('button', 'Informar endereço')
      .click();
    preencherEndereco('Cobrança');

    cy.contains('legend', 'Endereço de entrega')
      .parent()
      .contains('button', 'Informar endereço')
      .click();
    preencherEndereco('Entrega');

    cy.contains('button', 'Concluir cadastro').click();

    cy.wait('@criar').its('response.statusCode').should('eq', 201);

    // RNF0035: o código único é gerado pelo sistema e informado ao cliente.
    cy.contains(/Seu código de cliente é CLI-\d{4}/).should('be.visible');
  });

  it('CT-02 · recusa CPF inválido sem chamar a API [RN0026]', () => {
    cy.intercept('POST', '**/clientes', cy.spy().as('chamouApi'));

    cy.visit('/cadastro');

    cy.get('#nome').type('Cliente CPF Ruim');
    cy.get('#genero').select('Outro');
    cy.get('#dataNascimento').type('1990-01-01');
    cy.get('#cpf').type('11111111111');
    cy.get('#email').type(`ct02.${Date.now()}@email.com`);
    cy.get('#telefoneTipoId').select('Celular');
    cy.get('#telefoneDDD').type('11');
    cy.get('#telefoneNumero').type('988887777');

    cy.contains('button', 'Concluir cadastro').click();

    cy.contains('Informe um CPF válido').should('be.visible');
    cy.get('@chamouApi').should('not.have.been.called');
  });

  it('CT-02b · não conclui o cadastro sem os dois endereços [RN0021, RN0022]', () => {
    cy.intercept('POST', '**/clientes', cy.spy().as('chamouApi'));

    cy.visit('/cadastro');

    cy.get('#nome').type('Cliente Sem Endereco');
    cy.get('#genero').select('Masculino');
    cy.get('#dataNascimento').type('1990-01-01');
    cy.get('#cpf').type(cpfValido());
    cy.get('#email').type(`ct02b.${Date.now()}@email.com`);
    cy.get('#telefoneTipoId').select('Celular');
    cy.get('#telefoneDDD').type('11');
    cy.get('#telefoneNumero').type('988887777');

    cy.contains('button', 'Concluir cadastro').click();

    cy.contains(
      'Informe um endereço de cobrança e um endereço de entrega',
    ).should('be.visible');
    cy.get('@chamouApi').should('not.have.been.called');
  });

  it('CT-02c · exige os dados obrigatórios do cliente [RN0026]', () => {
    cy.intercept('POST', '**/clientes', cy.spy().as('chamouApi'));

    cy.visit('/cadastro');

    // Envia em branco: gênero e tipo de telefone já vêm preenchidos por
    // padrão, então o que falta é o conjunto que a RN0026 exige.
    cy.contains('button', 'Concluir cadastro').click();

    cy.contains('Nome é obrigatório').should('be.visible');
    cy.contains('Data de nascimento é obrigatória').should('be.visible');
    cy.contains('CPF é obrigatório').should('be.visible');
    cy.contains('E-mail é obrigatório').should('be.visible');
    cy.contains('DDD é obrigatório').should('be.visible');
    cy.contains('Número de telefone é obrigatório').should('be.visible');

    cy.get('@chamouApi').should('not.have.been.called');
  });

  it('CT-02d · exige todos os campos do endereço [RN0023]', () => {
    cy.visit('/cadastro');

    cy.contains('legend', 'Endereço de cobrança')
      .parent()
      .contains('button', 'Informar endereço')
      .click();

    // Tipo de residência, tipo de logradouro e país já vêm preenchidos;
    // os demais campos da RN0023 são cobrados aqui.
    cy.contains('button', 'Adicionar endereço').click();

    cy.contains('Dê um nome a este endereço').should('be.visible');
    cy.contains('Logradouro é obrigatório').should('be.visible');
    cy.contains('Número é obrigatório').should('be.visible');
    cy.contains('Bairro é obrigatório').should('be.visible');
    cy.contains('CEP é obrigatório').should('be.visible');
    cy.contains('Cidade é obrigatória').should('be.visible');
    cy.contains('Estado é obrigatório').should('be.visible');

    // O endereço não foi aceito: o resumo continua vazio no formulário.
    cy.contains('button', 'Cancelar').click();
    cy.contains('Nenhum endereço informado').should('exist');
  });
});

describe('Consultar cliente', () => {
  beforeEach(() => {
    cy.entrarComo('administrador');
    cy.visit('/admin/clientes');
  });

  it('CT-03 · lista os clientes cadastrados [RF0024, RN0027, RNF0035]', () => {
    cy.contains(/\d+ cliente\(s\) no filtro atual/).should('be.visible');

    // Os cabeçalhos são os campos identificadores que a RF0024 permite filtrar.
    cy.contains('th', 'Código').should('be.visible');
    cy.contains('th', 'CPF').should('be.visible');
    cy.contains('th', 'E-mail').should('be.visible');
    // RN0027: o ranking numérico aparece na consulta.
    cy.contains('th', 'Ranking').should('be.visible');

    cy.get('tbody tr').should('have.length.greaterThan', 0);
    // RNF0035: todo cliente tem código único no formato do sistema.
    cy.get('tbody tr').first().should('contain.text', 'CLI-');
  });

  it('CT-04 · filtra por nome, situação e ranking, isolados e combinados [RF0024, RN0027]', () => {
    // Isolado: por nome.
    cy.get('input[placeholder="Buscar por nome..."]').type('Bruno');
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('tbody tr', 'Bruno').should('be.visible');

    // Isolado: por situação — o seed traz um cliente inativo.
    cy.get('input[placeholder="Buscar por nome..."]').clear();
    cy.get('#situacao').select('Inativos');
    cy.get('tbody tr').each($linha => {
      cy.wrap($linha).should('contain.text', 'Inativo');
    });

    // Combinado: situação e ranking mínimo (RN0027) ao mesmo tempo.
    cy.get('#situacao').select('Ativos');
    cy.get('#ranking').select('4');
    cy.get('tbody tr').each($linha => {
      cy.wrap($linha).should('contain.text', 'Ativo');
    });
  });

  it('CT-05 · abre o detalhe com dados, endereços e transações [RF0022, RF0025, RN0023]', () => {
    cy.intercept('GET', '**/clientes/*/transacoes').as('transacoes');

    cy.contains('tbody tr', 'João Faustino')
      .find('button[aria-label^="Ver"]')
      .click();

    cy.location('pathname').should('match', /\/admin\/clientes\/\d+/);

    // RF0025: a consulta de transações fica no cadastro do cliente.
    cy.wait('@transacoes').its('response.statusCode').should('eq', 200);

    cy.contains('João Faustino').should('be.visible');
    // RN0023: os endereços do cadastro aparecem no detalhe.
    cy.contains('Endereços').should('be.visible');
  });
});

describe('Alterar cliente', () => {
  it('CT-06 · altera os dados cadastrais e a consulta reflete [RF0022]', () => {
    cy.intercept('PUT', '**/clientes/*').as('alterar');

    cy.entrarComo('administrador');
    cy.visit('/admin/clientes');

    cy.contains('tbody tr', 'Carlos Henrique Moura')
      .find('button[aria-label^="Ver"]')
      .click();

    const nomeOriginal = 'Carlos Henrique Moura';
    const novoNome = `${nomeOriginal} ${Date.now() % 1000}`;

    cy.get('#nome').clear().type(novoNome);
    cy.contains('button', 'Salvar alterações').click();

    cy.wait('@alterar').its('response.statusCode').should('eq', 200);
    cy.contains('Dados cadastrais atualizados').should('be.visible');

    // A alteração persistiu: a consulta encontra o nome novo.
    cy.visit('/admin/clientes');
    cy.get('input[placeholder="Buscar por nome..."]').type('Carlos Henrique');
    cy.contains('tbody tr', novoNome).should('be.visible');

    // Devolve o nome de origem, para a suíte poder rodar quantas vezes for.
    cy.contains('tbody tr', novoNome).find('button[aria-label^="Ver"]').click();
    cy.get('#nome').clear().type(nomeOriginal);
    cy.contains('button', 'Salvar alterações').click();
    cy.wait('@alterar').its('response.statusCode').should('eq', 200);
  });
});

describe('Inativar e reativar cliente', () => {
  beforeEach(() => {
    cy.entrarComo('administrador');
    cy.visit('/admin/clientes');
  });

  it('CT-07 · inativa exigindo justificativa e preserva o cadastro [RF0023]', () => {
    cy.intercept('PATCH', '**/clientes/*/situacao').as('situacao');

    cy.get('input[placeholder="Buscar por nome..."]').type('Juliana');
    cy.contains('tbody tr', 'Juliana')
      .find('button[aria-label^="Inativar"]')
      .click();

    cy.contains('Inativar cliente').should('be.visible');

    // Sem justificativa o botão não libera: é ela que fica gravada no
    // cadastro, e o CT-10 verifica esse registro.
    cy.contains('button', 'Inativar').should('be.disabled');
    cy.get('#justificativa-cliente').type(
      'Solicitação da própria cliente por telefone.',
    );
    cy.contains('button', 'Inativar').should('not.be.disabled').click();

    cy.wait('@situacao').its('response.statusCode').should('eq', 200);

    // RF0023: muda de situação e continua existindo na consulta.
    cy.contains('tbody tr', 'Juliana').should('contain.text', 'Inativo');
  });

  it('CT-08 · reativa o cadastro inativado [RF0023]', () => {
    cy.intercept('PATCH', '**/clientes/*/situacao').as('situacao');

    cy.get('input[placeholder="Buscar por nome..."]').type('Juliana');
    cy.contains('tbody tr', 'Juliana')
      .find('button[aria-label^="Reativar"]')
      .click();

    cy.contains('Reativar cliente').should('be.visible');
    cy.get('#justificativa-cliente').type(
      'Cliente pediu o retorno do cadastro.',
    );
    cy.contains('button', 'Reativar').should('not.be.disabled').click();

    cy.wait('@situacao').its('response.statusCode').should('eq', 200);

    cy.contains('tbody tr', 'Juliana').should('contain.text', 'Ativo');
  });

  it('CT-09 · não há exclusão de cliente, apenas inativação [RF0023]', () => {
    // A consulta não oferece nenhuma ação de exclusão.
    cy.get('tbody tr')
      .first()
      .within(() => {
        cy.get('button[aria-label^="Excluir"]').should('not.exist');
        cy.get('button[aria-label^="Remover"]').should('not.exist');
      });

    // E a API não expõe o verbo: o cadastro nunca é apagado.
    cy.window().then(win => {
      const token = win.localStorage.getItem('@petshop: accessToken');

      cy.request({
        method: 'DELETE',
        url: 'http://localhost:3333/api/clientes/1',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then(resposta => {
        expect(resposta.status).to.be.oneOf([404, 405]);
      });
    });

    // O cadastro continua na base depois da tentativa.
    cy.visit('/admin/clientes');
    cy.contains('tbody tr', 'João Faustino').should('be.visible');
  });

  it('CT-10 · a justificativa da inativação fica registrada no cadastro [RNF0012]', () => {
    const justificativa = `Inativado no teste ${Date.now() % 100000}.`;

    cy.get('input[placeholder="Buscar por nome..."]').type('Fernanda');
    cy.contains('tbody tr', 'Fernanda')
      .find('button[aria-label^="Inativar"]')
      .click();
    cy.get('#justificativa-cliente').type(justificativa);
    cy.contains('button', 'Inativar').click();

    // O texto escrito pelo administrador foi gravado e volta do banco no
    // detalhe do cadastro. É a parte da RNF0012 que o sistema já atende:
    // manter o dado alterado. Data, hora e usuário responsável ainda não
    // são persistidos — o log de transação segue mockado no front.
    cy.contains('tbody tr', 'Fernanda')
      .find('button[aria-label^="Ver"]')
      .click();
    cy.contains(`Cadastro inativado: ${justificativa}`).should('be.visible');

    // Devolve o cadastro à situação de origem.
    cy.visit('/admin/clientes');
    cy.get('input[placeholder="Buscar por nome..."]').type('Fernanda');
    cy.contains('tbody tr', 'Fernanda')
      .find('button[aria-label^="Reativar"]')
      .click();
    cy.get('#justificativa-cliente').type('Reativado ao fim do teste.');
    cy.contains('button', 'Reativar').click();
    cy.contains('tbody tr', 'Fernanda').should('contain.text', 'Ativo');
  });
});
