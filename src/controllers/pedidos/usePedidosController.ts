/**
 * [CONTROLLER] usePedidosController
 *
 * O QUE FAZ: entrega a lista de pedidos — filtrada por status e período
 * na visão do admin, e restrita ao cliente logado na visão da loja.
 *
 * COMO FARÁ: `useQuery` com queryKey ['pedidos', filtros], chamando
 * `fetchPedidos` ou `fetchPedidosPorCliente` conforme o perfil vindo do
 * useAuth. Deriva, para cada pedido, quais ações a View pode oferecer:
 * despachar (só APROVADA), confirmar entrega (só EM_TRANSPORTE) e
 * solicitar troca (só ENTREGUE, pela RN0043).
 *
 * ATENDE: RF0025, RF0039, RF0040, RN0043
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { pedidosService } from '@/service/pedidos/service';
import { Pedido, PedidoFiltros } from '@/types/pedidos/types';

export interface PedidoComAcoes extends Pedido {
  /** RF0039: só compras aprovadas podem ser despachadas. */
  podeDespachar: boolean;
  /** RF0040: só compras em transporte podem ser confirmadas. */
  podeConfirmarEntrega: boolean;
  /** RN0043: só pedidos ENTREGUE aceitam solicitação de troca. */
  podeSolicitarTroca: boolean;
}

const derivarAcoes = (pedido: Pedido): PedidoComAcoes => ({
  ...pedido,
  podeDespachar: pedido.status === 'APROVADA',
  podeConfirmarEntrega: pedido.status === 'EM_TRANSPORTE',
  podeSolicitarTroca:
    pedido.status === 'ENTREGUE' &&
    // Itens já em troca não podem ser solicitados de novo.
    pedido.itens.some(item => !item.statusTroca),
});

export const usePedidosController = (filtros: PedidoFiltros = {}) => {
  const { user, isAdmin } = useAuth();

  // O cliente só enxerga os próprios pedidos; o admin, todos.
  const filtrosEfetivos: PedidoFiltros = isAdmin
    ? filtros
    : { ...filtros, clienteId: user?.clienteId };

  const {
    data: pedidos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['pedidos', filtrosEfetivos],
    queryFn: () => pedidosService.fetchPedidos(filtrosEfetivos),
    enabled: isAdmin || !!user?.clienteId,
  });

  return {
    pedidos: pedidos.map(derivarAcoes),
    total: pedidos.length,
    isLoading,
    isError,
  };
};

/** Detalhe de um pedido, com as mesmas ações derivadas. */
export const usePedidoController = (id?: number) => {
  const {
    data: pedido,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['pedidos', id],
    queryFn: () => pedidosService.fetchPedidoPorId(id as number),
    enabled: !!id,
  });

  return {
    pedido: pedido ? derivarAcoes(pedido) : undefined,
    isLoading,
    isError,
  };
};
