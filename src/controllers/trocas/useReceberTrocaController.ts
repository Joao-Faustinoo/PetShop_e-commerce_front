/**
 * [CONTROLLER] useReceberTrocaController
 *
 * O QUE FAZ: conduz a confirmação de recebimento dos itens da troca, que
 * é o ponto onde três efeitos acontecem juntos.
 *
 * COMO FARÁ: `useMutation` sobre `receberTroca` recebendo o
 * `retornarAoEstoque` que a RF0044 obriga o administrador a informar.
 * No `onSuccess`, encadeia: (1) muda o status para TROCADO (RN0042);
 * (2) se o admin marcou o retorno, chama a reentrada em estoque
 * (RF0054); (3) gera o cupom de troca no valor dos itens e o
 * disponibiliza ao cliente (RF0045). Invalida ['trocas'], ['estoque'] e
 * ['cupons'].
 *
 * ATENDE: RF0044, RF0045, RF0054, RN0042
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { trocasService } from '@/service/trocas/service';
import { ReceberTrocaPayload } from '@/types/trocas/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useReceberTrocaController = () => {
  const queryClient = useQueryClient();

  const { mutate: receberTroca, isPending } = useMutation({
    mutationFn: async (payload: ReceberTrocaPayload) => {
      /**
       * RN0042, RF0044 e RF0054: o recebimento leva a troca e a compra a
       * TROCADO, emite o cupom no valor dos itens e, se o administrador
       * marcou, devolve o produto ao estoque. Tudo na mesma transação do
       * servidor: o cupom não existe sem a troca ter sido recebida.
       */
      const troca = await trocasService.receberTroca(payload);

      return troca;
    },
    onSuccess: troca => {

      queryClient.invalidateQueries({ queryKey: ['trocas'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });

      handleSuccess(
        `Troca concluída. Cupom ${
          troca.cupomGeradoCodigo
        } de R$ ${troca.valorTotal.toFixed(2)} disponibilizado a ${
          troca.clienteNome
        }.`,
      );
    },
    onError: handleError,
  });

  return { receberTroca, isPending };
};
