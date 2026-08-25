/**
 * [MODEL] Tipos de pedido/compra
 *
 * O QUE FAZ: descreve a compra finalizada e é a fonte única do enum de
 * status que atravessa todo o fluxo de vendas e trocas.
 *
 * COMO FARÁ: exporta `StatusPedido` com os oito estados do DRS —
 * EM_PROCESSAMENTO, APROVADA, REPROVADA, EM_TRANSPORTE, ENTREGUE,
 * EM_TROCA, TROCA_AUTORIZADA e TROCADO —, mais `ItemPedido` (produto,
 * quantidade, valorUnitario, subtotal e status de troca do item), `Pedido`
 * (numero, clienteId, itens, enderecoEntrega, pagamentos, frete, total,
 * status, dataCompra e histórico de status) e `PedidoFiltros` (status,
 * período, cliente).
 *
 * ATENDE: RF0033, RF0038-RF0040, RF0025, RN0038-RN0040
 */

import { Endereco } from '@/types/enderecos/types';

export type StatusPedido =
  | 'EM_PROCESSAMENTO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'EM_TRANSPORTE'
  | 'ENTREGUE'
  | 'EM_TROCA'
  | 'TROCA_AUTORIZADA'
  | 'TROCADO';

/** Rótulos em pt-BR para exibição no StatusBadge e nos selects. */
export const ROTULO_STATUS: Record<StatusPedido, string> = {
  EM_PROCESSAMENTO: 'Em processamento',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  EM_TRANSPORTE: 'Em transporte',
  ENTREGUE: 'Entregue',
  EM_TROCA: 'Em troca',
  TROCA_AUTORIZADA: 'Troca autorizada',
  TROCADO: 'Trocado',
};

export type FormaPagamento = 'CARTAO' | 'CUPOM_TROCA' | 'CUPOM_PROMOCIONAL';

export interface Pagamento {
  forma: FormaPagamento;
  valor: number;
  /** Preenchido quando a forma é CARTAO. */
  cartaoId?: number;
  cartaoFinal?: string;
  /** Preenchido quando a forma é um dos tipos de cupom. */
  cupomCodigo?: string;
}

export interface ItemPedido {
  produtoId: number;
  /** Snapshot no momento da compra: o produto pode mudar depois. */
  produtoNome: string;
  produtoSku: string;
  categoriaIds: number[];
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  /** Preenchido quando o item entra em um pedido de troca (RF0041). */
  statusTroca?: 'EM_TROCA' | 'TROCA_AUTORIZADA' | 'TROCADO';
  quantidadeTrocada?: number;
}

export interface HistoricoStatus {
  status: StatusPedido;
  dataHora: string;
  usuarioId: number;
}

export interface Pedido {
  id: number;
  numero: string;
  clienteId: number;
  clienteNome: string;
  itens: ItemPedido[];
  enderecoEntrega: Endereco;
  pagamentos: Pagamento[];
  frete: number;
  subtotal: number;
  total: number;
  status: StatusPedido;
  dataCompra: string;
  historico: HistoricoStatus[];
  /** RN0036: cupom de troco gerado quando os cupons superam a compra. */
  cupomTrocoCodigo?: string;
}

export interface PedidoFiltros {
  status?: StatusPedido;
  clienteId?: number;
  numero?: string;
  dataInicio?: string;
  dataFim?: string;
}

/** RF0033/RF0038: dados enviados na finalização da compra. */
export interface FinalizarCompraPayload {
  clienteId: number;
  enderecoEntregaId: number;
  frete: number;
  pagamentos: Pagamento[];
}
