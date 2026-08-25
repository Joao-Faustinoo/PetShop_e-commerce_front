/**
 * [MODEL] Tipos de cliente
 *
 * O QUE FAZ: descreve o cadastro do cliente, seus filtros de consulta e os
 * payloads de criação/alteração/inativação.
 *
 * COMO FARÁ: exporta `Cliente` com os dados obrigatórios da RN0026 (gênero,
 * nome, data de nascimento, CPF, telefone com tipo, DDD e número, e e-mail),
 * mais `codigo` único (RNF0035), `ranking` numérico (RN0027), `ativo`,
 * `enderecos`, `cartoes` e `pets`. Não há campo de senha — removido
 * pelas premissas do login mockado. Exporta ainda `ClienteFiltros`,
 * `CriarClientePayload`, `AlterarClientePayload` e `InativarClientePayload`.
 *
 * ATENDE: RF0021-RF0025, RNF0035, RN0026, RN0027
 */

import { Cartao } from '@/types/cartoes/types';
import { Endereco } from '@/types/enderecos/types';
import { Pet } from '@/types/pets/types';

export type Genero = 'MASCULINO' | 'FEMININO' | 'OUTRO';

/** RN0026: o telefone é composto por tipo, DDD e número. */
export interface Telefone {
  tipoId: number;
  ddd: string;
  numero: string;
}

export interface Cliente {
  id: number;
  /** RNF0035: código único do cliente no sistema. */
  codigo: string;
  nome: string;
  genero: Genero;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: Telefone;
  /** RN0027: ranking numérico calculado a partir do perfil de compras. */
  ranking: number;
  ativo: boolean;
  /** RN0021/RN0022: ao menos um de cobrança e um de entrega. */
  enderecos: Endereco[];
  cartoes: Cartao[];
  pets: Pet[];
  justificativaInativacao?: string;
}

/**
 * Registro-base do cliente. As coleções (endereços, cartões e pets) vivem
 * em seus próprios mocks/services e são compostas na leitura, para que uma
 * inclusão feita pela tela de perfil apareça imediatamente no cliente.
 */
export type ClienteBase = Omit<Cliente, 'enderecos' | 'cartoes' | 'pets'>;

/** RF0024: qualquer campo identificador pode filtrar, isolado ou combinado. */
export interface ClienteFiltros {
  nome?: string;
  codigo?: string;
  cpf?: string;
  email?: string;
  genero?: Genero;
  rankingMinimo?: number;
  ativo?: boolean;
}

export interface CriarClientePayload {
  nome: string;
  genero: Genero;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: Telefone;
  /** RN0021/RN0022: enviados juntos no cadastro inicial. */
  enderecoCobranca: Omit<Endereco, 'id' | 'clienteId'>;
  enderecoEntrega: Omit<Endereco, 'id' | 'clienteId'>;
}

export interface AlterarClientePayload {
  id: number;
  nome: string;
  genero: Genero;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: Telefone;
}

export interface InativarClientePayload {
  id: number;
  justificativa: string;
}
