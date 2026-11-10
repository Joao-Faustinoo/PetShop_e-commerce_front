/**
 * [CONTROLLER] useSituacaoProdutoController
 *
 * O QUE FAZ: conduz a inativação e a ativação de produtos pelo
 * administrador.
 *
 * COMO FARÁ: duas `useMutation` — inativar e ativar — que exigem motivo e
 * justificativa no payload (RN0015 e RN0017) antes de chamar o service, e
 * invalidam ['produtos'] no sucesso.
 *
 * A inativação automática (RF0013) não passa por aqui: o servidor a aplica
 * sozinho quando o saldo do produto chega ao mínimo, ao fim da baixa da
 * venda, com o motivo FORA DE LINHA da RN0016. Não há o que disparar da
 * tela — uma ação manual para rodar uma regra automática seria uma
 * contradição.
 *
 * ATENDE: RF0012, RF0016, RN0015, RN0017
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { produtosService } from '@/service/produtos/service';
import {
  AtivarProdutoPayload,
  InativarProdutoPayload,
} from '@/types/produtos/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useSituacaoProdutoController = () => {
  const queryClient = useQueryClient();

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ['produtos'] });

  const { mutate: inativar, isPending: inativando } = useMutation({
    // RN0015: motivo e justificativa vêm no payload, validados no modal.
    mutationFn: (payload: InativarProdutoPayload) =>
      produtosService.inativarProduto(payload),
    onSuccess: produto => {
      invalidar();
      handleSuccess(`Produto ${produto.sku} inativado.`);
    },
    onError: handleError,
  });

  const { mutate: ativar, isPending: ativando } = useMutation({
    // RN0017: a ativação também exige motivo e justificativa.
    mutationFn: (payload: AtivarProdutoPayload) =>
      produtosService.ativarProduto(payload),
    onSuccess: produto => {
      invalidar();
      handleSuccess(`Produto ${produto.sku} ativado.`);
    },
    onError: handleError,
  });

  return {
    inativar,
    ativar,
    isPending: inativando || ativando,
  };
};
