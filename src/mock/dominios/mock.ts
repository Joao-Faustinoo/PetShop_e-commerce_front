/**
 * [MODEL] Mock das tabelas de domínio
 *
 * O QUE FAZ: substitui o script de implantação exigido pela RNF0013,
 * entregando todas as listas de domínio já populadas.
 *
 * COMO FARÁ: exporta `mockGruposPrecificacao` (com margens de lucro
 * distintas para a RN0013 poder calcular o valor de venda),
 * `mockMarcas`, `mockCategorias` (roupa, acessório, coleira, brinquedo,
 * cama), `mockEspecies`, `mockPortes` (PP a GG com faixa de peso),
 * `mockCores`, `mockMateriais`, `mockFornecedores`, `mockBandeiras`,
 * `mockTiposResidencia`, `mockTiposLogradouro`, `mockTiposTelefone`,
 * `mockMotivosInativacao` (incluindo FORA DE LINHA, usado pela RN0016) e
 * `mockMotivosAtivacao`.
 *
 * ATENDE: RNF0013, RN0013, RN0016, RN0023, RN0025
 */

import {
  BandeiraCartao,
  Categoria,
  Cor,
  Especie,
  Fornecedor,
  GrupoPrecificacao,
  Marca,
  Material,
  MotivoAtivacao,
  MotivoInativacao,
  Porte,
  TipoLogradouro,
  TipoResidencia,
  TipoTelefone,
} from '@/types/dominios/types';

/** RN0013: a margem de cada grupo define o valor de venda do produto. */
export const mockGruposPrecificacao: GrupoPrecificacao[] = [
  { id: 1, nome: 'Básico', margemLucro: 40 },
  { id: 2, nome: 'Premium', margemLucro: 80 },
  { id: 3, nome: 'Promocional', margemLucro: 20 },
  { id: 4, nome: 'Luxo', margemLucro: 120 },
];

export const mockMarcas: Marca[] = [
  { id: 1, nome: 'PetChic' },
  { id: 2, nome: 'AuMiau' },
  { id: 3, nome: 'DogStyle' },
  { id: 4, nome: 'CatComfort' },
  { id: 5, nome: 'Pata Nobre' },
  { id: 6, nome: 'Bicho Feliz' },
];

export const mockCategorias: Categoria[] = [
  { id: 1, nome: 'Roupa' },
  { id: 2, nome: 'Acessório' },
  { id: 3, nome: 'Coleira' },
  { id: 4, nome: 'Brinquedo' },
  { id: 5, nome: 'Cama' },
];

export const mockEspecies: { value: Especie; label: string }[] = [
  { value: 'CAO', label: 'Cão' },
  { value: 'GATO', label: 'Gato' },
  { value: 'OUTRO', label: 'Outro' },
];

export const mockPortes: Porte[] = [
  { id: 1, sigla: 'PP', nome: 'PP (até 3 kg)', pesoMinimo: 0, pesoMaximo: 3 },
  { id: 2, sigla: 'P', nome: 'P (3 a 7 kg)', pesoMinimo: 3, pesoMaximo: 7 },
  { id: 3, sigla: 'M', nome: 'M (7 a 15 kg)', pesoMinimo: 7, pesoMaximo: 15 },
  { id: 4, sigla: 'G', nome: 'G (15 a 30 kg)', pesoMinimo: 15, pesoMaximo: 30 },
  {
    id: 5,
    sigla: 'GG',
    nome: 'GG (30 a 70 kg)',
    pesoMinimo: 30,
    pesoMaximo: 70,
  },
];

export const mockCores: Cor[] = [
  { id: 1, nome: 'Vermelho' },
  { id: 2, nome: 'Azul' },
  { id: 3, nome: 'Preto' },
  { id: 4, nome: 'Rosa' },
  { id: 5, nome: 'Cinza' },
  { id: 6, nome: 'Verde' },
  { id: 7, nome: 'Bege' },
];

export const mockMateriais: Material[] = [
  { id: 1, nome: 'Algodão' },
  { id: 2, nome: 'Poliéster' },
  { id: 3, nome: 'Nylon' },
  { id: 4, nome: 'Couro sintético' },
  { id: 5, nome: 'Lã' },
  { id: 6, nome: 'Silicone' },
];

export const mockFornecedores: Fornecedor[] = [
  { id: 1, nome: 'Distribuidora PetBrasil', cnpj: '12.345.678/0001-90' },
  { id: 2, nome: 'Importadora AnimalWear', cnpj: '98.765.432/0001-10' },
  { id: 3, nome: 'Tecidos & Cia', cnpj: '45.678.912/0001-33' },
];

/** RN0025: só cartões destas bandeiras podem ser cadastrados. */
export const mockBandeiras: BandeiraCartao[] = [
  { id: 1, nome: 'Visa' },
  { id: 2, nome: 'Mastercard' },
  { id: 3, nome: 'Elo' },
  { id: 4, nome: 'American Express' },
  { id: 5, nome: 'Hipercard' },
];

export const mockTiposResidencia: TipoResidencia[] = [
  { id: 1, nome: 'Casa' },
  { id: 2, nome: 'Apartamento' },
  { id: 3, nome: 'Condomínio' },
  { id: 4, nome: 'Comercial' },
];

export const mockTiposLogradouro: TipoLogradouro[] = [
  { id: 1, nome: 'Rua' },
  { id: 2, nome: 'Avenida' },
  { id: 3, nome: 'Travessa' },
  { id: 4, nome: 'Alameda' },
  { id: 5, nome: 'Praça' },
  { id: 6, nome: 'Rodovia' },
];

export const mockTiposTelefone: TipoTelefone[] = [
  { id: 1, nome: 'Celular' },
  { id: 2, nome: 'Residencial' },
  { id: 3, nome: 'Comercial' },
];

/** RN0016: o id 1 (FORA DE LINHA) é o motivo da inativação automática. */
export const MOTIVO_FORA_DE_LINHA = 1;

export const mockMotivosInativacao: MotivoInativacao[] = [
  { id: MOTIVO_FORA_DE_LINHA, nome: 'FORA DE LINHA' },
  { id: 2, nome: 'Baixa procura' },
  { id: 3, nome: 'Problema de qualidade' },
  { id: 4, nome: 'Fornecedor descontinuado' },
];

export const mockMotivosAtivacao: MotivoAtivacao[] = [
  { id: 1, nome: 'Reposição de estoque' },
  { id: 2, nome: 'Retorno de linha' },
  { id: 3, nome: 'Nova coleção' },
];
