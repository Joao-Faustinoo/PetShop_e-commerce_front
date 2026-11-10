/**
 * [TESTE] Análise gráfica do histórico de vendas por categoria
 *
 * O QUE FAZ: exercita o painel gerencial contra a API e o banco reais — o
 * filtro de período, a seleção de categorias, a comparação no gráfico de
 * linhas, o efeito de uma compra nova sobre os valores mensais, a
 * restrição de acesso ao administrador e o tempo de resposta da consulta.
 *
 * COMO FARÁ: dirige a tela como o administrador faria. Os números vêm da
 * resposta que a própria tela recebeu, nunca de um stub — o `cy.intercept`
 * só observa, com a única exceção de descartar o cabeçalho de requisição
 * condicional, explicada no `beforeEach`. Nenhum caso afirma valor
 * absoluto: a base acumula as compras dos outros specs, então o que se
 * prova é a DIFERENÇA entre duas consultas, com a compra feita entre
 * elas.
 *
 * As compras que servem de premissa são feitas pela API, com o token do
 * cliente, e não pela tela: a compra pela tela é o que o `pedidos.cy.ts`
 * demonstra, e repeti-la aqui só tornaria lento um teste que é sobre o
 * gráfico. As mudanças de situação do CT-06, ao contrário, passam pela
 * tela do administrador, porque é o que o cenário 6 do roteiro pede ver.
 *
 * SOBRE A RN0074: o DRS manda contabilizar as compras APROVADA, EM
 * TRANSPORTE e ENTREGUE — não só as entregues. O critério desta atividade
 * pede apenas ENTREGUE; o projeto mantém o texto do DRS, que é a única
 * referência, e a consequência está escrita no CT-06: a compra entra no
 * gráfico quando é aprovada, e seguir para EM TRANSPORTE e ENTREGUE
 * mantém o valor, não o acrescenta. O CT-05 demonstra o cenário 5 com uma
 * compra REPROVADA, que de fato fica fora da conta.
 *
 * EXIGE: API em localhost:3333 e front em localhost:3000, com o banco
 * populado pelo seed e pelo histórico (`npm run seed` e
 * `npm run seed:historico` na API). Cada execução cria 3 compras e 3
 * cartões marcados `CLIENTE ANALISE`: rode `npm run limpar:testes` na API
 * para repor a base.
 *
 * ATENDE: RF0055, RF0056, RF0057, RNF0011, RNF0043, RNF0044, RNF0045,
 * RNF0046, RN0071, RN0072, RN0073, RN0074
 */

/*
 * O `export` isola o escopo deste arquivo. Sem ele o TypeScript trata o
 * spec como script global, e uma constante de mesmo nome em outro spec
 * passa a colidir com esta.
 */
export {};

const API = 'http://localhost:3333/api';
const CHAVE_TOKEN = '@petshop: accessToken';

/** As credenciais do seed, as mesmas do atalho de demonstração da tela. */
const CLIENTE = { email: 'user.cliente@email.com', senha: '123@Pass' };

/** A marca que o `limpar:testes` procura para apagar o que este spec cria. */
const NOME_CARTAO = 'CLIENTE ANALISE';

/** RN0037: o cartão terminado em 0000 é sempre recusado pela operadora
 *  simulada — é o que permite produzir uma compra REPROVADA. */
const CARTAO_ACEITO = '5555666677771111';
const CARTAO_RECUSADO = '5555666677770000';

/**
 * Produto 2, "Camiseta Listrada Pet": R$ 35,00 e uma categoria só, Roupa.
 * A categoria única é o que importa — o rateio da RN0012 divide o subtotal
 * entre as categorias do produto, então um produto de duas categorias
 * entraria pela metade em cada linha e a conta do teste deixaria de ser
 * exata.
 */
const PRODUTO = { id: 2, categoria: 'Roupa', valorUnitario: 35 };

interface Ponto {
  periodo: string;
  valor: number;
}

interface Serie {
  categoriaId: number;
  nome: string;
  cor: string;
  pontos: Ponto[];
}

interface AnaliseVendas {
  series: Serie[];
  periodos: string[];
  total: number;
}

interface PedidoCriado {
  id: number;
  numero: string;
  status: string;
  subtotal: number;
}

