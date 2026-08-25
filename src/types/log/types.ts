/**
 * [MODEL] Tipos do log de transação
 *
 * O QUE FAZ: descreve o registro de auditoria exigido para toda operação
 * de escrita do sistema.
 *
 * COMO FARÁ: exporta `LogTransacao` (id, dataHora, usuarioId, entidade,
 * entidadeId, operacao INSERCAO ou ALTERACAO e `dadosAlterados` com o
 * antes/depois dos campos) e `LogFiltros`.
 *
 * ATENDE: RNF0012
 */

export type OperacaoLog = 'INSERCAO' | 'ALTERACAO';

export interface CampoAlterado {
  campo: string;
  de: unknown;
  para: unknown;
}

export interface LogTransacao {
  id: number;
  dataHora: string;
  usuarioId: number;
  usuarioNome: string;
  entidade: string;
  entidadeId: number;
  operacao: OperacaoLog;
  /** Vazio nas inserções; nas alterações traz o antes/depois de cada campo. */
  dadosAlterados: CampoAlterado[];
}

export interface LogFiltros {
  entidade?: string;
  entidadeId?: number;
  usuarioId?: number;
  operacao?: OperacaoLog;
}

/** Payload usado pelos services ao registrar a operação. */
export interface RegistrarLogPayload {
  usuarioId: number;
  usuarioNome: string;
  entidade: string;
  entidadeId: number;
  operacao: OperacaoLog;
  dadosAlterados?: CampoAlterado[];
}
