/**
 * [VIEW] SolicitarTroca
 *
 * O QUE FAZ: modal em que o cliente escolhe o que quer trocar de um pedido.
 *
 * COMO FARÁ: lista os itens do pedido com seleção múltipla e um atalho para marcar a
 * compra inteira, pede o motivo e chama o useSolicitarTrocaController. Só
 * é acessível a partir de pedidos ENTREGUE.
 *
 * ATENDE: RF0041, RN0041, RN0043
 */

'use client';

import { useEffect, useState } from 'react';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import Modal from '@/components/Modals';
import { useSolicitarTrocaController } from '@/controllers/trocas/useSolicitarTrocaController';
import { Pedido } from '@/types/pedidos/types';
import { formatCurrency } from '@/utils/formatCurrency';

import * as S from './styles';

interface SolicitarTrocaProps {
  aberto: boolean;
  onClose: () => void;
  pedido?: Pedido;
}

const SolicitarTroca = ({ aberto, onClose, pedido }: SolicitarTrocaProps) => {
  const { solicitarTroca, isPending } = useSolicitarTrocaController();

  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (aberto) {
      setSelecionados([]);
      setMotivo('');
    }
  }, [aberto]);

  // Itens já em troca não podem ser solicitados de novo.
  const disponiveis = (pedido?.itens ?? []).filter(item => !item.statusTroca);

  const alternar = (produtoId: number) => {
    setSelecionados(atuais =>
      atuais.includes(produtoId)
        ? atuais.filter(id => id !== produtoId)
        : [...atuais, produtoId],
    );
  };

  const valorTotal = disponiveis
    .filter(item => selecionados.includes(item.produtoId))
    .reduce((soma, item) => soma + item.subtotal, 0);

  const podeSolicitar = selecionados.length > 0 && motivo.trim().length >= 10;

  const confirmar = () => {
    if (!pedido) return;

    solicitarTroca(
      {
        pedidoId: pedido.id,
        itens: disponiveis
          .filter(item => selecionados.includes(item.produtoId))
          .map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
          })),
        motivo,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      aberto={aberto}
      titulo={`Solicitar troca — ${pedido?.numero ?? ''}`}
      onClose={onClose}
      largura="media"
      acoes={
        <>
          <SecondaryButton label="Cancelar" onClick={onClose} />
          <PrimaryButton
            label="Solicitar troca"
            loading={isPending}
            disabled={!podeSolicitar}
            onClick={confirmar}
          />
        </>
      }
    >
      {/* RN0041: dá para trocar itens avulsos ou a compra inteira. */}
      <S.Atalho
        type="button"
        onClick={() =>
          setSelecionados(
            selecionados.length === disponiveis.length
              ? []
              : disponiveis.map(item => item.produtoId),
          )
        }
      >
        {selecionados.length === disponiveis.length
          ? 'Limpar seleção'
          : 'Selecionar a compra inteira'}
      </S.Atalho>

      <S.Itens>
        {(pedido?.itens ?? []).map(item => {
          const emTroca = !!item.statusTroca;

          return (
            <S.Item key={item.produtoId} $indisponivel={emTroca}>
              <input
                type="checkbox"
                id={`item-${item.produtoId}`}
                disabled={emTroca}
                checked={selecionados.includes(item.produtoId)}
                onChange={() => alternar(item.produtoId)}
              />

              <label htmlFor={`item-${item.produtoId}`}>
                <strong>{item.produtoNome}</strong>
                <small>
                  {item.quantidade}× {formatCurrency(item.valorUnitario)}
                  {emTroca && ' · já solicitado em troca'}
                </small>
              </label>

              <span>{formatCurrency(item.subtotal)}</span>
            </S.Item>
          );
        })}
      </S.Itens>

      <S.Campo>
        <S.Label htmlFor="motivo">Motivo da troca</S.Label>
        <S.Textarea
          id="motivo"
          placeholder="Descreva o problema com pelo menos 10 caracteres."
          value={motivo}
          onChange={evento => setMotivo(evento.target.value)}
        />
      </S.Campo>

      <S.Total>
        Valor dos itens selecionados
        <strong>{formatCurrency(valorTotal)}</strong>
      </S.Total>

      <S.Aviso>
        Após a autorização e o recebimento dos itens, você receberá um cupom de
        troca no valor correspondente.
      </S.Aviso>
    </Modal>
  );
};

export default SolicitarTroca;
