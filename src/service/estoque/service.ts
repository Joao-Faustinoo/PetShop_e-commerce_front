/**
 * [MODEL] Service de estoque
 *
 * O QUE FAZ: expõe a posição de estoque e todas as suas movimentações.
 *
 * COMO FARÁ: `fetchItensEstoque(filtros)` devolve o saldo por produto
 * (disponível e bloqueado); `fetchMovimentacoes(produtoId)` devolve o
 * extrato; `registrarEntrada(payload)` grava produto, quantidade, valor
 * de custo, fornecedor e data de entrada (RN0050); `darBaixa(itens)` é
 * chamado quando a compra deixa de estar EM_PROCESSAMENTO (RN0028); e
 * `registrarReentrada(itens)` devolve ao saldo os itens de uma troca
 * recebida (RF0054).
 *
 * ATENDE: RF0051, RF0053, RF0054, RN0050
 */

import {
  mockItensEstoque,
  mockMovimentacoes,
  proximoIdMovimentacao,
} from '@/mock/estoque/mock';
import { mockProdutos } from '@/mock/produtos/mock';
import { delay, delayErro } from '@/service/api/delay';
import { calcularValorVenda } from '@/service/produtos/service';
import {
  EntradaEstoquePayload,
  EstoqueFiltros,
  ItemEstoque,
  MovimentacaoEstoque,
  TipoMovimentacao,
} from '@/types/estoque/types';

interface ItemMovimentado {
  produtoId: number;
  quantidade: number;
}

/** Garante que exista uma posição de estoque para o produto informado. */
const posicaoDe = (produtoId: number): ItemEstoque => {
  const existente = mockItensEstoque.find(i => i.produtoId === produtoId);

  if (existente) return existente;

  const produto = mockProdutos.find(p => p.id === produtoId)!;
  const nova: ItemEstoque = {
    produtoId,
    produtoNome: produto.nome,
    produtoSku: produto.sku,
    quantidadeDisponivel: produto.quantidadeEstoque,
    quantidadeBloqueada: 0,
    maiorValorCusto: produto.valorCusto,
  };

  mockItensEstoque.push(nova);

  return nova;
};

/**
 * O catálogo é a fonte da quantidade disponível: sincronizar na leitura
 * impede que a posição de estoque e a vitrine divirjam.
 */
const sincronizarComCatalogo = (): void => {
  mockProdutos.forEach(produto => {
    const posicao = posicaoDe(produto.id);
    posicao.quantidadeDisponivel = produto.quantidadeEstoque;
    posicao.produtoNome = produto.nome;
    posicao.produtoSku = produto.sku;
  });
};

const registrarMovimentacao = (
  tipo: TipoMovimentacao,
  produtoId: number,
  quantidade: number,
  valorCusto: number,
  usuarioId: number,
  extras: {
    fornecedorId?: number;
    dataEntrada?: string;
    observacao?: string;
  } = {},
): MovimentacaoEstoque => {
  const produto = mockProdutos.find(p => p.id === produtoId)!;

  const movimentacao: MovimentacaoEstoque = {
    id: proximoIdMovimentacao(),
    tipo,
    produtoId,
    produtoNome: produto.nome,
    quantidade,
    valorCusto,
    fornecedorId: extras.fornecedorId,
    dataEntrada: extras.dataEntrada ?? new Date().toISOString().slice(0, 10),
    usuarioId,
    observacao: extras.observacao,
  };

  mockMovimentacoes.push(movimentacao);

  return movimentacao;
};

