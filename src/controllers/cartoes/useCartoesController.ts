/**
 * [CONTROLLER] useCartoesController
 *
 * O QUE FAZ: conduz a gestão dos cartões de crédito do cliente.
 *
 * COMO FARÁ: `useQuery` ['cartoes', clienteId] mais mutations de criar,
 * alterar, remover e definir preferencial. Valida os campos da RN0024
 * (número, nome impresso, bandeira e código de segurança) e recusa
 * bandeira fora das cadastradas no sistema (RN0025). Garante que sempre
 * exista exatamente um cartão preferencial (RF0027).
 *
 * ATENDE: RF0027, RN0024, RN0025
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { cartoesService } from '@/service/cartoes/service';
import {
  AlterarCartaoPayload,
  CriarCartaoPayload,
} from '@/types/cartoes/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useCartoesController = (clienteId?: number) => {
  const queryClient = useQueryClient();
  const { registrar } = useLogTransacaoController();

  const {
    data: cartoes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cartoes', clienteId],
    queryFn: () => cartoesService.fetchCartoesPorCliente(),
    enabled: !!clienteId,
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['cartoes', clienteId] });
    queryClient.invalidateQueries({ queryKey: ['clientes', clienteId] });
  };

  const { mutate: criar, isPending: criando } = useMutation({
    mutationFn: (payload: Omit<CriarCartaoPayload, 'clienteId'>) => {
      if (!clienteId) {
        return Promise.reject(
          new Error('É necessário estar logado para cadastrar um cartão.'),
        );
      }

      // RN0025: o service confere a bandeira contra as cadastradas.
      return cartoesService.criarCartao({ ...payload, clienteId });
    },
    onSuccess: cartao => {
      registrar({
        entidade: 'Cartao',
        entidadeId: cartao.id,
        operacao: 'INSERCAO',
      });
      invalidar();
      handleSuccess('Cartão adicionado ao seu perfil.');
    },
    onError: handleError,
  });

  const { mutate: alterar, isPending: alterando } = useMutation({
    mutationFn: (payload: AlterarCartaoPayload) =>
      cartoesService.alterarCartao(payload),
    onSuccess: () => {
      invalidar();
      handleSuccess('Cartão atualizado.');
    },
    onError: handleError,
  });

  const { mutate: remover, isPending: removendo } = useMutation({
    mutationFn: (id: number) => cartoesService.removerCartao(id),
    onSuccess: () => {
      invalidar();
      handleSuccess('Cartão removido.');
    },
    onError: handleError,
  });

  // RF0027: definir um preferencial desmarca os demais no service.
  const { mutate: definirPreferencial, isPending: definindo } = useMutation({
    mutationFn: (id: number) => cartoesService.definirPreferencial(id),
    onSuccess: () => {
      invalidar();
      handleSuccess('Cartão preferencial atualizado.');
    },
    onError: handleError,
  });

  return {
    cartoes,
    cartaoPreferencial: cartoes.find(c => c.preferencial),
    isLoading,
    isError,
    criar,
    alterar,
    remover,
    definirPreferencial,
    isPending: criando || alterando || removendo || definindo,
  };
};
