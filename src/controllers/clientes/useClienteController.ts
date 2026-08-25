/**
 * [CONTROLLER] useClienteController
 *
 * O QUE FAZ: entrega o cliente completo — dados cadastrais, endereços,
 * cartões e pets — para a tela de detalhe do admin e para o perfil do
 * cliente logado.
 *
 * COMO FARÁ: `useQuery` com queryKey ['clientes', id] sobre
 * `fetchClientePorId`. Deriva o ranking em faixa legível (RN0027) para a
 * View não precisar interpretar o número cru.
 *
 * ATENDE: RF0022, RF0024, RN0027
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { clientesService } from '@/service/clientes/service';

/** RN0027: traduz o ranking numérico em faixa legível para a View. */
export const faixaDoRanking = (ranking: number): string => {
  const faixas: Record<number, string> = {
    1: 'Novo',
    2: 'Ocasional',
    3: 'Frequente',
    4: 'Fiel',
    5: 'Premium',
  };

  return faixas[ranking] ?? 'Novo';
};

export const useClienteController = (id?: number) => {
  const {
    data: cliente,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['clientes', id],
    queryFn: () => clientesService.fetchClientePorId(id as number),
    enabled: !!id,
  });

  return {
    cliente,
    faixaRanking: cliente ? faixaDoRanking(cliente.ranking) : '-',
    isLoading,
    isError,
  };
};
