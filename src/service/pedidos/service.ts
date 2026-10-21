/**
 * [MODEL] Service de pedidos
 *
 * O QUE FAZ: finaliza a compra, consulta pedidos e conduz as mudanças de
 * situação feitas pelo administrador.
 *
 * COMO FARÁ: `finalizarCompra` é UMA chamada. Validar o pagamento, decidir
 * entre APROVADA e REPROVADA, dar baixa no estoque, consumir os cupons,
 * emitir o troco e esvaziar o carrinho acontecem no servidor, dentro de
 * uma transação. Como várias chamadas, uma falha no meio deixaria pedido
 * criado, cupom gasto e estoque intacto.
 *
 * ATENDE: RF0033, RF0038, RF0039, RF0040, RN0037, RN0038
 */

import { api } from '@/service/api/request';
import { Pagina } from '@/types/common/types';
import {
  FinalizarCompraPayload,
  Pedido,
  PedidoFiltros,
  StatusPedido,
} from '@/types/pedidos/types';

/** RN0074: status que contam como venda efetivada na análise gerencial. */
export const STATUS_VENDA_EFETIVADA: StatusPedido[] = [
  'APROVADA',
  'EM_TRANSPORTE',
  'ENTREGUE',
  'EM_TROCA',
  'TROCA_AUTORIZADA',
  'TROCADO',
];

/** Só os filtros preenchidos entram na URL. */
const montarQuery = (filtros: PedidoFiltros): string => {
  const params = new URLSearchParams();

  if (filtros.status) params.set('status', filtros.status);
  if (filtros.clienteId) params.set('clienteId', String(filtros.clienteId));
  if (filtros.numero) params.set('numero', filtros.numero.trim());
  if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio);
  if (filtros.dataFim) params.set('dataFim', filtros.dataFim);
  params.set('itensPorPagina', '100');

  return params.toString();
};

export const pedidosService = {
  /** RF0033: o admin recebe todos; o cliente, apenas as próprias compras. */
  async fetchPedidos(filtros: PedidoFiltros = {}): Promise<Pedido[]> {
    const pagina = await api<Pagina<Pedido>>(
      `/pedidos?${montarQuery(filtros)}`,
    );

    return pagina.itens;
  },

  async fetchPedidoPorId(id: number): Promise<Pedido> {
    return api<Pedido>(`/pedidos/${id}`);
  },

  async fetchPedidosPorCliente(clienteId: number): Promise<Pedido[]> {
    return this.fetchPedidos({ clienteId });
  },

  /**
   * RF0038: fecha a compra a partir do carrinho. O pedido volta já com a
   * situação decidida pela validação do pagamento (RN0038).
   */
  async finalizarCompra(payload: FinalizarCompraPayload): Promise<Pedido> {
    return api<Pedido>('/pedidos', { method: 'POST', body: payload });
  },

  /** RF0039 e RF0040: as duas mudanças que são do administrador. */
  async atualizarStatus(id: number, status: StatusPedido): Promise<Pedido> {
    if (status === 'EM_TRANSPORTE') {
      return api<Pedido>(`/pedidos/${id}/despachar`, { method: 'PATCH' });
    }

    if (status === 'ENTREGUE') {
      return api<Pedido>(`/pedidos/${id}/entregar`, { method: 'PATCH' });
    }

    // Os demais status são do sistema ou do ciclo de troca, e mudam por
    // lá: não há rota para forçá-los de fora.
    throw new Error(
      'Só o despacho e a confirmação de entrega são feitos pelo administrador.',
    );
  },
};
