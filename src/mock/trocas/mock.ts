/**
 * [MODEL] Mock de trocas
 *
 * O QUE FAZ: fornece os pedidos de troca abertos, para a tela de
 * visualização de trocas do administrador nascer com conteúdo.
 *
 * COMO FARÁ: exporta `mockTrocas` com registros em EM_TROCA (aguardando
 * autorização — RF0042/RF0043), TROCA_AUTORIZADA (aguardando recebimento
 * — RF0044) e TROCADO (já concluído, com o cupom de troca gerado pela
 * RF0045 referenciado).
 *
 * ATENDE: RF0041-RF0045, RN0041, RN0042
 */

import { mockPedidos } from '@/mock/pedidos/mock';
import { ItemTroca, PedidoTroca } from '@/types/trocas/types';

/** Monta os itens da troca a partir dos itens do pedido de origem. */
const itensDoPedido = (pedidoId: number, produtoIds: number[]): ItemTroca[] => {
  const pedido = mockPedidos.find(p => p.id === pedidoId)!;

  return pedido.itens
    .filter(i => produtoIds.includes(i.produtoId))
    .map(i => ({
      produtoId: i.produtoId,
      produtoNome: i.produtoNome,
      quantidade: i.quantidade,
      valorUnitario: i.valorUnitario,
      subtotal: i.subtotal,
    }));
};

const diasAtras = (dias: number): string => {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  data.setHours(14, 15, 0, 0);

  return data.toISOString();
};

interface SeedTroca {
  id: number;
  pedidoId: number;
  produtoIds: number[];
  motivo: string;
  status: PedidoTroca['status'];
  dataSolicitacao: string;
  retornouAoEstoque?: boolean;
  cupomGeradoId?: number;
  cupomGeradoCodigo?: string;
}

const seed: SeedTroca[] = [
  {
    // RF0042/RF0043: aguardando a autorização do administrador.
    id: 1,
    pedidoId: 11,
    produtoIds: [19],
    motivo:
      'O arranhador chegou com o poste de sisal solto na base do segundo nível.',
    status: 'EM_TROCA',
    dataSolicitacao: diasAtras(12),
  },
  {
    // RF0044: já autorizada, aguardando o recebimento dos itens.
    id: 2,
    pedidoId: 10,
    produtoIds: [3],
    motivo: 'Tamanho G ficou apertado no peito; preciso trocar por GG.',
    status: 'TROCA_AUTORIZADA',
    dataSolicitacao: diasAtras(28),
  },
  {
    // RF0045: concluída, com o cupom de troca já gerado e entregue.
    id: 3,
    pedidoId: 6,
    produtoIds: [10],
    motivo: 'Cama com costura aberta em uma das bordas.',
    status: 'TROCADO',
    dataSolicitacao: diasAtras(280),
    retornouAoEstoque: true,
    cupomGeradoId: 4,
    cupomGeradoCodigo: 'TROCA-D15',
  },
];

/** Mutável: o trocasService cria, autoriza e conclui trocas neste array. */
export const mockTrocas: PedidoTroca[] = seed.map(troca => {
  const pedido = mockPedidos.find(p => p.id === troca.pedidoId)!;
  const itens = itensDoPedido(troca.pedidoId, troca.produtoIds);

  return {
    id: troca.id,
    pedidoId: troca.pedidoId,
    pedidoNumero: pedido.numero,
    clienteId: pedido.clienteId,
    clienteNome: pedido.clienteNome,
    itens,
    motivo: troca.motivo,
    status: troca.status,
    dataSolicitacao: troca.dataSolicitacao,
    valorTotal: Number(
      itens.reduce((soma, i) => soma + i.subtotal, 0).toFixed(2),
    ),
    cupomGeradoId: troca.cupomGeradoId,
    cupomGeradoCodigo: troca.cupomGeradoCodigo,
    retornouAoEstoque: troca.retornouAoEstoque,
    // RN0041: a troca é total quando cobre todos os itens da compra.
    trocaTotal: itens.length === pedido.itens.length,
  };
});

export const proximoIdTroca = (): number =>
  mockTrocas.reduce((maior, t) => Math.max(maior, t.id), 0) + 1;
