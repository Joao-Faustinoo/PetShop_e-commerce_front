/**
 * [CONTROLLER] useSituacaoProdutoController
 *
 * O QUE FAZ: conduz a inativação e a ativação de produtos, incluindo a
 * inativação automática.
 *
 * COMO FARÁ: duas `useMutation` — inativar e ativar — que exigem motivo e
 * justificativa no payload (RN0015 e RN0017) antes de chamar o service, e
 * invalidam ['produtos'] no sucesso. Expõe também
 * `avaliarInativacaoAutomatica`, que percorre os produtos sem estoque e
 * sem venda abaixo do parâmetro do sistema, inativando-os com o motivo
 * FORA DE LINHA fixado pela RN0016. Registra tudo no log.
 *
 * ATENDE: RF0012, RF0013, RF0016, RN0015, RN0016, RN0017, RNF0012
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { produtosService } from '@/service/produtos/service';
import {
  AtivarProdutoPayload,
  InativarProdutoPayload,
} from '@/types/produtos/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useSituacaoProdutoController = () => {
  const queryClient = useQueryClient();
  const { registrar } = useLogTransacaoController();

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ['produtos'] });

  const { mutate: inativar, isPending: inativando } = useMutation({
    // RN0015: motivo e justificativa vêm no payload, validados no modal.
    mutationFn: (payload: InativarProdutoPayload) =>
      produtosService.inativarProduto(payload),
    onSuccess: produto => {
      registrar({
        entidade: 'Produto',
        entidadeId: produto.id,
        operacao: 'ALTERACAO',
        antes: { ativo: true },
        depois: { ativo: false, motivoSituacaoId: produto.motivoSituacaoId },
      });
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
      registrar({
        entidade: 'Produto',
        entidadeId: produto.id,
        operacao: 'ALTERACAO',
        antes: { ativo: false },
        depois: { ativo: true, motivoSituacaoId: produto.motivoSituacaoId },
      });
      invalidar();
      handleSuccess(`Produto ${produto.sku} ativado.`);
    },
    onError: handleError,
  });

  /**
   * RF0013/RN0016: varre o catálogo e inativa como FORA DE LINHA os
   * produtos sem estoque cuja venda ficou abaixo do parâmetro do sistema.
   */
  const { mutate: avaliarInativacaoAutomatica, isPending: avaliando } =
    useMutation({
      mutationFn: () => produtosService.inativarAutomaticamente(),
      onSuccess: inativados => {
        inativados.forEach(produto =>
          registrar({
            entidade: 'Produto',
            entidadeId: produto.id,
            operacao: 'ALTERACAO',
            antes: { ativo: true },
            depois: {
              ativo: false,
              motivoSituacaoId: produto.motivoSituacaoId,
            },
          }),
        );
        invalidar();

        handleSuccess(
          inativados.length === 0
            ? 'Nenhum produto se enquadrou na inativação automática.'
            : `${inativados.length} produto(s) inativados automaticamente como FORA DE LINHA.`,
        );
      },
      onError: handleError,
    });

  return {
    inativar,
    ativar,
    avaliarInativacaoAutomatica,
    isPending: inativando || ativando || avaliando,
  };
};
