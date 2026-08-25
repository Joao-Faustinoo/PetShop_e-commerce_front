/**
 * [CONTROLLER] useTransacoesClienteController
 *
 * O QUE FAZ: entrega o histórico de transações de um cliente, exibido
 * dentro do cadastro dele.
 *
 * COMO FARÁ: `useQuery` com queryKey ['clientes', id, 'transacoes']
 * chamando `fetchTransacoesCliente`, ordenando por data decrescente e
 * agregando o total gasto — insumo do ranking da RN0027.
 *
 * ATENDE: RF0025, RN0027
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { clientesService } from '@/service/clientes/service';

export const useTransacoesClienteController = (clienteId?: number) => {
  const {
    data: transacoes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['clientes', clienteId, 'transacoes'],
    queryFn: () => clientesService.fetchTransacoesCliente(clienteId as number),
    enabled: !!clienteId,
  });

  // RN0027: o total gasto em compras não reprovadas alimenta o ranking.
  const totalGasto = transacoes
    .filter(pedido => pedido.status !== 'REPROVADA')
    .reduce((soma, pedido) => soma + pedido.total, 0);

  return {
    transacoes,
    totalGasto: Number(totalGasto.toFixed(2)),
    quantidadeCompras: transacoes.length,
    isLoading,
    isError,
  };
};
