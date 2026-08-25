/**
 * [CONTROLLER] usePetsController
 *
 * O QUE FAZ: entrega os pets do cliente e conduz o cadastro, a alteração
 * e a remoção deles.
 *
 * COMO FARÁ: `useQuery` com queryKey ['pets', clienteId] e três
 * `useMutation` (criar, alterar, remover), todas invalidando a mesma
 * chave. Valida antes de enviar o mínimo exigido pela RN0029 — nome,
 * espécie, raça e porte/peso, sempre com um cliente associado. Os dados
 * daqui alimentam depois a recomendação de tamanho do assistente.
 *
 * ATENDE: RF0028, RF0029, RN0029, RNF0047
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { petsService } from '@/service/pets/service';
import { AlterarPetPayload, CriarPetPayload } from '@/types/pets/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const usePetsController = (clienteId?: number) => {
  const queryClient = useQueryClient();
  const { registrar } = useLogTransacaoController();

  const {
    data: pets = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['pets', clienteId],
    queryFn: () => petsService.fetchPetsPorCliente(clienteId as number),
    enabled: !!clienteId,
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['pets', clienteId] });
    // O pet aparece dentro do cadastro do cliente e no contexto do chat.
    queryClient.invalidateQueries({ queryKey: ['clientes', clienteId] });
    queryClient.invalidateQueries({ queryKey: ['chat'] });
  };

  const { mutate: criar, isPending: criando } = useMutation({
    mutationFn: (payload: Omit<CriarPetPayload, 'clienteId'>) => {
      // RN0029: sem cliente associado, o pet não pode ser criado.
      if (!clienteId) {
        return Promise.reject(
          new Error('É necessário estar logado para cadastrar um pet.'),
        );
      }

      return petsService.criarPet({ ...payload, clienteId });
    },
    onSuccess: pet => {
      registrar({ entidade: 'Pet', entidadeId: pet.id, operacao: 'INSERCAO' });
      invalidar();
      handleSuccess(`${pet.nome} foi adicionado ao seu perfil.`);
    },
    onError: handleError,
  });

  const { mutate: alterar, isPending: alterando } = useMutation({
    mutationFn: (payload: AlterarPetPayload) => petsService.alterarPet(payload),
    onSuccess: pet => {
      registrar({
        entidade: 'Pet',
        entidadeId: pet.id,
        operacao: 'ALTERACAO',
        antes: pets.find(p => p.id === pet.id) as unknown as Record<
          string,
          unknown
        >,
        depois: pet as unknown as Record<string, unknown>,
      });
      invalidar();
      handleSuccess(`Dados de ${pet.nome} atualizados.`);
    },
    onError: handleError,
  });

  const { mutate: remover, isPending: removendo } = useMutation({
    mutationFn: (id: number) => petsService.removerPet(id),
    onSuccess: () => {
      invalidar();
      handleSuccess('Pet removido do seu perfil.');
    },
    onError: handleError,
  });

  return {
    pets,
    isLoading,
    isError,
    criar,
    alterar,
    remover,
    isPending: criando || alterando || removendo,
  };
};
