/**
 * [CONTROLLER] useNotificacoesController
 *
 * O QUE FAZ: entrega ao cliente os avisos que ainda não foram lidos e
 * permite dispensá-los.
 *
 * COMO FARÁ: `useQuery` em ['notificacoes'] sobre o service, e uma
 * `useMutation` para marcar como lido, que invalida a lista. A consulta
 * só roda para quem está logado como cliente.
 *
 * ATENDE: RNF0046
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import {
  Notificacao,
  notificacoesService,
} from '@/service/notificacoes/service';
import handleError from '@/utils/handleToast';

export const useNotificacoesController = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: notificacoes = [], isLoading } = useQuery<Notificacao[]>({
    queryKey: ['notificacoes'],
    queryFn: () => notificacoesService.fetchNotificacoes(),
    enabled: !!user?.clienteId,
  });

  const { mutate: marcarComoLida } = useMutation({
    mutationFn: (id: number) => notificacoesService.marcarComoLida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
    onError: handleError,
  });

  return {
    notificacoes,
    naoLidas: notificacoes.filter(n => !n.lida),
    isLoading,
    marcarComoLida,
  };
};
