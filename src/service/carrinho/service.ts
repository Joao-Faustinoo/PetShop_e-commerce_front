/**
 * [MODEL] Service de carrinho
 *
 * O QUE FAZ: expõe a manipulação do carrinho e o controle de bloqueio dos
 * itens.
 *
 * COMO FARÁ: `fetchCarrinho()`, `adicionarItem`, `alterarQuantidade` e
 * `removerItem` operam sobre `mockCarrinho`, recalculando subtotal e
 * total a cada operação. `fetchParametrosBloqueio()` devolve o tempo
 * limite parametrizado. `liberarItensExpirados()` varre o carrinho,
 * move para `itensRemovidos` tudo que passou do `bloqueadoAte` e devolve
 * a quantidade ao estoque. A decisão de *quando* chamar cada uma é do
 * controller — aqui só há acesso a dados.
 *
 * ATENDE: RF0031, RF0032, RN0044, RN0045, RNF0042
 */

import { mockCarrinho, mockParametrosBloqueio } from '@/mock/carrinho/mock';
import { mockProdutos } from '@/mock/produtos/mock';
import { delay, delayErro } from '@/service/api/delay';
import { estoqueService } from '@/service/estoque/service';
import {
  AdicionarItemPayload,
  AlertaDisponibilidade,
  AlterarQuantidadePayload,
  Carrinho,
  ItemCarrinho,
  ParametrosBloqueio,
} from '@/types/carrinho/types';

/** Estado do carrinho da sessão; parte da cópia inicial do mock. */
const carrinho: Carrinho = {
  itens: [...mockCarrinho.itens],
  itensRemovidos: [...mockCarrinho.itensRemovidos],
  subtotal: mockCarrinho.subtotal,
  total: mockCarrinho.total,
};

const recalcular = (): void => {
  carrinho.itens.forEach((item, indice) => {
    carrinho.itens[indice] = {
      ...item,
      subtotal: Number((item.valorUnitario * item.quantidade).toFixed(2)),
    };
  });

  carrinho.subtotal = Number(
    carrinho.itens.reduce((soma, i) => soma + i.subtotal, 0).toFixed(2),
  );
  carrinho.total = carrinho.subtotal;
};

/** RN0044: o bloqueio conta a partir da última inclusão no carrinho. */
const novoBloqueio = (): string =>
  new Date(
    Date.now() + mockParametrosBloqueio.minutosLimite * 60 * 1000,
  ).toISOString();

