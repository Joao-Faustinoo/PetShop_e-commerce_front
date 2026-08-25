/**
 * [MODEL] Tipos de produto
 *
 * O QUE FAZ: descreve o produto (roupas e acessórios para pets), seus
 * filtros de consulta e os payloads de cadastro/alteração.
 *
 * COMO FARÁ: exporta `Produto` com todos os campos obrigatórios da RN0011
 * (marca, categorias, espécie de destino, porte/tamanho, cor, material,
 * nome, descrição, dimensões de altura, largura, peso e profundidade, e
 * código de barras), mais `sku` único (RNF0021), `ativo`,
 * `grupoPrecificacaoId`, `valorCusto`, `valorVenda` e `quantidadeEstoque`.
 * Exporta também `ProdutoFiltros` (todos os campos identificadores podem
 * filtrar, isolados ou combinados — RF0015), `CriarProdutoPayload`,
 * `AlterarProdutoPayload`, `InativarProdutoPayload` (motivo + justificativa)
 * e `AtivarProdutoPayload` (motivo + justificativa).
 *
 * ATENDE: RF0011-RF0016, RNF0021, RN0011-RN0017
 */

import { Especie, PorteSigla } from '@/types/dominios/types';

/** RN0011: dimensões são dado obrigatório do cadastro. */
export interface Dimensoes {
  altura: number;
  largura: number;
  peso: number;
  profundidade: number;
}

export interface Produto {
  id: number;
  /** RNF0021: código único do produto no sistema. */
  sku: string;
  nome: string;
  descricao: string;
  marcaId: number;
  /** RN0012: um produto pode estar associado a mais de uma categoria. */
  categoriaIds: number[];
  especie: Especie;
  porte: PorteSigla;
  corId: number;
  materialId: number;
  dimensoes: Dimensoes;
  codigoBarras: string;
  grupoPrecificacaoId: number;
  valorCusto: number;
  valorVenda: number;
  quantidadeEstoque: number;
  ativo: boolean;
  imagem?: string;
  /** RN0015-RN0017: rastro da última mudança de situação. */
  motivoSituacaoId?: number;
  justificativaSituacao?: string;
  /** Alimenta a inativação automática da RF0013. */
  totalVendido: number;
}

/** RF0015: todos os campos podem filtrar, isolados ou combinados (AND). */
export interface ProdutoFiltros {
  nome?: string;
  especie?: Especie;
  porte?: PorteSigla;
  marcaId?: number;
  categoriaId?: number;
  corId?: number;
  materialId?: number;
  precoMinimo?: number;
  precoMaximo?: number;
  ativo?: boolean;
}

export interface CriarProdutoPayload {
  nome: string;
  descricao: string;
  marcaId: number;
  categoriaIds: number[];
  especie: Especie;
  porte: PorteSigla;
  corId: number;
  materialId: number;
  dimensoes: Dimensoes;
  codigoBarras: string;
  grupoPrecificacaoId: number;
  valorCusto: number;
  imagem?: string;
}

export interface AlterarProdutoPayload extends CriarProdutoPayload {
  id: number;
  /** RN0014: só é aceito abaixo da margem com autorização do gerente. */
  valorVenda?: number;
  autorizacaoGerente?: boolean;
}

export interface InativarProdutoPayload {
  id: number;
  motivoId: number;
  justificativa: string;
}

export interface AtivarProdutoPayload {
  id: number;
  motivoId: number;
  justificativa: string;
}
