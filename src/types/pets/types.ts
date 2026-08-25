/**
 * [MODEL] Tipos de pet
 *
 * O QUE FAZ: descreve o pet vinculado ao cliente, usado depois pela
 * recomendação de tamanhos e pelo chatbot.
 *
 * COMO FARÁ: exporta `Pet` (id, clienteId obrigatório, nome, especie,
 * raca, porte e peso) conforme o mínimo exigido pela RN0029, além de
 * `CriarPetPayload` e `AlterarPetPayload`.
 *
 * ATENDE: RF0028, RF0029, RN0029, RNF0047
 */

import { Especie, PorteSigla } from '@/types/dominios/types';

export interface Pet {
  id: number;
  /** RN0029: todo pet pertence obrigatoriamente a um cliente. */
  clienteId: number;
  nome: string;
  especie: Especie;
  raca: string;
  porte: PorteSigla;
  peso: number;
}

export interface CriarPetPayload extends Omit<Pet, 'id'> {}

export interface AlterarPetPayload extends Pet {}
