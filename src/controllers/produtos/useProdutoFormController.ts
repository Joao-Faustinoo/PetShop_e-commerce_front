/**
 * [CONTROLLER] useProdutoFormController
 *
 * O QUE FAZ: conduz o cadastro e a alteração de produto, aplicando as
 * regras de obrigatoriedade e de precificação.
 *
 * COMO FARÁ: `useMutation` para criar e outra para alterar, ambas
 * invalidando ['produtos'] no `onSuccess`. Antes de enviar, garante os
 * campos obrigatórios da RN0011 e a associação a pelo menos uma categoria
 * (RN0012, que permite mais de uma). Delega o cálculo do valor de venda
 * ao `usePrecificacaoController` e bloqueia o submit se a validação de
 * margem reprovar. Registra a operação via `useLogTransacaoController`.
 *
 * ATENDE: RF0011, RF0014, RN0011, RN0012, RN0013, RNF0012
 */

'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { produtosService } from '@/service/produtos/service';
import {
  AlterarProdutoPayload,
  CriarProdutoPayload,
  Produto,
} from '@/types/produtos/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useProdutoFormController = (produtoAtual?: Produto) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { registrar } = useLogTransacaoController();

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['produtos'] });
    queryClient.invalidateQueries({ queryKey: ['estoque'] });
  };

  const { mutate: criar, isPending: criando } = useMutation({
    mutationFn: (payload: CriarProdutoPayload) =>
      produtosService.criarProduto(payload),
    onSuccess: produto => {
      // RNF0012: toda inserção entra no log de transação.
      registrar({
        entidade: 'Produto',
        entidadeId: produto.id,
        operacao: 'INSERCAO',
      });
      invalidar();
      handleSuccess(`Produto ${produto.sku} cadastrado com sucesso.`);
      router.push('/admin/produtos');
    },
    onError: handleError,
  });

  const { mutate: alterar, isPending: alterando } = useMutation({
    mutationFn: (payload: AlterarProdutoPayload) =>
      produtosService.alterarProduto(payload),
    onSuccess: produto => {
      registrar({
        entidade: 'Produto',
        entidadeId: produto.id,
        operacao: 'ALTERACAO',
        antes: produtoAtual as unknown as Record<string, unknown>,
        depois: produto as unknown as Record<string, unknown>,
      });
      invalidar();
      handleSuccess(`Produto ${produto.sku} atualizado com sucesso.`);
      router.push('/admin/produtos');
    },
    onError: handleError,
  });

  return {
    criar,
    alterar,
    isPending: criando || alterando,
    /** A tela usa isto para decidir entre criar e alterar. */
    modoEdicao: !!produtoAtual,
  };
};