/** O período MM/AAAA do mês corrente: é nele que as compras deste spec caem. */
const mesCorrente = (): string => {
  const hoje = new Date();

  return `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
};

/** Data em AAAA-MM-DD, `meses` meses atrás, no dia 1º. */
const inicioDeMesesAtras = (meses: number): string => {
  const data = new Date();

  data.setDate(1);
  data.setMonth(data.getMonth() - meses);

  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-01`;
};

const hojeISO = (): string => new Date().toISOString().slice(0, 10);

/** O valor de uma categoria em um período, dentro da resposta observada. */
const valorEm = (
  analise: AnaliseVendas,
  categoria: string,
  periodo: string,
): number => {
  const serie = analise.series.find(s => s.nome === categoria);

  if (!serie) throw new Error(`A resposta não traz a série "${categoria}".`);

  return serie.pontos.find(p => p.periodo === periodo)?.valor ?? 0;
};

/** Centavos somados em ponto flutuante acumulam resto; comparar arredondado. */
const reais = (valor: number): number => Math.round(valor * 100) / 100;

/**
 * Abre o painel e consome a consulta que a tela dispara sozinha, com o
 * filtro padrão dos últimos 12 meses. Sem consumi-la, o `cy.wait` seguinte
 * devolveria a resposta do filtro padrão em vez da do filtro aplicado.
 */
const abrirPainel = () => {
  cy.visit('/admin/analise');
  cy.wait('@analise');
  cy.contains('h1', 'Análise de vendas').should('be.visible');
};

/**
 * Preenche o modal de filtro e devolve a resposta da consulta que ele
 * dispara. O filtro pedido precisa ser diferente do que está valendo: o
 * React Query guarda a resposta por filtro e não vai à rede duas vezes
 * pelo mesmo recorte — por isso cada caso reabre o painel antes de medir
 * de novo, em vez de reaplicar o mesmo recorte.
 */
const aplicarFiltro = (
  categorias: string[],
  datas: { dataInicio: string; dataFim: string },
) => {
  cy.contains('button', 'Filtrar').click();

  cy.get('[role="dialog"]').within(() => {
    cy.get('#dataInicio').clear().type(datas.dataInicio);
    cy.get('#dataFim').clear().type(datas.dataFim);

    /*
     * Deixa marcadas exatamente as categorias pedidas. O `:has` é o que
     * separa as opções dos rótulos dos campos de data, que também são
     * `label` e não têm caixa dentro.
     */
    cy.get('label:has(input[type="checkbox"])').each(opcao => {
      const nome = opcao.text().trim();
      const marcar = categorias.includes(nome);

      cy.wrap(opcao)
        .find('input[type="checkbox"]')
        .then(caixa => {
          if (caixa.prop('checked') !== marcar) cy.wrap(caixa).click();
        });
    });

    cy.contains('button', 'Aplicar filtro').click();
  });

  return cy.wait('@analise').then(({ request, response }) => {
    // Quando o recorte sai inválido, a API responde erro e o corpo não tem
    // série nenhuma; sem este guarda o teste quebraria lá adiante, longe
    // da causa.
    expect(response!.body, `resposta de ${request.url}`).to.have.property(
      'periodos',
    );

    return response!.body as AnaliseVendas;
  });
};

/**
 * Faz uma compra pela API, com o token do cliente, e devolve o pedido. O
 * cartão é criado fora do perfil (`salvarNoPerfil: false`) para não mexer
 * nas telas de perfil que os outros specs conferem, e leva a marca que o
 * `limpar:testes` procura.
 */
