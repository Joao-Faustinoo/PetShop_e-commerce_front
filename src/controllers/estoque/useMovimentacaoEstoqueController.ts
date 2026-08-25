/**
 * [CONTROLLER] useMovimentacaoEstoqueController
 *
 * O QUE FAZ: conduz a baixa e a reentrada de estoque, que não são ações
 * de tela e sim consequências de outros fluxos.
 *
 * COMO FARÁ: expõe `darBaixa(itens)`, chamada pelo checkout apenas depois
 * que a compra sai de EM_PROCESSAMENTO (RN0028 e RF0053), e
 * `registrarReentrada(itens)`, chamada pelo recebimento de troca quando o
 * administrador marca o retorno ao estoque (RF0054). Ambas invalidam
 * ['estoque'] e registram log.
 *
 * ATENDE: RF0053, RF0054, RN0028, RNF0012
 */

'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { useAuth } from '@/hooks/useAuth';
import { estoqueService } from '@/service/estoque/service';

interface ItemMovimentado {
  produtoId: number;
  quantidade: number;
}

export const useMovimentacaoEstoqueController = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { registrar } = useLogTransacaoController();

  const invalidar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['estoque'] });
    queryClient.invalidateQueries({ queryKey: ['produtos'] });
  }, [queryClient]);

  /**
   * RF0053/RN0028: só é chamada depois que a compra deixa de estar
   * EM_PROCESSAMENTO — item de compra não aprovada continua em estoque.
   */
  const darBaixa = useCallback(
    async (itens: ItemMovimentado[], observacao?: string) => {
      const movimentacoes = await estoqueService.darBaixa(
        itens,
        user?.id ?? 0,
        observacao,
      );

      await Promise.all(
        movimentacoes.map(mov =>
          registrar({
            entidade: 'Estoque',
            entidadeId: mov.id,
            operacao: 'INSERCAO',
          }),
        ),
      );

      invalidar();

      return movimentacoes;
    },
    [user, registrar, invalidar],
  );

  /** RF0054: reentrada dos itens de uma troca recebida. */
  const registrarReentrada = useCallback(
    async (itens: ItemMovimentado[], observacao?: string) => {
      const movimentacoes = await estoqueService.registrarReentrada(
        itens,
        user?.id ?? 0,
        observacao,
      );

      await Promise.all(
        movimentacoes.map(mov =>
          registrar({
            entidade: 'Estoque',
            entidadeId: mov.id,
            operacao: 'INSERCAO',
          }),
        ),
      );

      invalidar();

      return movimentacoes;
    },
    [user, registrar, invalidar],
  );

  return { darBaixa, registrarReentrada };
};
