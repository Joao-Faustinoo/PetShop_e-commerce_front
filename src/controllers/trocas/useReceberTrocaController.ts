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

import { useMovimentacaoEstoqueController } from '@/controllers/estoque/useMovimentacaoEstoqueController';
import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { useAuth } from '@/hooks/useAuth';
import { cuponsService } from '@/service/cupons/service';
import { pedidosService } from '@/service/pedidos/service';
import { trocasService } from '@/service/trocas/service';
import { ReceberTrocaPayload } from '@/types/trocas/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useReceberTrocaController = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { registrar } = useLogTransacaoController();
  const { registrarReentrada } = useMovimentacaoEstoqueController();

  const { mutate: receberTroca, isPending } = useMutation({
    mutationFn: async (payload: ReceberTrocaPayload) => {
      // (1) RN0042: o recebimento leva o pedido de troca a TROCADO.
      const troca = await trocasService.receberTroca(payload);

      await pedidosService.marcarItensEmTroca(
        troca.pedidoId,
        troca.itens.map(i => i.produtoId),
        'TROCADO',
      );

      if (troca.trocaTotal) {
        await pedidosService.atualizarStatus(
          troca.pedidoId,
          'TROCADO',
          user?.id ?? 0,
        );
      }

      // (2) RF0044/RF0054: se o admin marcou, os itens voltam ao estoque.
      if (payload.retornarAoEstoque) {
        await registrarReentrada(
          troca.itens.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
          })),
          `Reentrada por troca do pedido ${troca.pedidoNumero}.`,
        );
      }

      // (3) RF0045: o cupom de troca no valor dos itens vai para o cliente.
      const cupom = await cuponsService.gerarCupomTroca(
        troca.valorTotal,
        troca.clienteId,
        troca.id,
      );

      await trocasService.vincularCupom(troca.id, cupom.id, cupom.codigo);

      return { troca, cupom };
    },
    onSuccess: ({ troca, cupom }) => {
      registrar({
        entidade: 'Troca',
        entidadeId: troca.id,
        operacao: 'ALTERACAO',
        antes: { status: 'TROCA_AUTORIZADA' },
        depois: { status: 'TROCADO', cupomGeradoCodigo: cupom.codigo },
      });

      queryClient.invalidateQueries({ queryKey: ['trocas'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });

      handleSuccess(
        `Troca concluída. Cupom ${cupom.codigo} de R$ ${cupom.valor.toFixed(
          2,
        )} disponibilizado a ${troca.clienteNome}.`,
      );
    },
    onError: handleError,
  });

  return { receberTroca, isPending };
};