const comprar = (
  quantidade: number,
  { recusado = false } = {},
): Cypress.Chainable<PedidoCriado> =>
  cy.request('POST', `${API}/auth/login`, CLIENTE).then(({ body: sessao }) => {
    const headers = { Authorization: `Bearer ${sessao.token}` };

    cy.request({
      method: 'DELETE',
      url: `${API}/carrinho`,
      headers,
      failOnStatusCode: false,
    });

    cy.request({
      method: 'POST',
      url: `${API}/carrinho/itens`,
      headers,
      body: { produtoId: PRODUTO.id, quantidade },
    });

    return cy
      .request({ method: 'GET', url: `${API}/enderecos?tipo=ENTREGA`, headers })
      .then(({ body: enderecos }) => {
        const enderecoEntregaId: number = (
          enderecos.find((e: { apelido: string }) => e.apelido === 'Casa') ??
          enderecos[0]
        ).id;

        return cy
          .request({
            method: 'POST',
            url: `${API}/cartoes`,
            headers,
            body: {
              numero: recusado ? CARTAO_RECUSADO : CARTAO_ACEITO,
              nomeImpresso: NOME_CARTAO,
              bandeiraId: 1,
              codigoSeguranca: '123',
              salvarNoPerfil: false,
            },
          })
          .then(({ body: cartao }) =>
            cy
              .request({
                method: 'GET',
                url: `${API}/carrinho/resumo?enderecoEntregaId=${enderecoEntregaId}`,
                headers,
              })
              .then(({ body: resumo }) =>
                cy
                  .request({
                    method: 'POST',
                    url: `${API}/pedidos`,
                    headers,
                    body: {
                      enderecoEntregaId,
                      pagamentos: [
                        {
                          forma: 'CARTAO',
                          valor: resumo.total,
                          cartaoId: cartao.id,
                        },
                      ],
                    },
                  })
                  .then(({ body: pedido }) => pedido as PedidoCriado),
              ),
          );
      });
  });

