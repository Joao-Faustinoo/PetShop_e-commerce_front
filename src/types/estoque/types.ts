/**
 * [MODEL] Tipos de estoque
 *
 * O QUE FAZ: descreve as movimentações de estoque — entrada, baixa e
 * reentrada por troca.
 *
 * COMO FARÁ: exporta `TipoMovimentacao` (ENTRADA, BAIXA, REENTRADA),
 * `ItemEstoque` (produtoId, quantidade disponível, quantidade bloqueada e
 * maior valor de custo vigente — base da RN0051), `MovimentacaoEstoque`
 * (tipo, produtoId, quantidade, valorCusto, fornecedorId, dataEntrada) e
 * `EntradaEstoquePayload` com os campos obrigatórios da RN0050.
 *
 * ATENDE: RF0051-RF0054, RN0050, RN0051, RN0061, RN0062, RNF0064
 */

export type TipoMovimentacao = 'ENTRADA' | 'BAIXA' | 'REENTRADA';

export interface ItemEstoque {
  produtoId: number;
  produtoNome: string;
  produtoSku: string;
  quantidadeDisponivel: number;
  /** RN0044: itens presos em carrinhos ativos. */
  quantidadeBloqueada: number;
  /** RN0051: o maior custo entre os lotes define o valor de venda. */
  maiorValorCusto: number;
}

export interface MovimentacaoEstoque {
  id: number;
  tipo: TipoMovimentacao;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  valorCusto: number;
  fornecedorId?: number;
  dataEntrada: string;
  usuarioId: number;
  observacao?: string;
}

/** RN0050: todos os campos são obrigatórios na entrada. */
export interface EntradaEstoquePayload {
  produtoId: number;
  /** RN0061: não pode ser zero. */
  quantidade: number;
  /** RN0062: todo item precisa de valor de custo. */
  valorCusto: number;
  fornecedorId: number;
  /** RNF0064: data de entrada é obrigatória. */
  dataEntrada: string;
}

export interface EstoqueFiltros {
  produtoNome?: string;
  apenasSemEstoque?: boolean;
}
