/**
 * [MODEL] Mock de pedidos
 *
 * O QUE FAZ: fornece o histórico de compras usado tanto pela tela de
 * meus pedidos do cliente quanto pela gestão de pedidos do admin.
 *
 * COMO FARÁ: exporta `mockPedidos` com pelo menos um pedido em cada
 * status do enum `StatusPedido`, para que os fluxos de despacho (RF0039),
 * entrega (RF0040) e solicitação de troca (RF0041, que só aceita ENTREGUE
 * pela RN0043) tenham dados válidos. As datas cobrem os últimos 24 meses
 * para servirem de base à análise gerencial.
 *
 * ATENDE: RF0025, RF0033, RF0038-RF0041, RN0043
 */

import { mockCartoes } from '@/mock/cartoes/mock';
import { mockClientes } from '@/mock/clientes/mock';
import { mockEnderecos } from '@/mock/enderecos/mock';
import { mockProdutos } from '@/mock/produtos/mock';
import { Endereco } from '@/types/enderecos/types';
import {
  HistoricoStatus,
  ItemPedido,
  Pagamento,
  Pedido,
  StatusPedido,
} from '@/types/pedidos/types';

/**
 * As datas são relativas ao momento em que a aplicação sobe, e não fixas,
 * para que a janela de 24 meses da análise gerencial (RN0072) sempre
 * encontre vendas, independentemente de quando o projeto for executado.
 */
const diasAtras = (dias: number): string => {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  data.setHours(10, 30, 0, 0);

  return data.toISOString();
};

const mesesAtras = (meses: number): string => diasAtras(Math.round(meses * 30));

const item = (produtoId: number, quantidade: number): ItemPedido => {
  const produto = mockProdutos.find(p => p.id === produtoId)!;

  return {
    produtoId: produto.id,
    produtoNome: produto.nome,
    produtoSku: produto.sku,
    categoriaIds: [...produto.categoriaIds],
    quantidade,
    valorUnitario: produto.valorVenda,
    subtotal: Number((produto.valorVenda * quantidade).toFixed(2)),
  };
};

const enderecoEntregaDe = (clienteId: number): Endereco =>
  mockEnderecos.find(e => e.clienteId === clienteId && e.tipo === 'ENTREGA')!;

const pagamentoCartao = (clienteId: number, valor: number): Pagamento => {
  const cartao = mockCartoes.find(
    c => c.clienteId === clienteId && c.preferencial,
  );

  return {
    forma: 'CARTAO',
    valor,
    cartaoId: cartao?.id,
    cartaoFinal: cartao?.numero.slice(-4),
  };
};

/**
 * Reconstrói a trilha de status por onde o pedido passou até chegar ao
 * estado atual, que é o que a tela de detalhe exibe como linha do tempo.
 */
const trilhaAte = (status: StatusPedido): StatusPedido[] => {
  const trilhas: Record<StatusPedido, StatusPedido[]> = {
    EM_PROCESSAMENTO: ['EM_PROCESSAMENTO'],
    APROVADA: ['EM_PROCESSAMENTO', 'APROVADA'],
    REPROVADA: ['EM_PROCESSAMENTO', 'REPROVADA'],
    EM_TRANSPORTE: ['EM_PROCESSAMENTO', 'APROVADA', 'EM_TRANSPORTE'],
    ENTREGUE: ['EM_PROCESSAMENTO', 'APROVADA', 'EM_TRANSPORTE', 'ENTREGUE'],
    EM_TROCA: [
      'EM_PROCESSAMENTO',
      'APROVADA',
      'EM_TRANSPORTE',
      'ENTREGUE',
      'EM_TROCA',
    ],
    TROCA_AUTORIZADA: [
      'EM_PROCESSAMENTO',
      'APROVADA',
      'EM_TRANSPORTE',
      'ENTREGUE',
      'EM_TROCA',
      'TROCA_AUTORIZADA',
    ],
    TROCADO: [
      'EM_PROCESSAMENTO',
      'APROVADA',
      'EM_TRANSPORTE',
      'ENTREGUE',
      'EM_TROCA',
      'TROCA_AUTORIZADA',
      'TROCADO',
    ],
  };

  return trilhas[status];
};

const historicoDe = (
  status: StatusPedido,
  dataCompra: string,
): HistoricoStatus[] => {
  const base = new Date(dataCompra).getTime();
  const umDia = 24 * 60 * 60 * 1000;

  return trilhaAte(status).map((etapa, indice) => ({
    status: etapa,
    dataHora: new Date(base + indice * 2 * umDia).toISOString(),
    // A primeira etapa é do próprio cliente; as demais, do administrador.
    usuarioId: indice === 0 ? 1 : 2,
  }));
};

