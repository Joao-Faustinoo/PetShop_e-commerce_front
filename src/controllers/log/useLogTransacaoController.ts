/**
 * [CONTROLLER] useLogTransacaoController
 *
 * O QUE FAZ: expõe a consulta do registro de operações de escrita.
 *
 * COMO FARÁ: `useQuery` sobre `fetchLogs`, com os filtros da tela.
 *
 * **Não registra mais nada.** Até a migração para a API, cada controller
 * chamava `registrar` no `onSuccess` da sua mutation. Agora quem registra
 * é o service de cada domínio no servidor, dentro da mesma transação que
 * faz a escrita — o registro e o dado registrado valem ou falham juntos, e
 * uma operação feita direto na API também fica registrada, o que a
 * gravação pelo navegador nunca garantiria.
 *
 * ATENDE: RNF0012
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { logService } from '@/service/log/service';
import { LogFiltros } from '@/types/log/types';

export const useLogTransacaoController = (filtros: LogFiltros = {}) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['logs', filtros],
    queryFn: () => logService.fetchLogs(filtros),
  });

  return { logs, isLoading };
};
