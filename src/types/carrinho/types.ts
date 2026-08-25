/**
 * [MODEL] Tipos de carrinho
 *
 * O QUE FAZ: descreve o carrinho de compra e o bloqueio temporário dos
 * itens nele colocados.
 *
 * COMO FARÁ: exporta `ItemCarrinho` (produto, quantidade, valorUnitario,
 * subtotal, bloqueadoAte e expirado) e `Carrinho` (itens, itensRemovidos
 * — os que caíram por expiração e precisam ser exibidos pela RNF0042 —,
 * subtotal e total). Exporta ainda `AdicionarItemPayload`,
 * `AlterarQuantidadePayload` e `ParametrosBloqueio` (tempo limite e o
 * aviso de 5 minutos antes, ambos parametrizáveis pela RN0044).
 *
 * ATENDE: RF0031, RF0032, RN0031, RN0032, RN0044, RN0045, RNF0042
 */

import { Produto } from '@/types/produtos/types';

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  /** RN0044: instante em que o bloqueio do item expira (ISO). */
  bloqueadoAte: string;
  expirado: boolean;
}

export interface Carrinho {
  itens: ItemCarrinho[];
  /** RNF0042: itens retirados por expiração, ainda exibidos na listagem. */
  itensRemovidos: ItemCarrinho[];
  subtotal: number;
  total: number;
}

export interface AdicionarItemPayload {
  produtoId: number;
  quantidade: number;
}

export interface AlterarQuantidadePayload {
  produtoId: number;
  quantidade: number;
}

/** RN0044: ambos os prazos são parâmetros do sistema. */
export interface ParametrosBloqueio {
  minutosLimite: number;
  minutosAviso: number;
}

/** RN0032: mudanças de disponibilidade detectadas na finalização. */
export interface AlertaDisponibilidade {
  produtoId: number;
  produtoNome: string;
  tipo: 'QUANTIDADE_AJUSTADA' | 'ITEM_REMOVIDO';
  quantidadeAnterior: number;
  quantidadeAtual: number;
}
