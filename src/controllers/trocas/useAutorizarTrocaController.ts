/**
 * [CONTROLLER] useAutorizarTrocaController
 *
 * O QUE FAZ: conduz a autorização da troca pelo administrador.
 *
 * COMO FARÁ: `useMutation` sobre `autorizarTroca`, movendo o pedido de
 * EM_TROCA para TROCA_AUTORIZADA e invalidando ['trocas'] e ['pedidos'].
 * No `onSuccess`, gera a notificação ao cliente exigida pela RN0046 e
 * grava a operação no log.
 *
 * ATENDE: RF0042, RN0046, RNF0012
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { useAuth } from '@/hooks/useAuth';
import { pedidosService } from '@/service/pedidos/service';
import { trocasService } from '@/service/trocas/service';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useAutorizarTrocaController = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { registrar } = useLogTransacaoController();

  const { mutate: autorizarTroca, isPending } = useMutation({
    mutationFn: async (trocaId: number) => {
      const troca = await trocasService.autorizarTroca(trocaId);

      await pedidosService.marcarItensEmTroca(
        troca.pedidoId,
        troca.itens.map(i => i.produtoId),
        'TROCA_AUTORIZADA',
      );

      // Quando a troca cobre a compra inteira, o pedido acompanha.
      if (troca.trocaTotal) {
        await pedidosService.atualizarStatus(
          troca.pedidoId,
          'TROCA_AUTORIZADA',
          user?.id ?? 0,
        );
      }

      return troca;
    },
    onSuccess: troca => {
      registrar({
        entidade: 'Troca',
        entidadeId: troca.id,
        operacao: 'ALTERACAO',
        antes: { status: 'EM_TROCA' },
        depois: { status: troca.status },
      });

      queryClient.invalidateQueries({ queryKey: ['trocas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });

      handleSuccess(`Troca do pedido ${troca.pedidoNumero} autorizada.`);
      // RN0046: o cliente precisa ser notificado da autorização. O envio
      // é simulado, conforme as premissas do DRS.
      toast.info(
        `Notificação enviada a ${troca.clienteNome}: a troca do pedido ${troca.pedidoNumero} foi autorizada.`,
      );
    },
    onError: handleError,
  });

  return { autorizarTroca, isPending };
};