describe('Análise de vendas', () => {
  const ULTIMOS_12 = { dataInicio: inicioDeMesesAtras(11), dataFim: hojeISO() };

  beforeEach(() => {
    /*
     * O Express põe ETag em toda resposta JSON, então a segunda consulta
     * do mesmo recorte sai como requisição condicional e volta 304 sem
     * corpo: a tela recebe o corpo do cache do navegador e funciona, mas o
     * intercept não tem o que ler. Tirar o `if-none-match` da requisição
     * faz o servidor responder 200 com o corpo. Nada é stubado — a
     * resposta continua sendo a que o servidor calcular agora.
     */
    cy.intercept('GET', '**/analise/vendas*', requisicao => {
      delete requisicao.headers['if-none-match'];
      delete requisicao.headers['if-modified-since'];
    }).as('analise');

    cy.entrarComo('administrador');
  });

  it('CT-01 · uma categoria no período, com o valor mensal igual à soma das vendas da base [RF0055, RN0071, RN0074]', () => {
    abrirPainel();

    // O recorte de uma categoria só: a linha de Roupa, nos últimos 12 meses.
    aplicarFiltro([PRODUTO.categoria], ULTIMOS_12).then(antes => {
      expect(antes.series, 'uma categoria, uma série').to.have.length(1);

      // RN0071: o valor do mês é a soma das vendas daquele mês, e o total
      // do período é a soma dos meses — nada se perde no agrupamento.
      const somaDosMeses = reais(
        antes.series[0].pontos.reduce((acumulado, p) => acumulado + p.valor, 0),
      );

      expect(somaDosMeses, 'total = soma dos meses').to.eq(reais(antes.total));

      const valorAntes = valorEm(antes, PRODUTO.categoria, mesCorrente());

      // Duas unidades do produto 2: R$ 70,00 em itens. O frete fica fora,
      // porque a soma é feita sobre o subtotal dos itens vendidos.
      comprar(2).then(pedido => {
        expect(pedido.status, 'a compra entra contabilizável').to.eq('APROVADA');
        expect(reais(pedido.subtotal)).to.eq(2 * PRODUTO.valorUnitario);

        // A consulta seguinte: a tela recarrega e o recorte é refeito.
        abrirPainel();
        aplicarFiltro([PRODUTO.categoria], ULTIMOS_12).then(depois => {
          const valorDepois = valorEm(depois, PRODUTO.categoria, mesCorrente());

          expect(
            reais(valorDepois - valorAntes),
            'o mês cresceu exatamente o valor vendido',
          ).to.eq(reais(pedido.subtotal));

          expect(
            reais(depois.total - antes.total),
            'e o total do período cresceu o mesmo tanto',
          ).to.eq(reais(pedido.subtotal));
        });
      });
    });
  });

  it('CT-02 · comparação entre três categorias no mesmo período [RF0055, RF0057]', () => {
    const comparadas = ['Roupa', 'Brinquedo', 'Cama'];

    abrirPainel();

    aplicarFiltro(comparadas, ULTIMOS_12).then(analise => {
      /*
       * RF0057: uma série por categoria selecionada, comparáveis no mesmo
       * gráfico porque compartilham a mesma régua de períodos. A ordem é a
       * do servidor, que devolve as séries por nome de categoria — o que
       * importa é que estejam todas e só elas.
       */
      expect(analise.series.map(s => s.nome)).to.have.members(comparadas);

      analise.series.forEach(serie => {
        expect(serie.pontos.map(p => p.periodo), serie.nome).to.deep.eq(
          analise.periodos,
        );
      });

      // RNF0045: cada categoria com a sua cor, senão não há o que comparar.
      const cores = new Set(analise.series.map(s => s.cor));

      expect(cores.size, 'cores distintas').to.eq(comparadas.length);

      // O total exibido é a soma das três linhas.
      const soma = reais(
        analise.series.reduce(
          (acumulado, serie) =>
            acumulado + serie.pontos.reduce((s, p) => s + p.valor, 0),
          0,
        ),
      );

      expect(soma).to.eq(reais(analise.total));
    });

    // E o que a tela mostra do recorte: o indicador e a legenda do gráfico.
    cy.contains('Categorias comparadas')
      .parent()
      .should('contain', comparadas.length);

    cy.get('.recharts-legend-item-text').should($itens => {
      const nomes = $itens.toArray().map(item => item.textContent?.trim());

      expect(nomes).to.have.members(comparadas);
    });
  });

  it('CT-03 · resultado em gráfico de linhas, meses no eixo X e reais no eixo Y [RNF0043, RNF0044, RNF0045, RNF0046]', () => {
    const comparadas = ['Roupa', 'Coleira'];

    abrirPainel();
    aplicarFiltro(comparadas, ULTIMOS_12);

    // RNF0043: gráfico de linhas, uma linha por categoria.
    cy.get('.recharts-surface').should('be.visible');
    cy.get('.recharts-line').should('have.length', comparadas.length);

    // RNF0043: o eixo X agrupa por mês, no formato MM/AAAA.
    cy.get('.recharts-xAxis .recharts-cartesian-axis-tick-value')
      .should('have.length.at.least', 2)
      .each(marca => {
        expect(marca.text()).to.match(/^\d{2}\/\d{4}$/);
      });

    // RNF0044: o eixo Y em reais.
    cy.get('.recharts-yAxis .recharts-cartesian-axis-tick-value')
      .should('have.length.at.least', 2)
      .each(marca => {
        expect(marca.text()).to.contain('R$');
      });

    // RNF0045: legenda identificando a linha de cada categoria.
    cy.get('.recharts-legend-item-text').should($itens => {
      const nomes = $itens.toArray().map(item => item.textContent?.trim());

      expect(nomes).to.have.members(comparadas);
    });

    /*
     * RNF0046: o ponto sob o cursor mostra o valor exato. O recharts não
     * escuta o ponto, escuta a área do gráfico e descobre o ponto pela
     * coordenada — por isso o evento vai no wrapper, na posição de um dos
     * círculos da primeira linha.
     */
    cy.get('.recharts-line-dots circle')
      .eq(3)
      .then($ponto => {
        const area = $ponto[0].getBoundingClientRect();
        const x = area.left + area.width / 2;
        const y = area.top + area.height / 2;

        cy.get('.recharts-wrapper').trigger('mousemove', {
          clientX: x,
          clientY: y,
          pageX: x + window.scrollX,
          pageY: y + window.scrollY,
          force: true,
        });
      });

    cy.get('.recharts-tooltip-wrapper')
      .should('be.visible')
      .and('contain', 'R$')
      .and('contain', comparadas[0]);
  });

  it('CT-04 · alterar o período muda o resultado do gráfico [RF0055, RF0056, RN0072]', () => {
    abrirPainel();

    aplicarFiltro([PRODUTO.categoria], ULTIMOS_12).then(doze => {
      expect(doze.periodos, 'doze meses, doze pontos').to.have.length(12);

      // O mesmo recorte de categoria, outro período: outro resultado.
      aplicarFiltro([PRODUTO.categoria], {
        dataInicio: inicioDeMesesAtras(2),
        dataFim: hojeISO(),
      }).then(tres => {
        expect(tres.periodos, 'três meses, três pontos').to.have.length(3);
        expect(tres.periodos).to.deep.eq(doze.periodos.slice(-3));

        // RN0073: nenhum mês fica de fora — o zero entra como ponto.
        tres.series[0].pontos.forEach(ponto => {
          expect(ponto.valor, ponto.periodo).to.be.at.least(0);
        });

        // Um recorte menor não pode somar mais que o recorte que o contém.
        expect(reais(tres.total)).to.be.at.most(reais(doze.total));
      });
    });

    // A tela conta qual período está valendo.
    cy.contains('Evolução mensal por categoria').should('be.visible');

    // RF0056: data de fim anterior à de início não vira consulta.
    cy.contains('button', 'Filtrar').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('#dataInicio').clear().type(hojeISO());
      cy.get('#dataFim').clear().type(inicioDeMesesAtras(2));

      cy.contains('não pode ser anterior').should('be.visible');
      cy.contains('button', 'Aplicar filtro').should('be.disabled');

      // RN0072: e o intervalo maior que 24 meses também não.
      cy.get('#dataInicio').clear().type(inicioDeMesesAtras(30));
      cy.get('#dataFim').clear().type(hojeISO());

      cy.contains('entre 1 e 24 meses').should('be.visible');
      cy.contains('button', 'Aplicar filtro').should('be.disabled');
    });
  });

  it('CT-05 · compra com situação fora da RN0074 não é contabilizada [RN0074]', () => {
    abrirPainel();

    aplicarFiltro([PRODUTO.categoria], ULTIMOS_12).then(antes => {
      const valorAntes = valorEm(antes, PRODUTO.categoria, mesCorrente());

      /*
       * Uma compra REPROVADA: o cartão terminado em 0000 é recusado pela
       * operadora simulada (RN0037), e a RN0038 põe a compra em REPROVADA.
       * É o cenário 5 do roteiro — situação diferente de ENTREGUE que não
       * entra na conta. A RN0074 conta APROVADA, EM TRANSPORTE e ENTREGUE;
       * REPROVADA, EM PROCESSAMENTO e as situações de troca ficam fora.
       */
      comprar(1, { recusado: true }).then(pedido => {
        expect(pedido.status).to.eq('REPROVADA');

        abrirPainel();
        aplicarFiltro([PRODUTO.categoria], ULTIMOS_12).then(depois => {
          const valorDepois = valorEm(depois, PRODUTO.categoria, mesCorrente());

          expect(reais(valorDepois), 'o mês não se mexeu').to.eq(
            reais(valorAntes),
          );
          expect(reais(depois.total), 'nem o total do período').to.eq(
            reais(antes.total),
          );
        });
      });
    });
  });

  it('CT-06 · compra que chega a ENTREGUE no período aparece na consulta seguinte [RN0074, RF0038, RF0039]', () => {
    abrirPainel();

    aplicarFiltro([PRODUTO.categoria], ULTIMOS_12).then(antes => {
      const valorAntes = valorEm(antes, PRODUTO.categoria, mesCorrente());

      comprar(2).then(pedido => {
        expect(pedido.status).to.eq('APROVADA');

        /*
         * O cenário 6 do roteiro supõe o critério "só ENTREGUE conta", em
         * que a compra entraria no gráfico no momento da entrega. O projeto
         * segue a RN0074 do DRS, que conta também APROVADA e EM TRANSPORTE:
         * a compra entra ao ser aprovada, e as duas transições seguintes
         * mantêm o valor em vez de acrescentá-lo. O teste prova o que o
         * sistema faz — a compra que chega a ENTREGUE dentro do período
         * está no gráfico da consulta seguinte, e o valor é o mesmo nas
         * três situações contabilizáveis.
         */
        cy.intercept('PATCH', '**/pedidos/*/despachar').as('despachar');
        cy.intercept('PATCH', '**/pedidos/*/entregar').as('entregar');

        // RF0038/RN0039: o administrador despacha a compra aprovada.
        cy.visit('/admin/pedidos');
        cy.get('#status').select('APROVADA');

        cy.get(`input[aria-label="Selecionar ${pedido.numero}"]`)
          .parent()
          .within(() => {
            cy.contains('button', 'Despachar').click();
          });

        // O modal de confirmação é `alertdialog`; sem o escopo, o
        // `contains` acharia primeiro o botão da própria linha.
        cy.get('[role="alertdialog"]').contains('button', 'Despachar').click();
        cy.wait('@despachar').its('response.statusCode').should('eq', 200);

        // RF0039/RN0040: e confirma a entrega.
        cy.get('#status').select('EM_TRANSPORTE');
        cy.get(`input[aria-label="Selecionar ${pedido.numero}"]`)
          .parent()
          .within(() => {
            cy.contains('button', 'Confirmar entrega').click();
          });

        cy.get('[role="alertdialog"]').contains('button', 'Confirmar').click();
        cy.wait('@entregar').then(({ response }) => {
          expect(response!.body.status).to.eq('ENTREGUE');
        });

        // A consulta seguinte reflete a compra que agora está ENTREGUE.
        abrirPainel();
        aplicarFiltro([PRODUTO.categoria], ULTIMOS_12).then(depois => {
          const valorDepois = valorEm(depois, PRODUTO.categoria, mesCorrente());

          expect(
            reais(valorDepois - valorAntes),
            'a compra entregue está no gráfico, pelo valor dos itens',
          ).to.eq(reais(pedido.subtotal));
        });
      });
    });
  });

  it('CT-07 · o gráfico é do administrador e é negado ao cliente [RF0055]', () => {
    // O administrador entra e consulta.
    abrirPainel();
    aplicarFiltro([PRODUTO.categoria], ULTIMOS_12).then(analise => {
      expect(analise.series).to.have.length(1);
    });

    cy.get('.recharts-surface').should('be.visible');

    // O cliente não: a API recusa com 403, mesmo com um token válido.
    cy.request('POST', `${API}/auth/login`, CLIENTE).then(({ body }) => {
      cy.request({
        method: 'GET',
        url: `${API}/analise/vendas?dataInicio=${ULTIMOS_12.dataInicio}&dataFim=${ULTIMOS_12.dataFim}&categoriaIds=1`,
        headers: { Authorization: `Bearer ${body.token}` },
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 403);
    });

    // E a tela manda o cliente de volta para a loja. A sessão do
    // administrador sai antes, senão o atalho de login nem aparece.
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.entrarComo('cliente');
    cy.visit('/admin/analise');

    cy.location('pathname', { timeout: 10000 }).should('not.contain', 'admin');
    cy.contains('h1', 'Análise de vendas').should('not.exist');
  });

  it('CT-08 · a consulta responde em até 1 segundo [RNF0011]', () => {
    cy.window().then(janela => {
      const headers = {
        Authorization: `Bearer ${janela.localStorage.getItem(CHAVE_TOKEN)}`,
      };

      const consultar = (categoriaIds: string) =>
        cy.request({
          method: 'GET',
          url: `${API}/analise/vendas?dataInicio=${ULTIMOS_12.dataInicio}&dataFim=${ULTIMOS_12.dataFim}&categoriaIds=${categoriaIds}`,
          headers,
        });

      /*
       * A primeira consulta de todas paga a abertura da conexão com o
       * banco, que não é tempo de consulta: o requisito é sobre a resposta
       * em regime. Esta chamada de aquecimento é descartada, e as três
       * seguintes — recortes diferentes, para nenhuma vir de cache — são as
       * medidas.
       */
      consultar('1');

      const medidas: number[] = [];
      const recortes = ['1', '1,2', '1,2,3,4,5'];

      recortes.forEach(recorte => {
        cy.then(() => {
          const comecou = performance.now();

          return consultar(recorte).then(() => {
            medidas.push(performance.now() - comecou);
          });
        });
      });

      cy.then(() => {
        medidas.forEach((ms, indice) => {
          cy.log(`consulta ${recortes[indice]}: ${ms.toFixed(0)} ms`);
        });

        // RNF0011: no máximo 1 segundo por consulta.
        medidas.forEach((ms, indice) => {
          expect(ms, `consulta de ${recortes[indice]}`).to.be.lessThan(1000);
        });
      });
    });
  });
});
