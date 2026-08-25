/**
 * [CONTROLLER] useCarrinhoController
 *
 * O QUE FAZ: expõe o carrinho à View e conduz adicionar, alterar
 * quantidade e remover itens, aplicando as validações de estoque.
 *
 * COMO FARÁ: `useQuery` ['carrinho'] sobre `carrinhoService.fetchCarrinho`
 * e mutations para cada operação, todas invalidando a mesma chave. Antes
 * de adicionar, recusa produto sem saldo e quantidade acima do disponível
 * (RN0031), devolvendo a mensagem ao toast. Ao carregar, compara o saldo
 * atual com o do momento da inclusão: se mudou, notifica, ajusta a
 * quantidade e remove o que ficou indisponível (RN0032). Ao adicionar,
 * dispara o bloqueio do item pelo `useBloqueioItemController`.
 *
 * ATENDE: RF0031, RF0032, RN0031, RN0032
 */

'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { carrinhoService } from '@/service/carrinho/service';
import {
  AdicionarItemPayload,
  AlterarQuantidadePayload,
} from '@/types/carrinho/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

/**
 * A RNF0042 manda desabilitar a opção de comprar enquanto houver item
 * expirado na lista, obrigando o cliente a adicioná-lo de novo. Com
 * `false`, os expirados continuam visíveis (a parte da RNF0042 que os
 * apresenta segue valendo) mas deixam de travar o checkout: a compra
 * segue com o que sobrou no carrinho.
 *
 * Voltar para `true` restaura o comportamento exigido pelo documento.
 */
const EXIGIR_REPOSICAO_DE_ITEM_EXPIRADO = false;

export const useCarrinhoController = () => {
  const queryClient = useQueryClient();

  const {
    data: carrinho,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['carrinho'],
    queryFn: carrinhoService.fetchCarrinho,
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['carrinho'] });
    // O bloqueio do item muda a posição de estoque.
    queryClient.invalidateQueries({ queryKey: ['estoque'] });
  };

  // RN0031: o service recusa saldo insuficiente e a mensagem vai ao toast.
  const { mutate: adicionarItem, isPending: adicionando } = useMutation({
    mutationFn: (payload: AdicionarItemPayload) =>
      carrinhoService.adicionarItem(payload),
    onSuccess: () => {
      invalidar();
      handleSuccess('Produto adicionado ao carrinho.');
    },
    onError: handleError,
  });

  const { mutate: alterarQuantidade, isPending: alterando } = useMutation({
    mutationFn: (payload: AlterarQuantidadePayload) =>
      carrinhoService.alterarQuantidade(payload),
    onSuccess: invalidar,
    onError: handleError,
  });

  const { mutate: removerItem, isPending: removendo } = useMutation({
    mutationFn: (produtoId: number) => carrinhoService.removerItem(produtoId),
    onSuccess: () => {
      invalidar();
      handleSuccess('Item removido do carrinho.');
    },
    onError: handleError,
  });

  // RNF0042: devolve ao carrinho um item que havia expirado.
  const { mutate: restaurarItem, isPending: restaurando } = useMutation({
    mutationFn: (produtoId: number) =>
      carrinhoService.restaurarItemRemovido(produtoId),
    onSuccess: () => {
      invalidar();
      handleSuccess('Item devolvido ao carrinho.');
    },
    onError: handleError,
  });

  /**
   * RN0032: relê o estoque antes de fechar a compra. Notifica a mudança,
   * ajusta as quantidades e remove o que ficou indisponível.
   */
  const revalidarDisponibilidade = useCallback(async () => {
    const { alertas } = await carrinhoService.revalidarDisponibilidade();

    alertas.forEach(alerta => {
      if (alerta.tipo === 'ITEM_REMOVIDO') {
        toast.warn(
          `"${alerta.produtoNome}" ficou indisponível e foi removido do carrinho.`,
        );
      } else {
        toast.warn(
          `A quantidade de "${alerta.produtoNome}" foi ajustada de ${alerta.quantidadeAnterior} para ${alerta.quantidadeAtual} por mudança no estoque.`,
        );
      }
    });

    invalidar();

    return alertas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  const limpar = useCallback(async () => {
    await carrinhoService.limpar();
    invalidar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  const itens = carrinho?.itens ?? [];

  return {
    carrinho,
    itens,
    itensRemovidos: carrinho?.itensRemovidos ?? [],
    subtotal: carrinho?.subtotal ?? 0,
    total: carrinho?.total ?? 0,
    quantidadeItens: itens.reduce((soma, item) => soma + item.quantidade, 0),
    compraBloqueada:
      EXIGIR_REPOSICAO_DE_ITEM_EXPIRADO &&
      (carrinho?.itensRemovidos.length ?? 0) > 0,
    isLoading,
    isError,
    adicionarItem,
    alterarQuantidade,
    removerItem,
    restaurarItem,
    revalidarDisponibilidade,
    limpar,
    isPending: adicionando || alterando || removendo || restaurando,
  };
};
