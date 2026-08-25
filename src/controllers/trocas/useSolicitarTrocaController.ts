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

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { useAuth } from '@/hooks/useAuth';
import { pedidosService } from '@/service/pedidos/service';
import { trocasService } from '@/service/trocas/service';
import { SolicitarTrocaPayload } from '@/types/trocas/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useSolicitarTrocaController = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { registrar } = useLogTransacaoController();

  const { mutate: solicitarTroca, isPending } = useMutation({
    mutationFn: async (payload: SolicitarTrocaPayload) => {
      if (!payload.motivo.trim()) {
        throw new Error('Descreva o motivo da troca.');
      }

      // RN0043: o service recusa pedido que não esteja ENTREGUE.
      const troca = await trocasService.solicitarTroca(payload);

      // RN0041: os itens ficam marcados como EM_TROCA no pedido; se a
      // troca cobre a compra inteira, o próprio pedido muda de status.
      await pedidosService.marcarItensEmTroca(
        payload.pedidoId,
        payload.itens.map(i => i.produtoId),
        'EM_TROCA',
      );

      if (troca.trocaTotal) {
        await pedidosService.atualizarStatus(
          payload.pedidoId,
          'EM_TROCA',
          user?.id ?? 0,
        );
      }

      return troca;
    },
    onSuccess: troca => {
      registrar({
        entidade: 'Troca',
        entidadeId: troca.id,
        operacao: 'INSERCAO',
      });

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
