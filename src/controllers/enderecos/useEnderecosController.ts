/**
 * [CONTROLLER] useEnderecosController
 *
 * O QUE FAZ: conduz a gestão dos endereços do cliente, isolada do resto
 * do cadastro.
 *
 * COMO FARÁ: `useQuery` ['enderecos', clienteId] mais mutations de criar,
 * alterar e remover. Por ser um controller próprio, a View consegue
 * alterar ou adicionar endereço sem abrir o formulário completo do
 * cliente, que é justamente o que a RNF0034 pede. Impede a remoção do
 * último endereço de cobrança (RN0021) ou de entrega (RN0022), devolvendo
 * o erro para o toast.
 *
 * ATENDE: RF0026, RN0021, RN0022, RN0023, RNF0034
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { enderecosService } from '@/service/enderecos/service';
import {
  AlterarEnderecoPayload,
  CriarEnderecoPayload,
} from '@/types/enderecos/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useEnderecosController = (clienteId?: number) => {
  const queryClient = useQueryClient();
  const { registrar } = useLogTransacaoController();

  const {
    data: enderecos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['enderecos', clienteId],
    queryFn: () =>
      enderecosService.fetchEnderecosPorCliente(),
    enabled: !!clienteId,
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['enderecos', clienteId] });
    queryClient.invalidateQueries({ queryKey: ['clientes', clienteId] });
    // O frete depende do endereço escolhido.
    queryClient.invalidateQueries({ queryKey: ['frete'] });
  };

  const { mutate: criar, isPending: criando } = useMutation({
    mutationFn: (payload: Omit<CriarEnderecoPayload, 'clienteId'>) => {
      if (!clienteId) {
        return Promise.reject(
          new Error('É necessário estar logado para cadastrar um endereço.'),
        );
      }

      return enderecosService.criarEndereco({ ...payload, clienteId });
    },
    onSuccess: endereco => {
      registrar({
        entidade: 'Endereco',
        entidadeId: endereco.id,
        operacao: 'INSERCAO',
      });
      invalidar();
      handleSuccess(`Endereço "${endereco.apelido}" adicionado.`);
    },
    onError: handleError,
  });

  const { mutate: alterar, isPending: alterando } = useMutation({
    mutationFn: (payload: AlterarEnderecoPayload) =>
      enderecosService.alterarEndereco(payload),
    onSuccess: endereco => {
      registrar({
        entidade: 'Endereco',
        entidadeId: endereco.id,
        operacao: 'ALTERACAO',
        antes: enderecos.find(e => e.id === endereco.id) as unknown as Record<
          string,
          unknown
        >,
        depois: endereco as unknown as Record<string, unknown>,
      });
      invalidar();
      handleSuccess(`Endereço "${endereco.apelido}" atualizado.`);
    },
    onError: handleError,
  });

  // RN0021/RN0022: o service recusa a remoção do último de cada tipo, e
  // a mensagem sobe direto para o toast.
  const { mutate: remover, isPending: removendo } = useMutation({
    mutationFn: (id: number) => enderecosService.removerEndereco(id),
    onSuccess: () => {
      invalidar();
      handleSuccess('Endereço removido.');
    },
    onError: handleError,
  });

  return {
    enderecos,
    enderecosEntrega: enderecos.filter(e => e.tipo === 'ENTREGA'),
    enderecosCobranca: enderecos.filter(e => e.tipo === 'COBRANCA'),
    isLoading,
    isError,
    criar,
    alterar,
    remover,
    isPending: criando || alterando || removendo,
  };
};
