/**
 * [MODEL] Service do log de transação
 *
 * O QUE FAZ: grava e consulta o registro de auditoria de toda operação
 * de escrita.
 *
 * COMO FARÁ: `registrarLog({ entidade, entidadeId, operacao, dados })`
 * acrescenta a `mockLogs` um registro com data, hora e usuário
 * responsável obtido da sessão; `fetchLogs(filtros)` devolve o histórico
 * filtrado por entidade, usuário ou período.
 *
 * ATENDE: RNF0012
 */

import { mockLogs, proximoIdLog } from '@/mock/log/mock';
import { delay } from '@/service/api/delay';
import {
  CampoAlterado,
  LogFiltros,
  LogTransacao,
  RegistrarLogPayload,
} from '@/types/log/types';

export const logService = {
  registrarLog(payload: RegistrarLogPayload): Promise<LogTransacao> {
    const registro: LogTransacao = {
      id: proximoIdLog(),
      // RNF0012: data, hora e usuário responsável de toda escrita.
      dataHora: new Date().toISOString(),
      usuarioId: payload.usuarioId,
      usuarioNome: payload.usuarioNome,
      entidade: payload.entidade,
      entidadeId: payload.entidadeId,
      operacao: payload.operacao,
      dadosAlterados: payload.dadosAlterados ?? [],
    };

    mockLogs.push(registro);

    return delay(registro, 80);
  },

  fetchLogs(filtros: LogFiltros = {}): Promise<LogTransacao[]> {
    const resultado = mockLogs
      .filter(log => {
        if (filtros.entidade && log.entidade !== filtros.entidade) return false;
        if (filtros.entidadeId && log.entidadeId !== filtros.entidadeId) {
          return false;
        }
        if (filtros.usuarioId && log.usuarioId !== filtros.usuarioId) {
          return false;
        }
        if (filtros.operacao && log.operacao !== filtros.operacao) return false;

        return true;
      })
      .sort((a, b) => b.dataHora.localeCompare(a.dataHora));

    return delay(resultado);
  },
};

/**
 * Compara o estado anterior e o novo de uma entidade e devolve só os
 * campos que mudaram, no formato que a RNF0012 exige guardar.
 */
export const diferencaEntre = <T extends Record<string, unknown>>(
  antes: T,
  depois: Partial<T>,
): CampoAlterado[] =>
  Object.keys(depois)
    .filter(campo => {
      const valorAntes = antes[campo];
      const valorDepois = depois[campo];

      return JSON.stringify(valorAntes) !== JSON.stringify(valorDepois);
    })
    .map(campo => ({
      campo,
      de: antes[campo] ?? null,
      para: depois[campo] ?? null,
    }));
