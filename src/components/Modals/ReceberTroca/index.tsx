/**
 * [VIEW] ReceberTroca
 *
 * O QUE FAZ: modal de confirmação de recebimento dos itens de uma troca.
 *
 * COMO FARÁ: mostra os itens da troca e obriga o administrador a responder se eles
 * retornam ao estoque, que é o dado exigido pela RF0044. Ao confirmar,
 * chama o useReceberTrocaController, que muda o status, dá a reentrada e
 * gera o cupom.
 *
 * ATENDE: RF0044, RF0045, RF0054, RN0042
 */

'use client';

import { useEffect, useState } from 'react';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import Modal from '@/components/Modals';
import { useReceberTrocaController } from '@/controllers/trocas/useReceberTrocaController';
import { PedidoTroca } from '@/types/trocas/types';
import { formatCurrency } from '@/utils/formatCurrency';

import * as S from './styles';

interface ReceberTrocaProps {
  aberto: boolean;
  onClose: () => void;
  troca?: PedidoTroca;
}

const ReceberTroca = ({ aberto, onClose, troca }: ReceberTrocaProps) => {
  const { receberTroca, isPending } = useReceberTrocaController();

  // RF0044: sem resposta escolhida, o confirmar fica bloqueado.
  const [retornarAoEstoque, setRetornarAoEstoque] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    if (aberto) setRetornarAoEstoque(null);
  }, [aberto]);

  const confirmar = () => {
    if (!troca || retornarAoEstoque === null) return;

    receberTroca(
      { trocaId: troca.id, retornarAoEstoque },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      aberto={aberto}
      titulo="Confirmar recebimento dos itens"
      onClose={onClose}
      acoes={
        <>
          <SecondaryButton label="Cancelar" onClick={onClose} />
          <PrimaryButton
            label="Confirmar recebimento"
            loading={isPending}
            disabled={retornarAoEstoque === null}
            onClick={confirmar}
          />
        </>
      }
    >
      {troca && (
        <>
          <S.Cabecalho>
            <strong>{troca.pedidoNumero}</strong>
            <small>
              {troca.clienteNome} · {troca.itens.length} item(ns) ·{' '}
              {formatCurrency(troca.valorTotal)}
            </small>
          </S.Cabecalho>

          <S.Itens>
            {troca.itens.map(item => (
              <li key={item.produtoId}>
                {item.quantidade}× {item.produtoNome}
                <span>{formatCurrency(item.subtotal)}</span>
              </li>
            ))}
          </S.Itens>

          <S.Motivo>
            <strong>Motivo informado pelo cliente</strong>
            {troca.motivo}
          </S.Motivo>

          {/* RF0044: os itens devolvidos retornam ao estoque? */}
          <S.Label>Os itens devolvidos retornam ao estoque?</S.Label>

          <S.Escolhas>
            <S.Escolha $selecionada={retornarAoEstoque === true}>
              <input
                type="radio"
                name="retorno"
                checked={retornarAoEstoque === true}
                onChange={() => setRetornarAoEstoque(true)}
              />
              <div>
                <strong>Sim, dar entrada no estoque</strong>
                <small>
                  Os itens estão em condição de revenda e voltam ao saldo
                  disponível.
                </small>
              </div>
            </S.Escolha>

            <S.Escolha $selecionada={retornarAoEstoque === false}>
              <input
                type="radio"
                name="retorno"
                checked={retornarAoEstoque === false}
                onChange={() => setRetornarAoEstoque(false)}
              />
              <div>
                <strong>Não, descartar os itens</strong>
                <small>
                  Os itens não retornam ao saldo — avariados ou fora de condição
                  de revenda.
                </small>
              </div>
            </S.Escolha>
          </S.Escolhas>

          {/* RF0045: o cupom é gerado de qualquer forma. */}
          <S.Aviso>
            Ao confirmar, será gerado um cupom de troca de{' '}
            <strong>{formatCurrency(troca.valorTotal)}</strong> para{' '}
            {troca.clienteNome} usar em compras futuras.
          </S.Aviso>
        </>
      )}
    </Modal>
  );
};

export default ReceberTroca;
