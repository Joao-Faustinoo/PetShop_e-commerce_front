/**
 * [VIEW] PedidoCard
 *
 * O QUE FAZ: cartão de pedido usado nas listagens do cliente e do administrador.
 *
 * COMO FARÁ: recebe um Pedido por prop e exibe número, data, quantidade de itens,
 * total e o StatusBadge. Recebe também as ações disponíveis por prop, para
 * o mesmo cartão servir às duas visões.
 *
 * ATENDE: RF0025, RF0039, RF0040, RF0041
 */

'use client';

import { ReactNode } from 'react';

import StatusBadge from '@/components/Cards/StatusBadge';
import { Pedido } from '@/types/pedidos/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

import * as S from './styles';

interface PedidoCardProps {
  pedido: Pedido;
  /** Cada visão injeta os seus botões: admin despacha, cliente troca. */
  acoes?: ReactNode;
  /** O admin precisa ver de quem é o pedido; o cliente, não. */
  mostrarCliente?: boolean;
}

const PedidoCard = ({
  pedido,
  acoes,
  mostrarCliente = false,
}: PedidoCardProps) => {
  const quantidadeItens = pedido.itens.reduce(
    (soma, item) => soma + item.quantidade,
    0,
  );

  return (
    <S.Card>
      <S.Topo>
        <S.Identificacao>
          <strong>{pedido.numero}</strong>
          <small>
            {formatDate(pedido.dataCompra)} · {quantidadeItens} item(ns)
            {mostrarCliente && ` · ${pedido.clienteNome}`}
          </small>
        </S.Identificacao>

        <StatusBadge status={pedido.status} />
      </S.Topo>

      <S.Itens>
        {pedido.itens.map(item => (
          <li key={item.produtoId}>
            {item.quantidade}× {item.produtoNome}
            <span>{formatCurrency(item.subtotal)}</span>
          </li>
        ))}
      </S.Itens>

      <S.Rodape>
        <S.Total>
          Total (com frete)
          <strong>{formatCurrency(pedido.total)}</strong>
        </S.Total>

        {acoes && <S.Acoes>{acoes}</S.Acoes>}
      </S.Rodape>
    </S.Card>
  );
};

export default PedidoCard;
