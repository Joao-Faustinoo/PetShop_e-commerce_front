/**
 * [MODEL] Service de pets
 *
 * O QUE FAZ: expõe o CRUD dos pets vinculados a um cliente.
 *
 * COMO FARÁ: chama a API. O cadastro e a listagem pendem da rota do
 * cliente — `/clientes/:clienteId/pets` —, porque a RN0029 amarra o pet a
 * um dono: ele não existe solto. Alterar e remover usam `/pets/:id`, já
 * que aí o pet existe e o id basta.
 *
 * As regras saíram daqui: quem confere o vínculo, os campos mínimos e a
 * posse do pet é o servidor.
 *
 * ATENDE: RF0028, RF0029, RN0029
 */

import { api } from '@/service/api/request';
import { AlterarPetPayload, CriarPetPayload, Pet } from '@/types/pets/types';

export const petsService = {
  fetchPetsPorCliente(clienteId: number): Promise<Pet[]> {
    return api<Pet[]>(`/clientes/${clienteId}/pets`);
  },

  criarPet(payload: CriarPetPayload): Promise<Pet> {
    const { clienteId, ...dados } = payload;

    return api<Pet>(`/clientes/${clienteId}/pets`, {
      method: 'POST',
      body: dados,
    });
  },

  alterarPet(payload: AlterarPetPayload): Promise<Pet> {
    const { id, clienteId: _clienteId, ...dados } = payload;

    return api<Pet>(`/pets/${id}`, { method: 'PUT', body: dados });
  },

  async removerPet(id: number): Promise<void> {
    await api<void>(`/pets/${id}`, { method: 'DELETE' });
  },
};
