/**
 * [MODEL] Tipos das tabelas de domínio
 *
 * O QUE FAZ: tipa todas as listas de domínio que o sistema precisa ter
 * pré-carregadas para alimentar selects de cadastro.
 *
 * COMO FARÁ: exporta `GrupoPrecificacao` (nome + margem de lucro em %),
 * `Marca`, `Categoria`, `Especie` (CAO, GATO ou OUTRO), `Porte`
 * (PP, P, M, G, GG + faixa de peso), `Cor`, `Material`,
 * `Fornecedor`, `BandeiraCartao`, `TipoResidencia`, `TipoLogradouro`,
 * `TipoTelefone`, `MotivoInativacao` e `MotivoAtivacao`.
 *
 * ATENDE: RNF0013, RN0011, RN0013, RN0015, RN0016, RN0017, RN0023, RN0025
 */

/** Forma comum a toda tabela de domínio simples (id + nome). */
export interface Dominio {
  id: number;
  nome: string;
}

/** RN0013/RN0014: a margem é o percentual aplicado sobre o valor de custo. */
export interface GrupoPrecificacao extends Dominio {
  margemLucro: number;
}

export type Marca = Dominio;

export type Categoria = Dominio;

export type Especie = 'CAO' | 'GATO' | 'OUTRO';

export type PorteSigla = 'PP' | 'P' | 'M' | 'G' | 'GG';

export interface Porte extends Dominio {
  sigla: PorteSigla;
  pesoMinimo: number;
  pesoMaximo: number;
}

export type Cor = Dominio;

export type Material = Dominio;

export interface Fornecedor extends Dominio {
  cnpj: string;
}

export type BandeiraCartao = Dominio;

export type TipoResidencia = Dominio;

export type TipoLogradouro = Dominio;

export type TipoTelefone = Dominio;

/** RN0016: FORA DE LINHA é o motivo usado pela inativação automática. */
export type MotivoInativacao = Dominio;

export type MotivoAtivacao = Dominio;

/** Nome de cada tabela de domínio, para a tela de manutenção do admin. */
export type NomeDominio =
  | 'grupoPrecificacao'
  | 'marca'
  | 'categoria'
  | 'porte'
  | 'cor'
  | 'material'
  | 'fornecedor'
  | 'bandeiraCartao'
  | 'tipoResidencia'
  | 'tipoLogradouro'
  | 'tipoTelefone'
  | 'motivoInativacao'
  | 'motivoAtivacao';

export interface Dominios {
  gruposPrecificacao: GrupoPrecificacao[];
  marcas: Marca[];
  categorias: Categoria[];
  portes: Porte[];
  cores: Cor[];
  materiais: Material[];
  fornecedores: Fornecedor[];
  bandeiras: BandeiraCartao[];
  tiposResidencia: TipoResidencia[];
  tiposLogradouro: TipoLogradouro[];
  tiposTelefone: TipoTelefone[];
  motivosInativacao: MotivoInativacao[];
  motivosAtivacao: MotivoAtivacao[];
}