export const carrinhoService = {
  fetchCarrinho(): Promise<Carrinho> {
    return delay(carrinho);
  },

  fetchParametrosBloqueio(): Promise<ParametrosBloqueio> {
    return delay(mockParametrosBloqueio, 100);
  },

  adicionarItem({
    produtoId,
    quantidade,
  }: AdicionarItemPayload): Promise<Carrinho> {
    const produto = mockProdutos.find(p => p.id === produtoId);

    if (!produto) {
      return delayErro('Produto não encontrado.');
    }

    const existente = carrinho.itens.find(i => i.produto.id === produtoId);
    const quantidadeFinal = (existente?.quantidade ?? 0) + quantidade;

    // RN0031: não se adiciona ao carrinho mais do que existe em estoque.
    if (quantidadeFinal > produto.quantidadeEstoque) {
      return delayErro(
        produto.quantidadeEstoque === 0
          ? `"${produto.nome}" está sem estoque no momento.`
          : `Há apenas ${produto.quantidadeEstoque} unidade(s) de "${produto.nome}" em estoque.`,
      );
    }

    if (existente) {
      existente.quantidade = quantidadeFinal;
      existente.bloqueadoAte = novoBloqueio();
      existente.expirado = false;
    } else {
      carrinho.itens.push({
        produto,
        quantidade,
        valorUnitario: produto.valorVenda,
        subtotal: Number((produto.valorVenda * quantidade).toFixed(2)),
        bloqueadoAte: novoBloqueio(),
        expirado: false,
      });
    }

    // RN0044: o item fica reservado enquanto o bloqueio não expira.
    estoqueService.bloquearItens([{ produtoId, quantidade }]);
    recalcular();

    return delay(carrinho);
  },

  alterarQuantidade({
    produtoId,
    quantidade,
  }: AlterarQuantidadePayload): Promise<Carrinho> {
    const item = carrinho.itens.find(i => i.produto.id === produtoId);

    if (!item) {
      return delayErro('Item não encontrado no carrinho.');
    }

    if (quantidade <= 0) {
      return carrinhoService.removerItem(produtoId);
    }

    // RN0031: a quantidade editada também é validada contra o estoque.
    if (quantidade > item.produto.quantidadeEstoque) {
      return delayErro(
        `Há apenas ${item.produto.quantidadeEstoque} unidade(s) de "${item.produto.nome}" em estoque.`,
      );
    }

    const diferenca = quantidade - item.quantidade;
    item.quantidade = quantidade;
    // RN0044: mexer no item renova o prazo de bloqueio.
    item.bloqueadoAte = novoBloqueio();

    if (diferenca > 0) {
      estoqueService.bloquearItens([{ produtoId, quantidade: diferenca }]);
    } else if (diferenca < 0) {
      estoqueService.desbloquearItens([{ produtoId, quantidade: -diferenca }]);
    }

    recalcular();

    return delay(carrinho);
  },

  removerItem(produtoId: number): Promise<Carrinho> {
    const indice = carrinho.itens.findIndex(i => i.produto.id === produtoId);

    if (indice < 0) {
      return delayErro('Item não encontrado no carrinho.');
    }

    const [removido] = carrinho.itens.splice(indice, 1);
    estoqueService.desbloquearItens([
      { produtoId, quantidade: removido.quantidade },
    ]);
    recalcular();

    return delay(carrinho);
  },

  /**
   * RN0045/RNF0042: move para `itensRemovidos` tudo que passou do
   * `bloqueadoAte` e libera a reserva de estoque correspondente.
   */
  liberarItensExpirados(): Promise<Carrinho> {
    const agora = Date.now();
    const expirados = carrinho.itens.filter(
      item => new Date(item.bloqueadoAte).getTime() <= agora,
    );

    if (expirados.length === 0) {
      return delay(carrinho, 100);
    }

    carrinho.itens = carrinho.itens.filter(
      item => new Date(item.bloqueadoAte).getTime() > agora,
    );

    expirados.forEach(item => {
      carrinho.itensRemovidos.push({ ...item, expirado: true });
    });

    estoqueService.desbloquearItens(
      expirados.map(i => ({
        produtoId: i.produto.id,
        quantidade: i.quantidade,
      })),
    );
    recalcular();

    return delay(carrinho, 100);
  },

  /** RNF0042: devolve ao carrinho um item que havia expirado. */
  restaurarItemRemovido(produtoId: number): Promise<Carrinho> {
    const indice = carrinho.itensRemovidos.findIndex(
      i => i.produto.id === produtoId,
    );

    if (indice < 0) {
      return delayErro('Item não encontrado na lista de itens removidos.');
    }

    const [item] = carrinho.itensRemovidos.splice(indice, 1);

    return carrinhoService.adicionarItem({
      produtoId,
      quantidade: item.quantidade,
    });
  },

  /**
   * RN0032: relê o estoque na finalização, ajusta as quantidades que já
   * não cabem e remove o que ficou indisponível, devolvendo os alertas
   * que a tela precisa mostrar.
   */
  revalidarDisponibilidade(): Promise<{
    carrinho: Carrinho;
    alertas: AlertaDisponibilidade[];
  }> {
    const alertas: AlertaDisponibilidade[] = [];

    carrinho.itens = carrinho.itens.filter(item => {
      const atual = mockProdutos.find(p => p.id === item.produto.id);
      const disponivel = atual?.quantidadeEstoque ?? 0;

      if (disponivel === 0 || !atual?.ativo) {
        alertas.push({
          produtoId: item.produto.id,
          produtoNome: item.produto.nome,
          tipo: 'ITEM_REMOVIDO',
          quantidadeAnterior: item.quantidade,
          quantidadeAtual: 0,
        });

        return false;
      }

      if (item.quantidade > disponivel) {
        alertas.push({
          produtoId: item.produto.id,
          produtoNome: item.produto.nome,
          tipo: 'QUANTIDADE_AJUSTADA',
          quantidadeAnterior: item.quantidade,
          quantidadeAtual: disponivel,
        });

        item.quantidade = disponivel;
      }

      return true;
    });

    recalcular();

    return delay({ carrinho, alertas });
  },

  /** Chamado após a compra ser finalizada com sucesso. */
  limpar(): Promise<Carrinho> {
    carrinho.itens = [];
    carrinho.itensRemovidos = [];
    recalcular();

    return delay(carrinho, 100);
  },
};
