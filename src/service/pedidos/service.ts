/**
 * [MODEL] Service de pedidos
 *
 * O QUE FAZ: expõe a consulta de pedidos, a finalização da compra e as
 * transições de status conduzidas pelo administrador.
 *
 * COMO FARÁ: `fetchPedidos(filtros)` filtra `mockPedidos` por status,
 * período e cliente; `fetchPedidoPorId(id)` devolve o detalhe;
 * `fetchPedidosPorCliente(clienteId)` alimenta a tela de meus pedidos.
 * `finalizarCompra(payload)` cria o pedido em EM_PROCESSAMENTO (RF0038).
 * `atualizarStatus(id, status)` é a única porta de mudança de status, e
 * registra o histórico com data/hora — insumo do log da RNF0012.
 *
 * ATENDE: RF0025, RF0033, RF0038, RF0039, RF0040
 */

import { mockClientes } from '@/mock/clientes/mock';
import { mockEnderecos } from '@/mock/enderecos/mock';
import { mockPedidos, proximoIdPedido } from '@/mock/pedidos/mock';
import { delay, delayErro } from '@/service/api/delay';
import { ItemCarrinho } from '@/types/carrinho/types';
import {
  FinalizarCompraPayload,
  ItemPedido,
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

const itemDoCarrinho = (item: ItemCarrinho): ItemPedido => ({
  produtoId: item.produto.id,
  produtoNome: item.produto.nome,
  produtoSku: item.produto.sku,
  categoriaIds: [...item.produto.categoriaIds],
  quantidade: item.quantidade,
  valorUnitario: item.valorUnitario,
  subtotal: item.subtotal,
});

export const pedidosService = {
  fetchPedidos(filtros: PedidoFiltros = {}): Promise<Pedido[]> {
    const resultado = mockPedidos
      .filter(pedido => {
        if (filtros.status && pedido.status !== filtros.status) return false;
        if (filtros.clienteId && pedido.clienteId !== filtros.clienteId) {
          return false;
        }
        if (
          filtros.numero &&
          !pedido.numero
            .toLowerCase()
            .includes(filtros.numero.trim().toLowerCase())
        ) {
          return false;
        }
        if (
          filtros.dataInicio &&
          pedido.dataCompra.slice(0, 10) < filtros.dataInicio
        ) {
          return false;
        }
        if (
          filtros.dataFim &&
          pedido.dataCompra.slice(0, 10) > filtros.dataFim
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.dataCompra.localeCompare(a.dataCompra));

    return delay(resultado);
  },

  fetchPedidoPorId(id: number): Promise<Pedido> {
    const pedido = mockPedidos.find(p => p.id === id);

    if (!pedido) {
      return delayErro('Pedido não encontrado.');
    }

    return delay(pedido);
  },

  fetchPedidosPorCliente(clienteId: number): Promise<Pedido[]> {
    return pedidosService.fetchPedidos({ clienteId });
  },

  /** RF0038: a compra nasce EM PROCESSAMENTO após endereço e pagamento. */
  finalizarCompra(
    payload: FinalizarCompraPayload,
    itens: ItemCarrinho[],
  ): Promise<Pedido> {
    if (itens.length === 0) {
      return delayErro('Não é possível finalizar uma compra sem itens.');
    }

    const cliente = mockClientes.find(c => c.id === payload.clienteId);
    const endereco = mockEnderecos.find(
      e => e.id === payload.enderecoEntregaId,
    );

    if (!cliente) return delayErro('Cliente não encontrado.');
    if (!endereco) return delayErro('Endereço de entrega não encontrado.');

    const itensPedido = itens.map(itemDoCarrinho);
    const subtotal = Number(
      itensPedido.reduce((soma, i) => soma + i.subtotal, 0).toFixed(2),
    );
    const id = proximoIdPedido();

    const pedido: Pedido = {
      id,
      numero: `PED-${String(id).padStart(4, '0')}`,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      itens: itensPedido,
      enderecoEntrega: endereco,
      pagamentos: payload.pagamentos,
      frete: payload.frete,
      subtotal,
      total: Number((subtotal + payload.frete).toFixed(2)),
      status: 'EM_PROCESSAMENTO',
      dataCompra: new Date().toISOString(),
      historico: [
        {
          status: 'EM_PROCESSAMENTO',
          dataHora: new Date().toISOString(),
          usuarioId: cliente.id,
        },
      ],
    };

    mockPedidos.push(pedido);

    return delay(pedido);
  },

  /**
   * Única porta de mudança de status: guarda o histórico com data/hora e
   * o usuário responsável, que é o insumo do log da RNF0012.
   */
  atualizarStatus(
    id: number,
    status: StatusPedido,
    usuarioId: number,
  ): Promise<Pedido> {
    const indice = mockPedidos.findIndex(p => p.id === id);

    if (indice < 0) {
      return delayErro('Pedido não encontrado.');
    }

    const pedido = mockPedidos[indice];

    mockPedidos[indice] = {
      ...pedido,
      status,
      historico: [
        ...pedido.historico,
        { status, dataHora: new Date().toISOString(), usuarioId },
      ],
    };

    return delay(mockPedidos[indice]);
  },

  /** RN0036: registra no pedido o cupom de troco gerado na finalização. */
  registrarCupomTroco(id: number, codigo: string): Promise<Pedido> {
    const indice = mockPedidos.findIndex(p => p.id === id);

    if (indice < 0) {
      return delayErro('Pedido não encontrado.');
    }

    mockPedidos[indice] = { ...mockPedidos[indice], cupomTrocoCodigo: codigo };

    return delay(mockPedidos[indice], 100);
  },

  /** Marca no pedido os itens que entraram em um pedido de troca. */
  marcarItensEmTroca(
    pedidoId: number,
    produtoIds: number[],
    statusTroca: ItemPedido['statusTroca'],
  ): Promise<Pedido> {
    const indice = mockPedidos.findIndex(p => p.id === pedidoId);

    if (indice < 0) {
      return delayErro('Pedido não encontrado.');
    }

    const pedido = mockPedidos[indice];

    mockPedidos[indice] = {
      ...pedido,
      itens: pedido.itens.map(item =>
        produtoIds.includes(item.produtoId)
          ? { ...item, statusTroca, quantidadeTrocada: item.quantidade }
          : item,
      ),
    };

    return delay(mockPedidos[indice], 100);
  },
};
