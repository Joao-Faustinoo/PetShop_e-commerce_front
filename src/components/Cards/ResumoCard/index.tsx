/**
 * [VIEW] ResumoCard
 *
 * O QUE FAZ: cartão de resumo de valores, usado no carrinho e no checkout.
 *
 * COMO FARÁ: recebe subtotal, frete, desconto de cupons e total, formatando tudo em
 * real. No checkout, mostra também quanto ainda falta cobrir para a compra
 * poder ser finalizada.
 *
 * ATENDE: RF0032, RF0034, RF0037
 */

'use client';

import { ReactNode } from 'react';

import { formatCurrency } from '@/utils/formatCurrency';

import * as S from './styles';

interface ResumoCardProps {
  subtotal: number;
  frete?: number;
  /** RF0037: quanto dos cupons foi efetivamente consumido na compra. */
  desconto?: number;
  total: number;
  /** Sobra dos cupons que virará um novo cupom de troca (RN0036). */
  troco?: number;
  /** Só no checkout: o que ainda falta para o pagamento cobrir o total. */
  valorPendente?: number;
  acoes?: ReactNode;
}

const ResumoCard = ({
  subtotal,
  frete,
  desconto = 0,
  total,
  troco = 0,
  valorPendente,
  acoes,
}: ResumoCardProps) => {
  return (
    <S.Card>
      <h3>Resumo</h3>

      <S.Linha>
        Subtotal <span>{formatCurrency(subtotal)}</span>
      </S.Linha>

      {frete !== undefined && (
        <S.Linha>
          Frete
          <span>{frete > 0 ? formatCurrency(frete) : 'A calcular'}</span>
        </S.Linha>
      )}

      <S.Total>
        Total <span>{formatCurrency(total)}</span>
      </S.Total>

      {/*
        O cupom é forma de pagamento, não desconto no preço: o Total
        continua sendo o valor da compra e o cupom abate o que ainda
        precisa ir para o cartão. Por isso estas duas linhas vêm depois
        do Total — antes dele, pareciam um desconto que não bateu.
      */}
      {desconto > 0 && (
        <>
          <S.Linha $destaque>
            Pago em cupons <span>- {formatCurrency(desconto)}</span>
          </S.Linha>

          <S.Linha>
            Restante no cartão <span>{formatCurrency(total - desconto)}</span>
          </S.Linha>
        </>
      )}

      {/* RN0036: a sobra dos cupons volta ao cliente como cupom de troca. */}
      {troco > 0 && (
        <S.Pendente>
          Sobra de <strong>{formatCurrency(troco)}</strong> em cupons: será
          gerado um novo cupom de troca ao finalizar a compra.
        </S.Pendente>
      )}

      {valorPendente !== undefined && valorPendente > 0 && (
        <S.Pendente>
          Falta cobrir <strong>{formatCurrency(valorPendente)}</strong> para
          finalizar a compra.
        </S.Pendente>
      )}

      {acoes && <S.Acoes>{acoes}</S.Acoes>}
    </S.Card>
  );
};

export default ResumoCard;
