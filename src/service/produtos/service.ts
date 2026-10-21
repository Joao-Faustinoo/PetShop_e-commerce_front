/**
 * [MODEL] Service de produtos
 *
 * O QUE FAZ: entrega o catálogo consultável e o detalhe de um produto.
 *
 * COMO FARÁ: a consulta chama a API, que devolve `quantidadeEstoque` já
 * como o DISPONÍVEL — o saldo menos o que está preso em carrinhos dentro
 * do prazo (RN0044). É esse número que a tela compara ao limitar o que
 * pode ir para o carrinho (RN0031).
 *
 * ESTADO: a fatia de leitura, que é a que a venda precisa. O cadastro, a
 * precificação e a mudança de situação do produto (RF0011-RF0016) seguem
 * sobre dados mockados e entram quando essa fatia for portada para a API.
 *
 * ATENDE: RF0017, RN0012, RN0031
 */

import { mockGruposPrecificacao } from '@/mock/dominios/mock';
import { mockProdutos } from '@/mock/produtos/mock';
import { api } from '@/service/api/request';
import { delay, delayErro } from '@/service/api/delay';
import { Pagina } from '@/types/common/types';
import {
  AlterarProdutoPayload,
  AtivarProdutoPayload,
  CriarProdutoPayload,
  InativarProdutoPayload,
  Produto,
  ProdutoFiltros,
} from '@/types/produtos/types';

/** RF0013: produto com menos vendas que isto entra na inativação automática. */
export const PARAMETRO_VENDA_MINIMA = 5;

/** RN0013: valor de venda = custo + margem do grupo de precificação. */
export const calcularValorVenda = (
  valorCusto: number,
  grupoPrecificacaoId: number,
): number => {
  const grupo = mockGruposPrecificacao.find(g => g.id === grupoPrecificacaoId);

  return Number(
    (valorCusto * (1 + (grupo?.margemLucro ?? 0) / 100)).toFixed(2),
  );
};

/** Só os filtros preenchidos entram na URL. */
const montarQuery = (filtros: ProdutoFiltros): string => {
  const params = new URLSearchParams();

  if (filtros.nome) params.set('nome', filtros.nome.trim());
  if (filtros.especie) params.set('especie', filtros.especie);
  if (filtros.porte) params.set('porte', filtros.porte);
  if (filtros.marcaId) params.set('marcaId', String(filtros.marcaId));
  if (filtros.categoriaId) params.set('categoriaId', String(filtros.categoriaId));
  if (filtros.corId) params.set('corId', String(filtros.corId));
  if (filtros.materialId) params.set('materialId', String(filtros.materialId));
  if (filtros.precoMinimo !== undefined) {
    params.set('precoMinimo', String(filtros.precoMinimo));
  }
  if (filtros.precoMaximo !== undefined) {
    params.set('precoMaximo', String(filtros.precoMaximo));
  }
  if (filtros.ativo !== undefined) params.set('ativo', String(filtros.ativo));
  params.set('itensPorPagina', '100');

  return params.toString();
};

export const produtosService = {
  /** RF0017: consulta por qualquer campo, isolado ou combinado. */
  async fetchProdutos(filtros: ProdutoFiltros = {}): Promise<Produto[]> {
    const pagina = await api<Pagina<Produto>>(
      `/produtos?${montarQuery(filtros)}`,
    );

    return pagina.itens;
  },

  async fetchProdutoPorId(id: number): Promise<Produto> {
    return api<Produto>(`/produtos/${id}`);
  },

  // -------------------------------------------------------------------
  // Administração de produto — ainda sobre mock, fora do escopo da venda
  // -------------------------------------------------------------------

  criarProduto(payload: CriarProdutoPayload): Promise<Produto> {
    const produto: Produto = {
      ...payload,
      id: Math.max(0, ...mockProdutos.map(p => p.id)) + 1,
      sku: `PET-${String(mockProdutos.length + 1).padStart(4, '0')}`,
      valorVenda: calcularValorVenda(
        payload.valorCusto,
        payload.grupoPrecificacaoId,
      ),
      quantidadeEstoque: 0,
      ativo: true,
      totalVendido: 0,
    };

    mockProdutos.push(produto);

    return delay(produto);
  },

  alterarProduto(payload: AlterarProdutoPayload): Promise<Produto> {
    const indice = mockProdutos.findIndex(p => p.id === payload.id);

    if (indice < 0) return delayErro('Produto não encontrado.');

    mockProdutos[indice] = { ...mockProdutos[indice], ...payload };

    return delay(mockProdutos[indice]);
  },

  inativarProduto(payload: InativarProdutoPayload): Promise<Produto> {
    const indice = mockProdutos.findIndex(p => p.id === payload.id);

    if (indice < 0) return delayErro('Produto não encontrado.');

    mockProdutos[indice] = {
      ...mockProdutos[indice],
      ativo: false,
      motivoSituacaoId: payload.motivoId,
      justificativaSituacao: payload.justificativa,
    };

    return delay(mockProdutos[indice]);
  },

  ativarProduto(payload: AtivarProdutoPayload): Promise<Produto> {
    const indice = mockProdutos.findIndex(p => p.id === payload.id);

    if (indice < 0) return delayErro('Produto não encontrado.');

    mockProdutos[indice] = {
      ...mockProdutos[indice],
      ativo: true,
      motivoSituacaoId: payload.motivoId,
      justificativaSituacao: payload.justificativa,
    };

    return delay(mockProdutos[indice]);
  },

  inativarAutomaticamente(): Promise<Produto[]> {
    return delay([]);
  },
};
