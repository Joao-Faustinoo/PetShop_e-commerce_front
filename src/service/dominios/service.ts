/**
 * [MODEL] Service das tabelas de domínio
 *
 * O QUE FAZ: entrega as listas de domínio que alimentam todos os selects
 * de cadastro do sistema.
 *
 * COMO FARÁ: expõe uma função de leitura por tabela — `fetchCategorias`,
 * `fetchMarcas`, `fetchEspecies`, `fetchPortes`, `fetchCores`,
 * `fetchMateriais`, `fetchFornecedores`, `fetchBandeiras`,
 * `fetchGruposPrecificacao`, `fetchMotivosInativacao`,
 * `fetchMotivosAtivacao` — todas devolvendo o mock correspondente através
 * do `delay`. São dados estáveis, então o controller as consome com
 * staleTime alto.
 *
 * ATENDE: RNF0013, RN0023, RN0025
 */

import {
  mockBandeiras,
  mockCategorias,
  mockCores,
  mockEspecies,
  mockFornecedores,
  mockGruposPrecificacao,
  mockMarcas,
  mockMateriais,
  mockMotivosAtivacao,
  mockMotivosInativacao,
  mockPortes,
  mockTiposLogradouro,
  mockTiposResidencia,
  mockTiposTelefone,
} from '@/mock/dominios/mock';
import { delay } from '@/service/api/delay';
import {
  BandeiraCartao,
  Categoria,
  Cor,
  Dominios,
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

// Domínios são estáveis: latência curta, pois não custam consulta real.
const LATENCIA = 150;

export const dominiosService = {
  fetchGruposPrecificacao: (): Promise<GrupoPrecificacao[]> =>
    delay(mockGruposPrecificacao, LATENCIA),

  fetchMarcas: (): Promise<Marca[]> => delay(mockMarcas, LATENCIA),

  fetchCategorias: (): Promise<Categoria[]> => delay(mockCategorias, LATENCIA),

  fetchEspecies: (): Promise<{ value: Especie; label: string }[]> =>
    delay(mockEspecies, LATENCIA),

  fetchPortes: (): Promise<Porte[]> => delay(mockPortes, LATENCIA),

  fetchCores: (): Promise<Cor[]> => delay(mockCores, LATENCIA),

  fetchMateriais: (): Promise<Material[]> => delay(mockMateriais, LATENCIA),

  fetchFornecedores: (): Promise<Fornecedor[]> =>
    delay(mockFornecedores, LATENCIA),

  fetchBandeiras: (): Promise<BandeiraCartao[]> =>
    delay(mockBandeiras, LATENCIA),

  fetchTiposResidencia: (): Promise<TipoResidencia[]> =>
    delay(mockTiposResidencia, LATENCIA),

  fetchTiposLogradouro: (): Promise<TipoLogradouro[]> =>
    delay(mockTiposLogradouro, LATENCIA),

  fetchTiposTelefone: (): Promise<TipoTelefone[]> =>
    delay(mockTiposTelefone, LATENCIA),

  fetchMotivosInativacao: (): Promise<MotivoInativacao[]> =>
    delay(mockMotivosInativacao, LATENCIA),

  fetchMotivosAtivacao: (): Promise<MotivoAtivacao[]> =>
    delay(mockMotivosAtivacao, LATENCIA),

  /** Usada pela tela de manutenção de domínios do admin (RNF0013). */
  fetchTodos: (): Promise<Dominios> =>
    delay(
      {
        gruposPrecificacao: mockGruposPrecificacao,
        marcas: mockMarcas,
        categorias: mockCategorias,
        portes: mockPortes,
        cores: mockCores,
        materiais: mockMateriais,
        fornecedores: mockFornecedores,
        bandeiras: mockBandeiras,
        tiposResidencia: mockTiposResidencia,
        tiposLogradouro: mockTiposLogradouro,
        tiposTelefone: mockTiposTelefone,
        motivosInativacao: mockMotivosInativacao,
        motivosAtivacao: mockMotivosAtivacao,
      },
      LATENCIA,
    ),
};
