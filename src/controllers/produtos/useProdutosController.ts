/**
 * [CONTROLLER] useProdutosController
 *
 * O QUE FAZ: entrega a lista de produtos filtrada, tanto para a vitrine
 * do cliente quanto para a listagem do administrador.
 *
 * COMO FARÁ: recebe os filtros já debounced pela View e os coloca na
 * queryKey (['produtos', filtros]), de modo que o `useQuery` refaça a
 * busca só quando o usuário para de digitar. Chama
 * `produtosService.fetchProdutos`. A vitrine passa `ativo: true` fixo; o
 * admin passa a situação escolhida no filtro. Expõe `produtos`,
 * `isLoading`, `isError` e o total para a paginação.
 *
 * ATENDE: RF0015, RNF0011
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { produtosService } from '@/service/produtos/service';
import { ProdutoFiltros } from '@/types/produtos/types';

export const useProdutosController = (filtros: ProdutoFiltros = {}) => {
  const {
    data: produtos = [],
    isLoading,
    isError,
  } = useQuery({
    // Os filtros na chave fazem a busca refazer só quando eles mudam.
    queryKey: ['produtos', filtros],
    queryFn: () => produtosService.fetchProdutos(filtros),
  });

  return { produtos, total: produtos.length, isLoading, isError };
};
