/**
 * [MODEL] Mock de carrinho
 *
 * O QUE FAZ: fornece o estado inicial do carrinho e os parâmetros de
 * bloqueio de item.
 *
 * COMO FARÁ: exporta `mockCarrinho` já com alguns itens para a tela
 * nascer populada, e `mockParametrosBloqueio` com o tempo limite de
 * bloqueio e o aviso de 5 minutos antes, ambos parametrizáveis pela
 * RN0044. Inclui um item já expirado para a RNF0042 ter o que exibir na
 * lista de itens removidos.
 *
 * ATENDE: RF0031, RF0032, RN0044, RN0045, RNF0042
 */

import { mockProdutos } from '@/mock/produtos/mock';
import {
  Carrinho,
  ItemCarrinho,
  ParametrosBloqueio,
} from '@/types/carrinho/types';

/** RN0044: ambos os prazos são parâmetros do sistema. */
export const mockParametrosBloqueio: ParametrosBloqueio = {
  minutosLimite: 30,
  minutosAviso: 5,
};

const emMinutos = (minutos: number): string =>
  new Date(Date.now() + minutos * 60 * 1000).toISOString();

const montarItem = (
  produtoId: number,
  quantidade: number,
  minutosRestantes: number,
): ItemCarrinho => {
  const produto = mockProdutos.find(p => p.id === produtoId)!;

  return {
    produto,
    quantidade,
    valorUnitario: produto.valorVenda,
    subtotal: Number((produto.valorVenda * quantidade).toFixed(2)),
    bloqueadoAte: emMinutos(minutosRestantes),
    expirado: minutosRestantes <= 0,
  };
};

const itens: ItemCarrinho[] = [
  montarItem(2, 2, mockParametrosBloqueio.minutosLimite),
  montarItem(11, 1, mockParametrosBloqueio.minutosLimite - 5),
];

/** RNF0042: item que já perdeu o bloqueio e precisa ser reexibido. */
const itensRemovidos: ItemCarrinho[] = [montarItem(13, 1, -2)];

const subtotal = Number(
  itens.reduce((soma, i) => soma + i.subtotal, 0).toFixed(2),
);

/** Mutável: o carrinhoService substitui este objeto durante a sessão. */
export const mockCarrinho: Carrinho = {
  itens,
  itensRemovidos,
  subtotal,
  total: subtotal,
};