interface SeedPedido {
  id: number;
  clienteId: number;
  itens: ItemPedido[];
  frete: number;
  status: StatusPedido;
  dataCompra: string;
  /** Cupons usados além do cartão, quando houver. */
  pagamentosExtras?: Pagamento[];
  cupomTrocoCodigo?: string;
}

const seed: SeedPedido[] = [
  {
    id: 1,
    clienteId: 1,
    itens: [item(2, 2), item(13, 1)],
    frete: 18.9,
    status: 'ENTREGUE',
    dataCompra: mesesAtras(22),
  },
  {
    id: 2,
    clienteId: 2,
    itens: [item(11, 3)],
    frete: 15.5,
    status: 'ENTREGUE',
    dataCompra: mesesAtras(20),
  },
  {
    id: 3,
    clienteId: 3,
    itens: [item(9, 1)],
    frete: 29.9,
    status: 'ENTREGUE',
    dataCompra: mesesAtras(18),
  },
  {
    id: 4,
    clienteId: 1,
    itens: [item(6, 1), item(8, 1)],
    frete: 22.4,
    status: 'ENTREGUE',
    dataCompra: mesesAtras(15),
  },
  {
    id: 5,
    clienteId: 5,
    itens: [item(5, 2)],
    frete: 19.8,
    status: 'ENTREGUE',
    dataCompra: mesesAtras(12),
  },
  {
    id: 6,
    clienteId: 4,
    itens: [item(10, 1)],
    frete: 34.5,
    status: 'TROCADO',
    dataCompra: mesesAtras(10),
  },
  {
    id: 7,
    clienteId: 1,
    itens: [item(12, 2), item(7, 1)],
    frete: 14.2,
    status: 'ENTREGUE',
    dataCompra: mesesAtras(8),
    pagamentosExtras: [
      { forma: 'CUPOM_PROMOCIONAL', valor: 10, cupomCodigo: 'BEMVINDO10' },
    ],
  },
  {
    id: 8,
    clienteId: 7,
    itens: [item(16, 1)],
    frete: 26.7,
    status: 'REPROVADA',
    dataCompra: mesesAtras(6),
  },
  {
    id: 9,
    clienteId: 1,
    itens: [item(18, 1), item(1, 1)],
    frete: 21.3,
    status: 'ENTREGUE',
    dataCompra: mesesAtras(4),
  },
  {
    id: 10,
    clienteId: 3,
    itens: [item(3, 1)],
    frete: 24.9,
    status: 'TROCA_AUTORIZADA',
    dataCompra: mesesAtras(3),
  },
  {
    id: 11,
    clienteId: 1,
    itens: [item(19, 1)],
    frete: 48.6,
    status: 'EM_TROCA',
    dataCompra: mesesAtras(2),
  },
  {
    id: 12,
    clienteId: 2,
    itens: [item(14, 1)],
    frete: 23.1,
    status: 'EM_TRANSPORTE',
    dataCompra: mesesAtras(1),
  },
  {
    id: 13,
    clienteId: 1,
    itens: [item(11, 2), item(13, 2)],
    frete: 16.4,
    status: 'APROVADA',
    dataCompra: diasAtras(15),
  },
  {
    id: 14,
    clienteId: 8,
    itens: [item(6, 1)],
    frete: 27.8,
    status: 'EM_PROCESSAMENTO',
    dataCompra: diasAtras(3),
  },
];

/** Mutável: o pedidosService finaliza compras e altera status neste array. */
export const mockPedidos: Pedido[] = seed.map(pedido => {
  const subtotal = Number(
    pedido.itens.reduce((soma, i) => soma + i.subtotal, 0).toFixed(2),
  );
  const total = Number((subtotal + pedido.frete).toFixed(2));
  const extras = pedido.pagamentosExtras ?? [];
  const valorEmCupons = extras.reduce((soma, p) => soma + p.valor, 0);
  const cliente = mockClientes.find(c => c.id === pedido.clienteId)!;

  return {
    id: pedido.id,
    numero: `PED-${String(pedido.id).padStart(4, '0')}`,
    clienteId: pedido.clienteId,
    clienteNome: cliente.nome,
    itens: pedido.itens,
    enderecoEntrega: enderecoEntregaDe(pedido.clienteId),
    pagamentos: [
      ...extras,
      pagamentoCartao(
        pedido.clienteId,
        Number((total - valorEmCupons).toFixed(2)),
      ),
    ],
    frete: pedido.frete,
    subtotal,
    total,
    status: pedido.status,
    dataCompra: pedido.dataCompra,
    historico: historicoDe(pedido.status, pedido.dataCompra),
    cupomTrocoCodigo: pedido.cupomTrocoCodigo,
  };
});

export const proximoIdPedido = (): number =>
  mockPedidos.reduce((maior, p) => Math.max(maior, p.id), 0) + 1;
