/**
 * [MODEL] Service de trocas
 *
 * O QUE FAZ: conduz o ciclo da troca — solicitar, consultar, autorizar e
 * confirmar o recebimento.
 *
 * COMO FARÁ: cada função chama o endpoint correspondente. A emissão do
 * cupom, a reentrada no estoque e a notificação ao cliente acontecem no
 * servidor, junto com a mudança de status: são o mesmo ato.
 *
 * ATENDE: RF0041, RF0042, RF0043, RF0044, RN0041, RN0042, RN0043, RNF0046
 */

import { api } from '@/service/api/request';
import {
  PedidoTroca,
  ReceberTrocaPayload,
  SolicitarTrocaPayload,
  TrocaFiltros,
} from '@/types/trocas/types';

export const trocasService = {
  /** RF0043: a fila do administrador; para o cliente, o próprio histórico. */
  async fetchTrocas(filtros: TrocaFiltros = {}): Promise<PedidoTroca[]> {
    const params = new URLSearchParams();

    if (filtros.status) params.set('status', filtros.status);

    const query = params.toString();

    return api<PedidoTroca[]>(`/trocas${query ? `?${query}` : ''}`);
  },

  async fetchTrocaPorId(id: number): Promise<PedidoTroca> {
    return api<PedidoTroca>(`/trocas/${id}`);
  },

  async fetchTrocasPorPedido(pedidoId: number): Promise<PedidoTroca[]> {
    const todas = await this.fetchTrocas();

    return todas.filter(t => t.pedidoId === pedidoId);
  },

  /** RF0041 e RN0043: só compra ENTREGUE aceita solicitação. */
  async solicitarTroca(payload: SolicitarTrocaPayload): Promise<PedidoTroca> {
    return api<PedidoTroca>('/trocas', { method: 'POST', body: payload });
  },

  /** RF0042: autoriza e dispara a notificação ao cliente (RNF0046). */
  async autorizarTroca(id: number): Promise<PedidoTroca> {
    return api<PedidoTroca>(`/trocas/${id}/autorizar`, { method: 'PATCH' });
  },

  /**
   * RF0044 e RN0042: confirma o recebimento. O cupom é emitido e, se o
   * administrador mandar, os itens voltam ao estoque (RF0054).
   */
  async receberTroca({
    trocaId,
    retornarAoEstoque,
  }: ReceberTrocaPayload): Promise<PedidoTroca> {
    return api<PedidoTroca>(`/trocas/${trocaId}/receber`, {
      method: 'PATCH',
      body: { retornarAoEstoque },
    });
  },
};
