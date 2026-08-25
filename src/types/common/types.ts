/**
 * [MODEL] Tipos comuns
 *
 * O QUE FAZ: reúne os tipos transversais usados por todos os domínios —
 * paginação, resultado de filtro, erro de API e os utilitários genéricos
 * que evitam repetir a mesma forma em cada types.ts.
 *
 * COMO FARÁ: exporta `Paginacao`, `Pagina<T>` (itens + total + página atual),
 * `ApiError` (status + mensagem), `Opcao` (par value/label para os selects
 * alimentados por tabelas de domínio) e `Periodo` (dataInicio/dataFim).
 *
 * ATENDE: base para RF0015, RF0024, RNF0011
 */

export interface Paginacao {
  pagina: number;
  itensPorPagina: number;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  itensPorPagina: number;
}

export interface ApiError {
  status: number;
  mensagem: string;
}

export interface Opcao {
  value: number | string;
  label: string;
}

/** Datas no formato ISO (AAAA-MM-DD), como vêm dos inputs type="date". */
export interface Periodo {
  dataInicio: string;
  dataFim: string;
}
