/**
 * [MODEL] Service de log de transações
 *
 * O QUE FAZ: consulta o registro das operações de escrita do sistema.
 *
 * COMO FARÁ: uma chamada à API. **Não existe função de gravação aqui, e
 * isso é proposital.** Quem registra é o service de cada domínio no
 * servidor, de dentro da mesma transação que faz a escrita: assim o
 * registro e o dado registrado valem ou falham juntos, e uma operação
 * feita pela API sem passar por esta tela também fica registrada.
 *
 * Gravar o log a partir do navegador deixaria o registro à mercê de a aba
 * fechar na hora errada, e de nada ser escrito quando a chamada não vier
 * da interface — que é exatamente o que a RNF0012 não pode permitir.
 *
 * ATENDE: RNF0012
 */

import { api } from '@/service/api/request';
import { Pagina } from '@/types/common/types';
import { CampoAlterado, LogFiltros, LogTransacao } from '@/types/log/types';

/** Só os filtros preenchidos entram na URL. */
const montarQuery = (filtros: LogFiltros): string => {
  const params = new URLSearchParams();

  if (filtros.entidade) params.set('entidade', filtros.entidade);
  if (filtros.entidadeId) params.set('entidadeId', String(filtros.entidadeId));
  if (filtros.usuarioId) params.set('usuarioId', String(filtros.usuarioId));
  if (filtros.operacao) params.set('operacao', filtros.operacao);
  params.set('itensPorPagina', '100');

  return params.toString();
};

export const logService = {
  async fetchLogs(filtros: LogFiltros = {}): Promise<LogTransacao[]> {
    const pagina = await api<Pagina<LogTransacao>>(
      `/logs?${montarQuery(filtros)}`,
    );

    return pagina.itens;
  },
};

/**
 * Compara dois estados e devolve o que mudou. Continua exportada porque a
 * tela a usa para exibir a diferença de um registro; o servidor faz o
 * mesmo cálculo ao ler o log, e esta fica para quem já tem os dois objetos
 * em mãos.
 */
export const diferencaEntre = (
  antes: Record<string, unknown>,
  depois: Record<string, unknown>,
): CampoAlterado[] =>
  Object.keys(antes)
    .concat(Object.keys(depois).filter(campo => !(campo in antes)))
    .filter(campo => JSON.stringify(antes[campo]) !== JSON.stringify(depois[campo]))
    .map(campo => ({ campo, de: antes[campo], para: depois[campo] }));
