/**
 * [VIEW] Tela: Trocas
 *
 * O QUE FAZ: visualização e tratamento dos pedidos de troca.
 *
 * COMO FARÁ: consome o useTrocasController e agrupa em abas por status. Autorizar chama
 * o useAutorizarTrocaController (gera a notificação ao cliente). Confirmar
 * recebimento abre o modal ReceberTroca, que obriga o admin a informar se
 * os itens voltam ao estoque; ao confirmar, o controller dá a reentrada e
 * gera o cupom de troca.
 *
 * ATENDE: RF0042-RF0045, RN0042, RN0046
 */

'use client';

import { useState } from 'react';
import { FiCheck, FiPackage } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import StatusBadge from '@/components/Cards/StatusBadge';
import ReceberTroca from '@/components/Modals/ReceberTroca';
import ModalConfirmacao from '@/components/Modals/Confirmacao';
import { useConfirmacao } from '@/components/Modals/Confirmacao/useConfirmacao';
import TabelaSkeleton from '@/components/skeletons/TabelaSkeleton';
import { useAutorizarTrocaController } from '@/controllers/trocas/useAutorizarTrocaController';
import { useTrocasController } from '@/controllers/trocas/useTrocasController';
import { PedidoTroca, StatusTroca } from '@/types/trocas/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

import * as S from './styles';

type NomeAba = 'aguardando' | 'autorizadas' | 'concluidas';

const AdminTrocas = () => {
  const {
    aguardandoAutorizacao,
    aguardandoRecebimento,
    concluidas,
    isLoading,
  } = useTrocasController();
  const { propsDoModal, pedirConfirmacao } = useConfirmacao();
  const { autorizarTroca, isPending } = useAutorizarTrocaController();

  const [aba, setAba] = useState<NomeAba>('aguardando');
  const [trocaParaReceber, setTrocaParaReceber] = useState<PedidoTroca>();

  const listas: Record<NomeAba, PedidoTroca[]> = {
    aguardando: aguardandoAutorizacao,
    autorizadas: aguardandoRecebimento,
    concluidas,
  };

  const trocas = listas[aba];

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Trocas</h1>
          <p>Autorize solicitações e confirme o recebimento dos itens</p>
        </S.Titulo>
      </S.Cabecalho>

      {/* RF0043: as três situações do fluxo de troca, em abas. */}
      <S.Abas>
        <S.Aba
          type="button"
          $ativa={aba === 'aguardando'}
          onClick={() => setAba('aguardando')}
        >
          Aguardando autorização
          <S.Contador>{aguardandoAutorizacao.length}</S.Contador>
        </S.Aba>

        <S.Aba
          type="button"
          $ativa={aba === 'autorizadas'}
          onClick={() => setAba('autorizadas')}
        >
          Aguardando recebimento
          <S.Contador>{aguardandoRecebimento.length}</S.Contador>
        </S.Aba>

        <S.Aba
          type="button"
          $ativa={aba === 'concluidas'}
          onClick={() => setAba('concluidas')}
        >
          Concluídas
          <S.Contador>{concluidas.length}</S.Contador>
        </S.Aba>
      </S.Abas>

      {isLoading ? (
        <TabelaSkeleton colunas={4} linhas={3} />
      ) : trocas.length === 0 ? (
        <S.Vazio>
          <strong>Nenhuma troca nesta situação</strong>
        </S.Vazio>
      ) : (
        <S.Lista>
          {trocas.map(troca => (
            <S.Troca key={troca.id}>
              <S.Topo>
                <div>
                  <strong>
                    {troca.pedidoNumero}
                    {troca.trocaTotal && ' · compra inteira'}
                  </strong>
                  <small>
                    {troca.clienteNome} · solicitada em{' '}
                    {formatDate(troca.dataSolicitacao)}
                  </small>
                </div>

                <StatusBadge status={troca.status as StatusTroca} />
              </S.Topo>

              <S.Itens>
                {troca.itens.map(item => (
                  <li key={item.produtoId}>
                    {item.quantidade}× {item.produtoNome}
                    <span>{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </S.Itens>

              <S.Motivo>
                <strong>Motivo:</strong> {troca.motivo}
              </S.Motivo>

              <S.Rodape>
                <S.Total>
                  Valor da troca
                  <strong>{formatCurrency(troca.valorTotal)}</strong>
                  {/* RF0045: cupom gerado no recebimento. */}
                  {troca.cupomGeradoCodigo && (
                    <S.Cupom>
                      Cupom gerado: {troca.cupomGeradoCodigo}
                      {troca.retornouAoEstoque !== undefined &&
                        ` · itens ${
                          troca.retornouAoEstoque
                            ? 'devolvidos ao'
                            : 'não devolvidos ao'
                        } estoque`}
                    </S.Cupom>
                  )}
                </S.Total>

                <S.Acoes>
                  {/* RF0042/RN0046: autoriza e notifica o cliente. */}
                  {troca.status === 'EM_TROCA' && (
                    <PrimaryButton
                      label="Autorizar troca"
                      icon={<FiCheck size={16} />}
                      loading={isPending}
                      onClick={() =>
                        pedirConfirmacao({
                          variante: 'alerta',
                          titulo: 'Autorizar troca',
                          mensagem: `A troca do ${troca.pedidoNumero} será autorizada e o cliente notificado. O cupom de troca só é gerado quando os itens forem recebidos.`,
                          rotuloConfirmar: 'Autorizar',
                          aoConfirmar: () => autorizarTroca(troca.id),
                        })
                      }
                    />
                  )}

                  {/* RF0044: confirma o recebimento dos itens. */}
                  {troca.status === 'TROCA_AUTORIZADA' && (
                    <PrimaryButton
                      label="Confirmar recebimento"
                      icon={<FiPackage size={16} />}
                      onClick={() => setTrocaParaReceber(troca)}
                    />
                  )}
                </S.Acoes>
              </S.Rodape>
            </S.Troca>
          ))}
        </S.Lista>
      )}

      <ReceberTroca
        aberto={!!trocaParaReceber}
        troca={trocaParaReceber}
        onClose={() => setTrocaParaReceber(undefined)}
      />

      <ModalConfirmacao {...propsDoModal} />
    </S.Container>
  );
};

export default AdminTrocas;