export const estoqueService = {
  fetchItensEstoque(filtros: EstoqueFiltros = {}): Promise<ItemEstoque[]> {
    sincronizarComCatalogo();

    const resultado = mockItensEstoque.filter(item => {
      if (
        filtros.produtoNome &&
        !`${item.produtoNome} ${item.produtoSku}`
          .toLowerCase()
          .includes(filtros.produtoNome.trim().toLowerCase())
      ) {
        return false;
      }
      if (filtros.apenasSemEstoque && item.quantidadeDisponivel > 0) {
        return false;
      }

      return true;
    });

    return delay(resultado);
  },

  fetchMovimentacoes(produtoId?: number): Promise<MovimentacaoEstoque[]> {
    const resultado = mockMovimentacoes
      .filter(m => (produtoId ? m.produtoId === produtoId : true))
      .sort(
        (a, b) => b.dataEntrada.localeCompare(a.dataEntrada) || b.id - a.id,
      );

    return delay(resultado);
  },

  registrarEntrada(
    payload: EntradaEstoquePayload,
    usuarioId: number,
  ): Promise<MovimentacaoEstoque> {
    // RN0061: quantidade zero (ou negativa) não entra em estoque.
    if (!payload.quantidade || payload.quantidade <= 0) {
      return delayErro('A quantidade de itens deve ser maior que zero.');
    }
    // RN0062: todo item precisa de valor de custo.
    if (!payload.valorCusto || payload.valorCusto <= 0) {
      return delayErro('É obrigatório informar o valor de custo do item.');
    }
    // RNF0064: a data de entrada é obrigatória.
    if (!payload.dataEntrada) {
      return delayErro('É obrigatório informar a data de entrada dos itens.');
    }
    // RN0050: o fornecedor também é obrigatório.
    if (!payload.fornecedorId) {
      return delayErro('É obrigatório informar o fornecedor dos itens.');
    }

    const indice = mockProdutos.findIndex(p => p.id === payload.produtoId);

    if (indice < 0) {
      return delayErro('Produto não encontrado.');
    }

    const produto = mockProdutos[indice];
    const posicao = posicaoDe(produto.id);

    // RN0051: com custos diferentes, todos os itens passam a valer pelo
    // maior custo, recalculado sobre o grupo de precificação do produto.
    const maiorValorCusto = Math.max(
      posicao.maiorValorCusto,
      payload.valorCusto,
    );

    mockProdutos[indice] = {
      ...produto,
      quantidadeEstoque: produto.quantidadeEstoque + payload.quantidade,
      valorCusto: maiorValorCusto,
      valorVenda: calcularValorVenda(
        maiorValorCusto,
        produto.grupoPrecificacaoId,
      ),
    };

    posicao.maiorValorCusto = maiorValorCusto;
    posicao.quantidadeDisponivel = mockProdutos[indice].quantidadeEstoque;

    const movimentacao = registrarMovimentacao(
      'ENTRADA',
      payload.produtoId,
      payload.quantidade,
      payload.valorCusto,
      usuarioId,
      {
        fornecedorId: payload.fornecedorId,
        dataEntrada: payload.dataEntrada,
      },
    );

    return delay(movimentacao);
  },

  /** RF0053: baixa dos itens vendidos após a compra ser efetivada. */
  darBaixa(
    itens: ItemMovimentado[],
    usuarioId: number,
    observacao?: string,
  ): Promise<MovimentacaoEstoque[]> {
    const movimentacoes = itens.map(item => {
      const indice = mockProdutos.findIndex(p => p.id === item.produtoId);
      const produto = mockProdutos[indice];

      mockProdutos[indice] = {
        ...produto,
        quantidadeEstoque: Math.max(
          0,
          produto.quantidadeEstoque - item.quantidade,
        ),
        totalVendido: produto.totalVendido + item.quantidade,
      };

      const posicao = posicaoDe(item.produtoId);
      posicao.quantidadeDisponivel = mockProdutos[indice].quantidadeEstoque;
      posicao.quantidadeBloqueada = Math.max(
        0,
        posicao.quantidadeBloqueada - item.quantidade,
      );

      return registrarMovimentacao(
        'BAIXA',
        item.produtoId,
        item.quantidade,
        produto.valorCusto,
        usuarioId,
        { observacao },
      );
    });

    return delay(movimentacoes);
  },

  /** RF0054: reentrada dos itens devolvidos por uma troca recebida. */
  registrarReentrada(
    itens: ItemMovimentado[],
    usuarioId: number,
    observacao?: string,
  ): Promise<MovimentacaoEstoque[]> {
    const movimentacoes = itens.map(item => {
      const indice = mockProdutos.findIndex(p => p.id === item.produtoId);
      const produto = mockProdutos[indice];

      mockProdutos[indice] = {
        ...produto,
        quantidadeEstoque: produto.quantidadeEstoque + item.quantidade,
      };

      posicaoDe(item.produtoId).quantidadeDisponivel =
        mockProdutos[indice].quantidadeEstoque;

      return registrarMovimentacao(
        'REENTRADA',
        item.produtoId,
        item.quantidade,
        produto.valorCusto,
        usuarioId,
        { observacao },
      );
    });

    return delay(movimentacoes);
  },

  /** RN0044: reserva itens enquanto eles estão presos em um carrinho. */
  bloquearItens(itens: ItemMovimentado[]): void {
    itens.forEach(item => {
      const posicao = posicaoDe(item.produtoId);
      posicao.quantidadeBloqueada += item.quantidade;
    });
  },

  /** RN0045: devolve ao saldo livre os itens cujo bloqueio expirou. */
  desbloquearItens(itens: ItemMovimentado[]): void {
    itens.forEach(item => {
      const posicao = posicaoDe(item.produtoId);
      posicao.quantidadeBloqueada = Math.max(
        0,
        posicao.quantidadeBloqueada - item.quantidade,
      );
    });
  },
};
