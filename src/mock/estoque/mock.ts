/**
 * [MODEL] Mock de estoque
 *
 * O QUE FAZ: fornece as posições de estoque e o histórico de
 * movimentações dos produtos.
 *
 * COMO FARÁ: exporta `mockItensEstoque` (com produtos zerados, produtos
 * com saldo baixo e produtos com quantidade bloqueada por carrinho) e
 * `mockMovimentacoes` incluindo entradas do mesmo produto com valores de
 * custo diferentes, para exercitar a RN0051.
 *
 * A quantidade disponível é sempre relida de `mockProdutos` pelo
 * estoqueService, de modo que a posição de estoque e o catálogo não
 * possam divergir; aqui ficam o bloqueio e o maior custo vigente.
 *
 * ATENDE: RF0051-RF0054, RN0031, RN0050, RN0051
 */

import { mockProdutos } from '@/mock/produtos/mock';
import { ItemEstoque, MovimentacaoEstoque } from '@/types/estoque/types';

const diasAtras = (dias: number): string => {
  const data = new Date();
  data.setDate(data.getDate() - dias);

  return data.toISOString().slice(0, 10);
};

/** RN0044: produtos com itens presos em carrinhos ativos. */
const bloqueiosIniciais: Record<number, number> = {
  2: 3,
  11: 5,
  13: 2,
};

/** Mutável: o estoqueService movimenta as posições deste array. */
export const mockItensEstoque: ItemEstoque[] = mockProdutos.map(produto => ({
  produtoId: produto.id,
  produtoNome: produto.nome,
  produtoSku: produto.sku,
  quantidadeDisponivel: produto.quantidadeEstoque,
  quantidadeBloqueada: bloqueiosIniciais[produto.id] ?? 0,
  maiorValorCusto: produto.valorCusto,
}));

const nomeDoProduto = (produtoId: number): string =>
  mockProdutos.find(p => p.id === produtoId)?.nome ?? '';

interface SeedMovimentacao {
  id: number;
  tipo: MovimentacaoEstoque['tipo'];
  produtoId: number;
  quantidade: number;
  valorCusto: number;
  fornecedorId?: number;
  dias: number;
  observacao?: string;
}

const seed: SeedMovimentacao[] = [
  // RN0051: o mesmo produto entrando com custos diferentes. O maior custo
  // (45,00) é o que vale para todos os itens do produto 1.
  {
    id: 1,
    tipo: 'ENTRADA',
    produtoId: 1,
    quantidade: 10,
    valorCusto: 39.5,
    fornecedorId: 1,
    dias: 120,
  },
  {
    id: 2,
    tipo: 'ENTRADA',
    produtoId: 1,
    quantidade: 15,
    valorCusto: 45,
    fornecedorId: 2,
    dias: 60,
  },
  {
    id: 3,
    tipo: 'ENTRADA',
    produtoId: 2,
    quantidade: 50,
    valorCusto: 22,
    fornecedorId: 1,
    dias: 150,
  },
  {
    id: 4,
    tipo: 'ENTRADA',
    produtoId: 2,
    quantidade: 20,
    valorCusto: 25,
    fornecedorId: 3,
    dias: 45,
  },
  {
    id: 5,
    tipo: 'ENTRADA',
    produtoId: 3,
    quantidade: 12,
    valorCusto: 70,
    fornecedorId: 2,
    dias: 90,
  },
  {
    id: 6,
    tipo: 'ENTRADA',
    produtoId: 9,
    quantidade: 10,
    valorCusto: 118,
    fornecedorId: 2,
    dias: 200,
  },
  {
    id: 7,
    tipo: 'ENTRADA',
    produtoId: 9,
    quantidade: 5,
    valorCusto: 120,
    fornecedorId: 2,
    dias: 70,
  },
  {
    id: 8,
    tipo: 'ENTRADA',
    produtoId: 11,
    quantidade: 100,
    valorCusto: 15,
    fornecedorId: 1,
    dias: 110,
  },
  {
    id: 9,
    tipo: 'ENTRADA',
    produtoId: 19,
    quantidade: 8,
    valorCusto: 180,
    fornecedorId: 2,
    dias: 55,
  },
  {
    id: 10,
    tipo: 'BAIXA',
    produtoId: 2,
    quantidade: 2,
    valorCusto: 25,
    dias: 30,
    observacao: 'Baixa referente ao pedido PED-0001.',
  },
  {
    id: 11,
    tipo: 'BAIXA',
    produtoId: 11,
    quantidade: 3,
    valorCusto: 15,
    dias: 25,
    observacao: 'Baixa referente ao pedido PED-0002.',
  },
  {
    // RF0054: reentrada gerada pela troca já concluída (troca de id 3).
    id: 12,
    tipo: 'REENTRADA',
    produtoId: 10,
    quantidade: 1,
    valorCusto: 150,
    dias: 270,
    observacao: 'Reentrada por troca autorizada do pedido PED-0006.',
  },
];

export const mockMovimentacoes: MovimentacaoEstoque[] = seed.map(mov => ({
  id: mov.id,
  tipo: mov.tipo,
  produtoId: mov.produtoId,
  produtoNome: nomeDoProduto(mov.produtoId),
  quantidade: mov.quantidade,
  valorCusto: mov.valorCusto,
  fornecedorId: mov.fornecedorId,
  dataEntrada: diasAtras(mov.dias),
  // Toda movimentação registrada até aqui é do administrador (usuário 2).
  usuarioId: 2,
  observacao: mov.observacao,
}));

export const proximoIdMovimentacao = (): number =>
  mockMovimentacoes.reduce((maior, m) => Math.max(maior, m.id), 0) + 1;
