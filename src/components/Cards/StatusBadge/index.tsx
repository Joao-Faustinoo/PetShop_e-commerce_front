/**
 * [VIEW] StatusBadge
 *
 * O QUE FAZ: selo colorido que traduz o status do pedido ou da troca.
 *
 * COMO FARÁ: recebe o StatusPedido ou StatusTroca e devolve o rótulo em português com
 * a cor correspondente, centralizando num único lugar o mapeamento dos
 * oito estados do fluxo de vendas.
 *
 * ATENDE: RF0038-RF0045
 */

'use client';

import { useTheme } from 'styled-components';

import { ROTULO_STATUS, StatusPedido } from '@/types/pedidos/types';
import { StatusTroca } from '@/types/trocas/types';

import * as S from './styles';

interface StatusBadgeProps {
  /** StatusTroca é um subconjunto de StatusPedido, então um tipo cobre os dois. */
  status: StatusPedido | StatusTroca;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const theme = useTheme();

  return <S.Badge $cor={theme.status[status]}>{ROTULO_STATUS[status]}</S.Badge>;
};

export default StatusBadge;
