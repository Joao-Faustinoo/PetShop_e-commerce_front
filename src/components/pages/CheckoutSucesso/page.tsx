/**
 * [VIEW] Tela: Compra finalizada
 *
 * O QUE FAZ: confirma a compra e informa o status inicial.
 *
 * COMO FARÁ: mostra o número do pedido, o status EM PROCESSAMENTO e o resumo dos itens,
 * com atalhos para o catálogo e para meus pedidos. Se a validação de
 * pagamento gerar cupom de troca por sobra de cupons, exibe o código.
 *
 * ATENDE: RF0038, RN0036, RN0038
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import StatusBadge from '@/components/Cards/StatusBadge';
import { usePedidoController } from '@/controllers/pedidos/usePedidosController';
import { formatCurrency } from '@/utils/formatCurrency';

import * as S from './styles';

const CheckoutSucesso = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = Number(searchParams.get('pedido'));

  const { pedido, isLoading } = usePedidoController(pedidoId || undefined);

  if (isLoading) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Carregando confirmação...</strong>
        </S.Vazio>
      </S.Container>
    );
  }

  if (!pedido) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Pedido não encontrado</strong>
          <p>Confira o histórico em Meus pedidos.</p>
          <SecondaryButton
            label="Ver meus pedidos"
            onClick={() => router.push('/meus-pedidos')}
          />
        </S.Vazio>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Confirmacao>
        <span aria-hidden>🎉</span>
        <h1>Compra registrada!</h1>
        <p>
          Seu pedido foi criado e a forma de pagamento já foi enviada para
          validação.
        </p>
        <strong>{pedido.numero}</strong>
        {/* RN0038: o status já reflete o retorno da validação. */}
        <StatusBadge status={pedido.status} />
      </S.Confirmacao>

      <S.Resumo>
        <S.TituloSecao>Resumo do pedido</S.TituloSecao>

        <S.Itens>
          {pedido.itens.map(item => (
            <li key={item.produtoId}>
              {item.quantidade}× {item.produtoNome}
              <span>{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
          <li>
            Frete
            <span>{formatCurrency(pedido.frete)}</span>
          </li>
        </S.Itens>

        <S.Total>
          Total pago
          <strong>{formatCurrency(pedido.total)}</strong>
        </S.Total>

        {/* RN0036: sobra dos cupons virou um novo cupom de troca. */}
        {pedido.cupomTrocoCodigo && (
          <S.Alerta $tipo="info">
            Como os cupons usados superaram o valor da compra, geramos o cupom{' '}
            <strong>{pedido.cupomTrocoCodigo}</strong> com a diferença. Ele já
            está disponível em Meus cupons.
          </S.Alerta>
        )}
      </S.Resumo>

      <S.Botoes>
        <PrimaryButton
          label="Ver meus pedidos"
          onClick={() => router.push('/meus-pedidos')}
        />
        <SecondaryButton
          label="Continuar comprando"
          onClick={() => router.push('/produtos')}
        />
      </S.Botoes>
    </S.Container>
  );
};

export default CheckoutSucesso;
