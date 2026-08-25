/**
 * [CONTROLLER] useClientesController
 *
 * O QUE FAZ: entrega a lista de clientes filtrada para a consulta do
 * administrador.
 *
 * COMO FARÁ: recebe da View o termo de busca já debounced e o coloca na
 * queryKey (['clientes', filtros]), chamando
 * `clientesService.fetchClientes`. Os filtros são combináveis por
 * qualquer campo identificador, como exige a RF0024. Expõe também a
 * `useMutation` de inativação (RF0023), que atualiza a lista via
 * `setQueryData` sem refetch.
 *
 * ATENDE: RF0023, RF0024, RNF0011
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { clientesService } from '@/service/clientes/service';
import {
  Cliente,
  ClienteFiltros,
  InativarClientePayload,
} from '@/types/clientes/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useClientesController = (filtros: ClienteFiltros = {}) => {
  const queryClient = useQueryClient();
  const { registrar } = useLogTransacaoController();

  const {
    data: clientes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['clientes', filtros],
    queryFn: () => clientesService.fetchClientes(filtros),
  });

  /** Troca o cliente na lista em cache, sem refazer a consulta. */
  const atualizarNaLista = (cliente: Cliente) => {
    queryClient.setQueryData<Cliente[]>(['clientes', filtros], atual =>
      (atual ?? []).map(c => (c.id === cliente.id ? cliente : c)),
    );
  };

  const { mutate: inativar, isPending: inativando } = useMutation({
    mutationFn: (payload: InativarClientePayload) =>
      clientesService.inativarCliente(payload),
    onSuccess: cliente => {
      registrar({
        entidade: 'Cliente',
        entidadeId: cliente.id,
        operacao: 'ALTERACAO',
        antes: { ativo: true },
        depois: { ativo: false },
      });
      atualizarNaLista(cliente);
      queryClient.invalidateQueries({ queryKey: ['clientes', cliente.id] });
      handleSuccess(`Cliente ${cliente.codigo} inativado.`);
    },
    onError: handleError,
  });

  const { mutate: ativar, isPending: ativando } = useMutation({
    mutationFn: (id: number) => clientesService.ativarCliente(id),
    onSuccess: cliente => {
      registrar({
        entidade: 'Cliente',
        entidadeId: cliente.id,
        operacao: 'ALTERACAO',
        antes: { ativo: false },
        depois: { ativo: true },
      });
      atualizarNaLista(cliente);
      queryClient.invalidateQueries({ queryKey: ['clientes', cliente.id] });
      handleSuccess(`Cliente ${cliente.codigo} reativado.`);
    },
    onError: handleError,
  });

  return {
    clientes,
    total: clientes.length,
    isLoading,
    isError,
    inativar,
    ativar,
    isPending: inativando || ativando,
  };
};
