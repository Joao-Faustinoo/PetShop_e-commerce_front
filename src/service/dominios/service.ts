/**
 * [MODEL] Service das tabelas de domínio
 *
 * O QUE FAZ: entrega as listas de domínio que alimentam todos os selects
 * de cadastro do sistema.
 *
 * COMO FARÁ: a API devolve as treze tabelas numa resposta só, em
 * `GET /dominios`. O service busca uma vez e guarda a promessa: as catorze
 * funções de leitura recortam esse mesmo resultado, em vez de cada uma
 * disparar a sua requisição. São dados estáveis — o controller já as
 * consome com `staleTime` infinito —, e catorze idas à rede para montar os
 * selects de uma tela seria desperdício visível.
 *
 * ATENDE: RNF0013, RN0023, RN0025
 */

import { api } from '@/service/api/request';
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

/**
 * A espécie não é tabela do banco: é um enum do schema, e o que varia é só
 * o rótulo exibido. Fica aqui porque é dado de interface, não de domínio.
 */
const ESPECIES: { value: Especie; label: string }[] = [
  { value: 'CAO', label: 'Cão' },
  { value: 'GATO', label: 'Gato' },
  { value: 'OUTRO', label: 'Outro' },
];

/**
 * A busca em andamento ou já concluída. Guardar a promessa, e não o
 * resultado, faz com que chamadas simultâneas compartilhem a mesma
 * requisição em vez de dispararem várias.
 */
let emCache: Promise<Dominios> | undefined;

const todos = (): Promise<Dominios> => {
  if (!emCache) {
    emCache = api<Dominios>('/dominios').catch(erro => {
      // Uma promessa rejeitada em cache nunca mais deixaria tentar de novo.
      emCache = undefined;
      throw erro;
    });
  }

  return emCache;
};

const recortar = <K extends keyof Dominios>(chave: K): Promise<Dominios[K]> =>
  todos().then(d => d[chave]);

export const dominiosService = {
  fetchGruposPrecificacao: (): Promise<GrupoPrecificacao[]> =>
    recortar('gruposPrecificacao'),

  fetchMarcas: (): Promise<Marca[]> => recortar('marcas'),

  fetchCategorias: (): Promise<Categoria[]> => recortar('categorias'),

  fetchEspecies: (): Promise<{ value: Especie; label: string }[]> =>
    Promise.resolve(ESPECIES),

  fetchPortes: (): Promise<Porte[]> => recortar('portes'),

  fetchCores: (): Promise<Cor[]> => recortar('cores'),

  fetchMateriais: (): Promise<Material[]> => recortar('materiais'),

  fetchFornecedores: (): Promise<Fornecedor[]> => recortar('fornecedores'),

  fetchBandeiras: (): Promise<BandeiraCartao[]> => recortar('bandeiras'),

  fetchTiposResidencia: (): Promise<TipoResidencia[]> =>
    recortar('tiposResidencia'),

  fetchTiposLogradouro: (): Promise<TipoLogradouro[]> =>
    recortar('tiposLogradouro'),

  fetchTiposTelefone: (): Promise<TipoTelefone[]> => recortar('tiposTelefone'),

  fetchMotivosInativacao: (): Promise<MotivoInativacao[]> =>
    recortar('motivosInativacao'),

  fetchMotivosAtivacao: (): Promise<MotivoAtivacao[]> =>
    recortar('motivosAtivacao'),

  /** Usada pela tela de manutenção de domínios do admin (RNF0013). */
  fetchTodos: (): Promise<Dominios> => todos(),
};
