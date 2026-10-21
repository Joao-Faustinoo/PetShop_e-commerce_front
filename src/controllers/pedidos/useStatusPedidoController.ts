/**
 * [CONTROLLER] useStatusPedidoController
 *
 * O QUE FAZ: conduz as transições de status do pedido feitas pelo
 * administrador.
 *
 * COMO FARÁ: `useMutation` de `despachar` (APROVADA para EM_TRANSPORTE,
 * RF0039/RN0039) e de `confirmarEntrega` (EM_TRANSPORTE para ENTREGUE,
 * RF0040/RN0040), ambas invalidando ['pedidos']. Recusa qualquer
 * transição que não parta do status esperado, mantendo a máquina de
 * estados íntegra em um único lugar. Registra cada mudança no log.
 *
 * ATENDE: RF0039, RF0040, RN0039, RN0040, RNF0012
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { pedidosService } from '@/service/pedidos/service';
import { Pedido, ROTULO_STATUS, StatusPedido } from '@/types/pedidos/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useStatusPedidoController = () => {
  const queryClient = useQueryClient();
  const { registrar } = useLogTransacaoController();

  /**
   * Toda transição passa por aqui: confere o status de origem antes de
   * mudar, para a máquina de estados não ser furada por nenhuma tela.
   */
  const transicionar = async (
    pedido: Pedido,
    origem: StatusPedido,
    destino: StatusPedido,
  ) => {
    if (pedido.status !== origem) {
      throw new Error(
        `O pedido ${pedido.numero} está como "${
          ROTULO_STATUS[pedido.status]
        }" e não pode ir para "${ROTULO_STATUS[destino]}".`,
      );
    }

    return pedidosService.atualizarStatus(pedido.id, destino);
  };

  const aoConcluir = (pedido: Pedido, anterior: StatusPedido) => {
    registrar({
      entidade: 'Pedido',
      entidadeId: pedido.id,
      operacao: 'ALTERACAO',
      antes: { status: anterior },
      depois: { status: pedido.status },
    });

    queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    handleSuccess(
      `Pedido ${pedido.numero} atualizado para "${
        ROTULO_STATUS[pedido.status]
      }".`,
    );
  };

  // RF0039/RN0039: aprovada passa a em transporte ao ser despachada.
  const { mutate: despachar, isPending: despachando } = useMutation({
    mutationFn: (pedido: Pedido) =>
      transicionar(pedido, 'APROVADA', 'EM_TRANSPORTE'),
    onSuccess: pedido => aoConcluir(pedido, 'APROVADA'),
    onError: handleError,
  });

  // RF0040/RN0040: em transporte passa a entregue na confirmação.
  const { mutate: confirmarEntrega, isPending: confirmando } = useMutation({
    mutationFn: (pedido: Pedido) =>
      transicionar(pedido, 'EM_TRANSPORTE', 'ENTREGUE'),
    onSuccess: pedido => aoConcluir(pedido, 'EM_TRANSPORTE'),
    onError: handleError,
  });

  return {
    despachar,
    confirmarEntrega,
    isPending: despachando || confirmando,
  };
};
