/**
 * [MODEL] Mock de pets
 *
 * O QUE FAZ: fornece os pets vinculados aos clientes, base para a
 * recomendação de tamanho e para o contexto do chatbot.
 *
 * COMO FARÁ: exporta `mockPets` com pets de espécies e portes diferentes,
 * todos com clienteId preenchido conforme exige a RN0029. O cliente de
 * id 1 tem ao menos dois pets, para a tela de perfil poder listar,
 * editar e remover.
 *
 * ATENDE: RF0028, RF0029, RN0029, RNF0047
 */

import { Pet } from '@/types/pets/types';

/** Mutável: o petsService inclui, altera e remove neste array. */
export const mockPets: Pet[] = [
  {
    id: 1,
    clienteId: 1,
    nome: 'Thor',
    especie: 'CAO',
    raca: 'Golden Retriever',
    porte: 'G',
    peso: 28,
  },
  {
    id: 2,
    clienteId: 1,
    nome: 'Mel',
    especie: 'GATO',
    raca: 'Siamês',
    porte: 'PP',
    peso: 3.5,
  },
  {
    id: 3,
    clienteId: 1,
    nome: 'Pipoca',
    especie: 'CAO',
    raca: 'Shih Tzu',
    porte: 'P',
    peso: 6.2,
  },
  {
    id: 4,
    clienteId: 2,
    nome: 'Bidu',
    especie: 'CAO',
    raca: 'Border Collie',
    porte: 'M',
    peso: 14,
  },
  {
    id: 5,
    clienteId: 3,
    nome: 'Nina',
    especie: 'GATO',
    raca: 'Persa',
    porte: 'P',
    peso: 4.8,
  },
  {
    id: 6,
    clienteId: 4,
    nome: 'Rex',
    especie: 'CAO',
    raca: 'Pastor Alemão',
    porte: 'GG',
    peso: 36,
  },
  {
    id: 7,
    clienteId: 5,
    nome: 'Amora',
    especie: 'CAO',
    raca: 'Poodle Toy',
    porte: 'PP',
    peso: 2.8,
  },
  {
    id: 8,
    clienteId: 7,
    nome: 'Frajola',
    especie: 'GATO',
    raca: 'Sem raça definida',
    porte: 'P',
    peso: 5.1,
  },
  {
    id: 9,
    clienteId: 8,
    nome: 'Kiwi',
    especie: 'OUTRO',
    raca: 'Coelho Mini Lop',
    porte: 'PP',
    peso: 1.9,
  },
];

export const proximoIdPet = (): number =>
  mockPets.reduce((maior, p) => Math.max(maior, p.id), 0) + 1;
