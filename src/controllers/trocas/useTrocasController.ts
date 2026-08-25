/**
 * [CONTROLLER] useTrocasController
 *
 * O QUE FAZ: entrega ao administrador a lista de pedidos de troca e
 * compras em EM_TROCA.
 *
 * COMO FARÁ: `useQuery` ['trocas', filtros] sobre `fetchTrocas`,
 * separando por status para a tela poder agrupar em abas: aguardando
 * autorização, autorizadas aguardando recebimento e já trocadas.
 *
 * ATENDE: RF0043
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { trocasService } from '@/service/trocas/service';
import { TrocaFiltros } from '@/types/trocas/types';

export const useTrocasController = (filtros: TrocaFiltros = {}) => {
  const {
    data: trocas = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['trocas', filtros],
    queryFn: () => trocasService.fetchTrocas(filtros),
  });

  return {
    trocas,
    // RF0043: as três abas da tela de trocas do administrador.
    aguardandoAutorizacao: trocas.filter(t => t.status === 'EM_TROCA'),
    aguardandoRecebimento: trocas.filter(t => t.status === 'TROCA_AUTORIZADA'),
    concluidas: trocas.filter(t => t.status === 'TROCADO'),
    isLoading,
    isError,
  };
};
