/**
 * [MODEL] Tipos de cupom
 *
 * O QUE FAZ: descreve os dois tipos de cupom aceitos como forma de
 * pagamento.
 *
 * COMO FARÁ: exporta `TipoCupom` (TROCA ou PROMOCIONAL), `Cupom`
 * (codigo, tipo, valor, validade, utilizado e clienteId — cupons de troca
 * são nominais), `CupomAplicado` (cupom + valor efetivamente consumido na
 * compra) e `ValidacaoCupom` (valido + motivo da recusa).
 *
 * ATENDE: RF0037, RF0045, RN0033, RN0035, RN0036, RN0037
 */

export type TipoCupom = 'TROCA' | 'PROMOCIONAL';

export interface Cupom {
  id: number;
  codigo: string;
  tipo: TipoCupom;
  valor: number;
  /** Data de validade em ISO (AAAA-MM-DD). */
  validade: string;
  utilizado: boolean;
  /** Cupons de TROCA são nominais; promocionais valem para qualquer cliente. */
  clienteId?: number;
  /** Preenchido quando o cupom nasce de um pedido de troca (RF0045). */
  trocaId?: number;
}

export interface CupomAplicado {
  cupom: Cupom;
  /** RN0035/RN0036: pode ser menor que o valor do cupom (gera troco). */
  valorConsumido: number;
}

export interface ValidacaoCupom {
  valido: boolean;
  motivo?: string;
  cupom?: Cupom;
}
