/**
 * [CONTROLLER] useSolicitarTrocaController
 *
 * O QUE FAZ: conduz a solicitação de troca feita pelo cliente a partir de
 * um pedido já entregue.
 *
 * COMO FARÁ: `useMutation` sobre `solicitarTroca`, invalidando ['pedidos']
 * e ['trocas']. Antes de enviar, recusa a solicitação se o pedido não
 * estiver ENTREGUE (RN0043). Aceita a troca de itens avulsos ou da compra
 * inteira; em ambos os casos o resultado nasce com status EM_TROCA
 * (RN0041).
 *
 * ATENDE: RF0041, RN0041, RN0043
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { trocasService } from '@/service/trocas/service';
import { SolicitarTrocaPayload } from '@/types/trocas/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useSolicitarTrocaController = () => {
  const queryClient = useQueryClient();

  const { mutate: solicitarTroca, isPending } = useMutation({
    mutationFn: async (payload: SolicitarTrocaPayload) => {
      if (!payload.motivo.trim()) {
        throw new Error('Descreva o motivo da troca.');
      }

      /**
       * RN0043: a API recusa pedido que não esteja ENTREGUE. RN0041: ela
       * registra a solicitação e leva a compra a EM TROCA no mesmo ato —
       * são partes do mesmo registro, e não chamadas separadas.
       */
      return trocasService.solicitarTroca(payload);
    },
    onSuccess: troca => {

      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['trocas'] });

      handleSuccess(
        `Solicitação de troca do pedido ${troca.pedidoNumero} registrada. Aguarde a autorização.`,
      );
    },
    onError: handleError,
  });

  return { solicitarTroca, isPending };
};
