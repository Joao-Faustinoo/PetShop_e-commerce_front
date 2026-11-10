/**
 * [MODEL] Service de estoque
 *
 * O QUE FAZ: mostra a posição do estoque, o histórico de movimentações e
 * registra a entrada de itens.
 *
 * COMO FARÁ: chama a API. As regras saíram daqui: a RN0050, a RN0061 e a
 * RN0062 são conferidas no servidor, e o repreço pelo maior custo (RN0051)
 * acontece na mesma transação que grava o lote.
 *
 * A baixa e a reentrada deixaram de existir neste service. Elas não são
 * operações que a tela dispara: acontecem dentro da transação da compra
 * (RF0053) e do recebimento da troca (RF0054), no servidor, junto das
 * outras escritas que precisam valer ou falhar com elas.
 *
 * ATENDE: RF0051, RF0053, RF0054, RN0050, RN0051, RN0061, RN0062, RNF0064
 */

import { api } from '@/service/api/request';
import { Pagina } from '@/types/common/types';
import {
  EntradaEstoquePayload,
  EstoqueFiltros,
  ItemEstoque,
  MovimentacaoEstoque,
} from '@/types/estoque/types';

/** Só os filtros preenchidos entram na URL. */
const montarQuery = (filtros: EstoqueFiltros): string => {
  const params = new URLSearchParams();

  if (filtros.produtoNome) params.set('produtoNome', filtros.produtoNome.trim());
  if (filtros.apenasSemEstoque) params.set('apenasSemEstoque', 'true');

  return params.toString();
};

export const estoqueService = {
  fetchItensEstoque(filtros: EstoqueFiltros = {}): Promise<ItemEstoque[]> {
    return api<ItemEstoque[]>(`/estoque?${montarQuery(filtros)}`);
  },

  async fetchMovimentacoes(produtoId?: number): Promise<MovimentacaoEstoque[]> {
    const query = new URLSearchParams({ itensPorPagina: '100' });

    if (produtoId) query.set('produtoId', String(produtoId));

    const pagina = await api<Pagina<MovimentacaoEstoque>>(
      `/estoque/movimentacoes?${query.toString()}`,
    );

    return pagina.itens;
  },

  /** RF0051: quem registrou vem do token, não do corpo da requisição. */
  registrarEntrada(
    payload: EntradaEstoquePayload,
  ): Promise<MovimentacaoEstoque> {
    return api<MovimentacaoEstoque>('/estoque/entradas', {
      method: 'POST',
      body: payload,
    });
  },
};
