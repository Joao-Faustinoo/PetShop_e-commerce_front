/**
 * [CONTROLLER] useProdutoController
 *
 * O QUE FAZ: entrega o detalhe de um produto para a página de produto e
 * para a tela de edição do admin.
 *
 * COMO FARÁ: `useQuery` com queryKey ['produtos', id] chamando
 * `fetchProdutoPorId`, habilitado só quando há id. Deriva para a View se
 * o produto pode ser comprado (ativo E com saldo em estoque), poupando a
 * tela de repetir essa checagem antes de habilitar o botão de carrinho.
 *
 * ATENDE: RF0015, RN0031
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { produtosService } from '@/service/produtos/service';

export const useProdutoController = (id?: number) => {
  const {
    data: produto,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['produtos', id],
    queryFn: () => produtosService.fetchProdutoPorId(id as number),
    enabled: !!id,
  });

  // RN0031: sem saldo (ou inativo) o produto não pode ir ao carrinho.
  const podeComprar = !!produto?.ativo && (produto?.quantidadeEstoque ?? 0) > 0;

  return {
    produto,
    podeComprar,
    saldoDisponivel: produto?.quantidadeEstoque ?? 0,
    isLoading,
    isError,
  };
};
