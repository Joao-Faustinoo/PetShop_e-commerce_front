/**
 * [MODEL] Tipos de troca
 *
 * O QUE FAZ: descreve o pedido de troca solicitado pelo cliente e o fluxo
 * de autorização/recebimento conduzido pelo administrador.
 *
 * COMO FARÁ: exporta `StatusTroca` (EM_TROCA, TROCA_AUTORIZADA, TROCADO),
 * `PedidoTroca` (id, pedidoId, itens solicitados, motivo, status,
 * dataSolicitacao e cupomGeradoId), `SolicitarTrocaPayload` (itens +
 * motivo) e `ReceberTrocaPayload` (trocaId + retornarAoEstoque: boolean,
 * o dado que a RF0044 exige do administrador).
 *
 * ATENDE: RF0041-RF0045, RN0041, RN0042, RN0043, RN0046
 */

export type StatusTroca = 'EM_TROCA' | 'TROCA_AUTORIZADA' | 'TROCADO';

export interface ItemTroca {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

export interface PedidoTroca {
  id: number;
  pedidoId: number;
  pedidoNumero: string;
  clienteId: number;
  clienteNome: string;
  itens: ItemTroca[];
  motivo: string;
  status: StatusTroca;
  dataSolicitacao: string;
  valorTotal: number;
  /** RF0045: cupom de troca gerado na confirmação de recebimento. */
  cupomGeradoId?: number;
  cupomGeradoCodigo?: string;
  /** RF0044: o admin informa se os itens voltam ao estoque. */
  retornouAoEstoque?: boolean;
  /** True quando a solicitação cobre a compra inteira (RN0041). */
  trocaTotal: boolean;
}

export interface SolicitarTrocaPayload {
  pedidoId: number;
  itens: { produtoId: number; quantidade: number }[];
  motivo: string;
}

export interface ReceberTrocaPayload {
  trocaId: number;
  /** RF0044: em caso positivo, dá-se entrada no estoque dos itens. */
  retornarAoEstoque: boolean;
}

export interface TrocaFiltros {
  status?: StatusTroca;
  clienteId?: number;
}
