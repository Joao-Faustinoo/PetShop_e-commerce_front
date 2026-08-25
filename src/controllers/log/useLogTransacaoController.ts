/**
 * [CONTROLLER] useLogTransacaoController
 *
 * O QUE FAZ: registra a auditoria de toda operação de escrita do sistema
 * e expõe a consulta desse histórico.
 *
 * COMO FARÁ: expõe `registrar({ entidade, entidadeId, operacao, antes,
 * depois })`, que completa o registro com data, hora e o usuário da
 * sessão antes de chamar o service. É chamado no `onSuccess` das
 * mutations dos demais controllers, e não pelas telas — assim nenhuma
 * escrita escapa do log exigido pela RNF0012.
 *
 * ATENDE: RNF0012
 */

'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { diferencaEntre, logService } from '@/service/log/service';
import { LogFiltros, OperacaoLog } from '@/types/log/types';

interface RegistrarParams {
  entidade: string;
  entidadeId: number;
  operacao: OperacaoLog;
  /** Estado anterior; ausente nas inserções. */
  antes?: Record<string, unknown>;
  depois?: Record<string, unknown>;
}

export const useLogTransacaoController = (filtros: LogFiltros = {}) => {
  const { user } = useAuth();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['logs', filtros],
    queryFn: () => logService.fetchLogs(filtros),
  });

  /**
   * RNF0012: além do usuário e do instante, guarda o antes/depois dos
   * campos que mudaram, para a alteração ficar auditável.
   */
  const registrar = useCallback(
    ({ entidade, entidadeId, operacao, antes, depois }: RegistrarParams) =>
      logService.registrarLog({
        usuarioId: user?.id ?? 0,
        usuarioNome: user?.nome ?? 'Sistema',
        entidade,
        entidadeId,
        operacao,
        dadosAlterados:
          antes && depois ? diferencaEntre(antes, depois) : undefined,
      }),
    [user],
  );

  return { logs, isLoading, registrar };
};
