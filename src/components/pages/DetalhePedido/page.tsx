/**
 * [VIEW] Tela: Detalhe do pedido
 *
 * O QUE FAZ: mostra um pedido item a item e permite abrir a solicitação de troca.
 *
 * COMO FARÁ: lê o id da rota, exibe itens, endereço, formas de pagamento, frete e a
 * linha do tempo de status. O botão de troca abre o modal SolicitarTroca,
 * que permite escolher itens avulsos ou a compra inteira, e só aparece se
 * o pedido estiver ENTREGUE.
 *
 * ATENDE: RF0025, RF0041, RN0041, RN0043
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import StatusBadge from '@/components/Cards/StatusBadge';
import SolicitarTroca from '@/components/Modals/SolicitarTroca';
import { usePedidoController } from '@/controllers/pedidos/usePedidosController';
import { FormaPagamento, ROTULO_STATUS } from '@/types/pedidos/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';

import * as S from './styles';

const rotuloPagamento: Record<FormaPagamento, string> = {
  CARTAO: 'Cartão de crédito',
  CUPOM_TROCA: 'Cupom de troca',
  CUPOM_PROMOCIONAL: 'Cupom promocional',
};

const DetalhePedido = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { pedido, isLoading } = usePedidoController(Number(id));

  const [modalTroca, setModalTroca] = useState(false);

  if (isLoading) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Carregando pedido...</strong>
        </S.Vazio>
      </S.Container>
    );
  }

  if (!pedido) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Pedido não encontrado</strong>
        </S.Vazio>
      </S.Container>
    );
  }

  const endereco = pedido.enderecoEntrega;

  return (
    <S.Container>
      <S.Voltar type="button" onClick={() => router.push('/meus-pedidos')}>
        <FiArrowLeft size={16} /> Voltar para meus pedidos
      </S.Voltar>

      <S.Cabecalho>
        <S.Titulo>
          <h1>{pedido.numero}</h1>
          <p>Compra realizada em {formatDateTime(pedido.dataCompra)}</p>
        </S.Titulo>

        <S.Acoes>
          <StatusBadge status={pedido.status} />

          {/* RN0043: só pedido ENTREGUE aceita solicitação de troca. */}
          {pedido.podeSolicitarTroca && (
            <PrimaryButton
              label="Solicitar troca"
              icon={<FiRefreshCw size={16} />}
              onClick={() => setModalTroca(true)}
            />
          )}
        </S.Acoes>
      </S.Cabecalho>

      <S.DuasColunas>
        <div>
          <S.Bloco>
            <S.TituloSecao>Itens do pedido</S.TituloSecao>

            <S.Itens>
              {pedido.itens.map(item => (
                <li key={item.produtoId}>
                  <div>
                    {item.produtoNome}
                    <small>
                      {item.produtoSku} · {item.quantidade}×{' '}
                      {formatCurrency(item.valorUnitario)}
                      {item.statusTroca &&
                        ` · ${ROTULO_STATUS[item.statusTroca]}`}
                    </small>
                  </div>
                  <span>{formatCurrency(item.subtotal)}</span>
                </li>
              ))}
            </S.Itens>

            <S.Totais>
              <p>
                Subtotal <span>{formatCurrency(pedido.subtotal)}</span>
              </p>
              <p>
                Frete <span>{formatCurrency(pedido.frete)}</span>
              </p>
              <p>
                Total <span>{formatCurrency(pedido.total)}</span>
              </p>
            </S.Totais>
          </S.Bloco>

          <S.Bloco>
            <S.TituloSecao>Formas de pagamento</S.TituloSecao>

            <S.Pagamentos>
              {pedido.pagamentos.map(pagamento => (
                <li
                  key={`${pagamento.forma}-${
                    pagamento.cartaoId ?? pagamento.cupomCodigo
                  }`}
                >
                  {rotuloPagamento[pagamento.forma]}
                  {pagamento.cartaoFinal && ` · final ${pagamento.cartaoFinal}`}
                  {pagamento.cupomCodigo && ` · ${pagamento.cupomCodigo}`}
                  <span>{formatCurrency(pagamento.valor)}</span>
                </li>
              ))}
            </S.Pagamentos>

            {/* RN0036: cupom gerado pela sobra dos cupons desta compra. */}
            {pedido.cupomTrocoCodigo && (
              <S.Alerta $tipo="info">
                Cupom de troco gerado nesta compra:{' '}
                <strong>{pedido.cupomTrocoCodigo}</strong>
              </S.Alerta>
            )}
          </S.Bloco>
        </div>

        <div>
          <S.Bloco>
            <S.TituloSecao>Endereço de entrega</S.TituloSecao>

            <S.Dados>
              <div>
                <dt>{endereco.apelido}</dt>
                <dd>
                  {endereco.logradouro}, {endereco.numero}
                  <br />
                  {endereco.bairro}
                  <br />
                  {endereco.cidade}/{endereco.estado} · CEP {endereco.cep}
                  <br />
                  {endereco.pais}
                </dd>
              </div>
            </S.Dados>
          </S.Bloco>

          <S.Bloco>
            <S.TituloSecao>Acompanhamento</S.TituloSecao>

            <S.Timeline>
              {pedido.historico.map(etapa => (
                <li key={`${etapa.status}-${etapa.dataHora}`}>
                  <strong>{ROTULO_STATUS[etapa.status]}</strong>
                  <small>{formatDateTime(etapa.dataHora)}</small>
                </li>
              ))}
            </S.Timeline>
          </S.Bloco>
        </div>
      </S.DuasColunas>

      <SolicitarTroca
        aberto={modalTroca}
        pedido={pedido}
        onClose={() => setModalTroca(false)}
      />
    </S.Container>
  );
};

export default DetalhePedido;
