/**
 * [MODEL] Service de pets
 *
 * O QUE FAZ: expõe o CRUD dos pets vinculados a um cliente.
 *
 * COMO FARÁ: `fetchPetsPorCliente(clienteId)` filtra `mockPets` pelo
 * dono; `criarPet`, `alterarPet` e `removerPet` mutam o array em memória.
 * O clienteId é sempre obrigatório na criação, refletindo a RN0029 já na
 * camada de dados.
 *
 * ATENDE: RF0028, RF0029, RN0029
 */

import { mockPets, proximoIdPet } from '@/mock/pets/mock';
import { delay, delayErro } from '@/service/api/delay';
import { AlterarPetPayload, CriarPetPayload, Pet } from '@/types/pets/types';

export const petsService = {
  fetchPetsPorCliente(clienteId: number): Promise<Pet[]> {
    return delay(mockPets.filter(pet => pet.clienteId === clienteId));
  },

  criarPet(payload: CriarPetPayload): Promise<Pet> {
    // RN0029: sem dono, o pet não pode existir.
    if (!payload.clienteId) {
      return delayErro('O pet precisa estar associado a um cliente.');
    }

    const pet: Pet = { ...payload, id: proximoIdPet() };
    mockPets.push(pet);

    return delay(pet);
  },

  alterarPet(payload: AlterarPetPayload): Promise<Pet> {
    const indice = mockPets.findIndex(pet => pet.id === payload.id);

    if (indice < 0) {
      return delayErro('Pet não encontrado.');
    }

    mockPets[indice] = { ...mockPets[indice], ...payload };

    return delay(mockPets[indice]);
  },

  removerPet(id: number): Promise<void> {
    const indice = mockPets.findIndex(pet => pet.id === id);

    if (indice < 0) {
      return delayErro('Pet não encontrado.');
    }

    mockPets.splice(indice, 1);

    return delay(undefined);
  },
};
