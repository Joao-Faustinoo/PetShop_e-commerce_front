/**
 * [CONTROLLER] useEstoqueController
 *
 * O QUE FAZ: entrega a posição de estoque por produto e o extrato de
 * movimentações para a tela do administrador.
 *
 * COMO FARÁ: `useQuery` ['estoque', filtros] com o termo de busca já
 * debounced pela View, mostrando disponível, bloqueado por carrinho e o
 * valor de custo vigente. Deriva o alerta de saldo zerado, que é o gatilho
 * da inativação automática da RF0013.
 *
 * ATENDE: RF0013, RF0051, RN0051
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { estoqueService } from '@/service/estoque/service';
import { EstoqueFiltros } from '@/types/estoque/types';

export const useEstoqueController = (filtros: EstoqueFiltros = {}) => {
  const {
    data: itens = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['estoque', filtros],
    queryFn: () => estoqueService.fetchItensEstoque(filtros),
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['estoque', 'movimentacoes'],
    queryFn: () => estoqueService.fetchMovimentacoes(),
  });

  // RF0013: os zerados são justamente os candidatos à inativação automática.
  const itensZerados = itens.filter(item => item.quantidadeDisponivel === 0);

  return {
    itens,
    movimentacoes,
    itensZerados,
    // Alerta exibido no topo da tela de estoque.
    temItensZerados: itensZerados.length > 0,
    isLoading,
    isError,
  };
};
