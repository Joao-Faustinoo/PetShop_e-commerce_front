/**
 * [CONTROLLER] useEntradaEstoqueController
 *
 * O QUE FAZ: conduz a entrada de itens em estoque.
 *
 * COMO FARÁ: `useMutation` sobre `registrarEntrada`, invalidando
 * ['estoque'] e ['produtos']. Antes de enviar, exige produto, quantidade,
 * valor de custo, fornecedor e data de entrada (RN0050), recusa
 * quantidade zero (RN0061), recusa valor de custo ausente (RN0062) e
 * recusa data de entrada em branco (RNF0064). Quando o produto já tem
 * itens com custo diferente, recalcula o valor de venda de todos pelo
 * maior custo, como manda a RN0051. Registra no log.
 *
 * ATENDE: RF0051, RF0052, RN0050, RN0051, RN0061, RN0062, RNF0064, RNF0012
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { useAuth } from '@/hooks/useAuth';
import { estoqueService } from '@/service/estoque/service';
import { EntradaEstoquePayload } from '@/types/estoque/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useEntradaEstoqueController = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { registrar } = useLogTransacaoController();

  const { mutate: registrarEntrada, isPending } = useMutation({
    // RN0050/RN0061/RN0062/RNF0064: o service recusa qualquer campo
    // obrigatório ausente e a mensagem sobe direto para o toast.
    mutationFn: (payload: EntradaEstoquePayload) =>
      estoqueService.registrarEntrada(payload, user?.id ?? 0),
    onSuccess: movimentacao => {
      registrar({
        entidade: 'Estoque',
        entidadeId: movimentacao.id,
        operacao: 'INSERCAO',
      });

      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      // RN0051: a entrada pode ter recalculado o valor de venda.
      queryClient.invalidateQueries({ queryKey: ['produtos'] });

      handleSuccess(
        `Entrada de ${movimentacao.quantidade} item(ns) de "${movimentacao.produtoNome}" registrada.`,
      );
    },
    onError: handleError,
  });

  return { registrarEntrada, isPending };
};
