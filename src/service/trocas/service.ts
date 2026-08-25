/**
 * [MODEL] Service de trocas
 *
 * O QUE FAZ: expõe o ciclo completo do pedido de troca, da solicitação do
 * cliente ao recebimento confirmado pelo administrador.
 *
 * COMO FARÁ: `fetchTrocas(filtros)` lista para o admin todos os pedidos
 * em EM_TROCA e adiante (RF0043); `solicitarTroca(payload)` cria o
 * `PedidoTroca` em EM_TROCA (RF0041); `autorizarTroca(id)` move para
 * TROCA_AUTORIZADA (RF0042); `receberTroca({ trocaId, retornarAoEstoque })`
 * move para TROCADO, e é o ponto onde o controller decide disparar a
 * reentrada em estoque e a geração do cupom.
 *
 * ATENDE: RF0041-RF0045
 */

import { mockPedidos } from '@/mock/pedidos/mock';
import { mockTrocas, proximoIdTroca } from '@/mock/trocas/mock';
import { delay, delayErro } from '@/service/api/delay';
import {
  ItemTroca,
  PedidoTroca,
  ReceberTrocaPayload,
  SolicitarTrocaPayload,
  TrocaFiltros,
} from '@/types/trocas/types';

export const trocasService = {
  fetchTrocas(filtros: TrocaFiltros = {}): Promise<PedidoTroca[]> {
    const resultado = mockTrocas
      .filter(troca => {
        if (filtros.status && troca.status !== filtros.status) return false;
        if (filtros.clienteId && troca.clienteId !== filtros.clienteId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao));

    return delay(resultado);
  },

  fetchTrocaPorId(id: number): Promise<PedidoTroca> {
    const troca = mockTrocas.find(t => t.id === id);

    if (!troca) {
      return delayErro('Pedido de troca não encontrado.');
    }

    return delay(troca);
  },

  fetchTrocasPorPedido(pedidoId: number): Promise<PedidoTroca[]> {
    return delay(mockTrocas.filter(t => t.pedidoId === pedidoId));
  },

  /** RF0041/RN0041/RN0043: abre o pedido de troca em EM_TROCA. */
  solicitarTroca(payload: SolicitarTrocaPayload): Promise<PedidoTroca> {
    const pedido = mockPedidos.find(p => p.id === payload.pedidoId);

    if (!pedido) {
      return delayErro('Pedido não encontrado.');
    }

    // RN0043: só itens de pedidos ENTREGUE podem pedir troca.
    if (pedido.status !== 'ENTREGUE') {
      return delayErro(
        'Somente itens de pedidos com status ENTREGUE podem ser trocados.',
      );
    }

    if (payload.itens.length === 0) {
      return delayErro('Selecione ao menos um item para a troca.');
    }

    const itens: ItemTroca[] = payload.itens.map(selecionado => {
      const item = pedido.itens.find(
        i => i.produtoId === selecionado.produtoId,
      )!;

      return {
        produtoId: item.produtoId,
        produtoNome: item.produtoNome,
        quantidade: selecionado.quantidade,
        valorUnitario: item.valorUnitario,
        subtotal: Number(
          (item.valorUnitario * selecionado.quantidade).toFixed(2),
        ),
      };
    });

    const troca: PedidoTroca = {
      id: proximoIdTroca(),
      pedidoId: pedido.id,
      pedidoNumero: pedido.numero,
      clienteId: pedido.clienteId,
      clienteNome: pedido.clienteNome,
      itens,
      motivo: payload.motivo,
      status: 'EM_TROCA',
      dataSolicitacao: new Date().toISOString(),
      valorTotal: Number(
        itens.reduce((soma, i) => soma + i.subtotal, 0).toFixed(2),
      ),
      // RN0041: a troca é total quando cobre todos os itens da compra.
      trocaTotal: itens.length === pedido.itens.length,
    };

    mockTrocas.push(troca);

    return delay(troca);
  },

  /** RF0042: o administrador autoriza a troca. */
  autorizarTroca(id: number): Promise<PedidoTroca> {
    const indice = mockTrocas.findIndex(t => t.id === id);

    if (indice < 0) {
      return delayErro('Pedido de troca não encontrado.');
    }

    if (mockTrocas[indice].status !== 'EM_TROCA') {
      return delayErro(
        'Somente trocas com status EM TROCA podem ser autorizadas.',
      );
    }

    mockTrocas[indice] = { ...mockTrocas[indice], status: 'TROCA_AUTORIZADA' };

    return delay(mockTrocas[indice]);
  },

  /**
   * RF0044/RN0042: confirma o recebimento e passa para TROCADO, guardando
   * a decisão do administrador sobre o retorno ao estoque. A reentrada e
   * a geração do cupom são orquestradas pelo controller.
   */
  receberTroca({
    trocaId,
    retornarAoEstoque,
  }: ReceberTrocaPayload): Promise<PedidoTroca> {
    const indice = mockTrocas.findIndex(t => t.id === trocaId);

    if (indice < 0) {
      return delayErro('Pedido de troca não encontrado.');
    }

    if (mockTrocas[indice].status !== 'TROCA_AUTORIZADA') {
      return delayErro(
        'Somente trocas autorizadas podem ter o recebimento confirmado.',
      );
    }

    mockTrocas[indice] = {
      ...mockTrocas[indice],
      status: 'TROCADO',
      retornouAoEstoque: retornarAoEstoque,
    };

    return delay(mockTrocas[indice]);
  },

  /** RF0045: vincula à troca o cupom gerado para o cliente. */
  vincularCupom(
    trocaId: number,
    cupomId: number,
    codigo: string,
  ): Promise<PedidoTroca> {
    const indice = mockTrocas.findIndex(t => t.id === trocaId);

    if (indice < 0) {
      return delayErro('Pedido de troca não encontrado.');
    }

    mockTrocas[indice] = {
      ...mockTrocas[indice],
      cupomGeradoId: cupomId,
      cupomGeradoCodigo: codigo,
    };

    return delay(mockTrocas[indice], 100);
  },
};
