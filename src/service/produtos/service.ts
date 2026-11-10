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
  // Administração de produto (RF0011, RF0012, RF0014, RF0016)
  // -------------------------------------------------------------------

  /** RF0011: o SKU e o valor de venda são decididos pelo servidor. */
  criarProduto(payload: CriarProdutoPayload): Promise<Produto> {
    return api<Produto>('/produtos', { method: 'POST', body: payload });
  },

  /** RF0014. A RN0014 é conferida no servidor, com a autorização junto. */
  alterarProduto(payload: AlterarProdutoPayload): Promise<Produto> {
    const { id, ...dados } = payload;

    return api<Produto>(`/produtos/${id}`, { method: 'PUT', body: dados });
  },

  /** RF0012 e RN0015: inativar pede motivo e justificativa. */
  inativarProduto(payload: InativarProdutoPayload): Promise<Produto> {
    const { id, motivoId, justificativa } = payload;

    return api<Produto>(`/produtos/${id}/situacao`, {
      method: 'PATCH',
      body: { ativo: false, motivoId, justificativa },
    });
  },

  /** RF0016 e RN0017: ativar pede motivo e justificativa também. */
  ativarProduto(payload: AtivarProdutoPayload): Promise<Produto> {
    const { id, motivoId, justificativa } = payload;

    return api<Produto>(`/produtos/${id}/situacao`, {
      method: 'PATCH',
      body: { ativo: true, motivoId, justificativa },
    });
  },
};
