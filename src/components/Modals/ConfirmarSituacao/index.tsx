/**
 * [VIEW] ConfirmarSituacao
 *
 * O QUE FAZ: modal de inativação e ativação de produto.
 *
 * COMO FARÁ: exige a categoria do motivo (select das tabelas de domínio) e a
 * justificativa em texto antes de habilitar o confirmar, atendendo à
 * RN0015 na inativação e à RN0017 na ativação. Chama o
 * useSituacaoProdutoController.
 *
 * ATENDE: RF0012, RF0016, RN0015, RN0017
 */

'use client';

import { useEffect, useState } from 'react';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import Modal from '@/components/Modals';
import { useDominiosController } from '@/controllers/dominios/useDominiosController';
import { useSituacaoProdutoController } from '@/controllers/produtos/useSituacaoProdutoController';
import { Produto } from '@/types/produtos/types';

import * as S from './styles';

interface ConfirmarSituacaoProps {
  aberto: boolean;
  onClose: () => void;
  produto?: Produto;
  /** INATIVAR usa os motivos da RN0015; ATIVAR, os da RN0017. */
  acao: 'INATIVAR' | 'ATIVAR';
}

const ConfirmarSituacao = ({
  aberto,
  onClose,
  produto,
  acao,
}: ConfirmarSituacaoProps) => {
  const { motivosInativacao, motivosAtivacao } = useDominiosController();
  const { inativar, ativar, isPending } = useSituacaoProdutoController();

  const motivos = acao === 'INATIVAR' ? motivosInativacao : motivosAtivacao;

  const [motivoId, setMotivoId] = useState<number>();
  const [justificativa, setJustificativa] = useState('');

  // Zera os campos a cada abertura, para não vazar a decisão anterior.
  useEffect(() => {
    if (aberto) {
      setMotivoId(motivos[0]?.id);
      setJustificativa('');
    }
  }, [aberto, motivos]);

  // RN0015/RN0017: sem motivo e justificativa, não confirma.
  const podeConfirmar = !!motivoId && justificativa.trim().length >= 10;

  const confirmar = () => {
    if (!produto || !motivoId) return;

    const payload = { id: produto.id, motivoId, justificativa };

    if (acao === 'INATIVAR') {
      inativar(payload, { onSuccess: onClose });
    } else {
      ativar(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      aberto={aberto}
      titulo={acao === 'INATIVAR' ? 'Inativar produto' : 'Ativar produto'}
      onClose={onClose}
      acoes={
        <>
          <SecondaryButton label="Cancelar" onClick={onClose} />
          <PrimaryButton
            label={acao === 'INATIVAR' ? 'Inativar' : 'Ativar'}
            loading={isPending}
            disabled={!podeConfirmar}
            onClick={confirmar}
          />
        </>
      }
    >
      {produto && (
        <S.Produto>
          <strong>{produto.nome}</strong>
          {produto.sku} · {produto.quantidadeEstoque} item(ns) em estoque
        </S.Produto>
      )}

      <S.Grid $colunas={1}>
        <S.Campo>
          <S.Label htmlFor="motivo">Categoria do motivo</S.Label>
          <S.Select
            id="motivo"
            value={motivoId ?? ''}
            onChange={evento => setMotivoId(Number(evento.target.value))}
          >
            {motivos.map(motivo => (
              <option key={motivo.id} value={motivo.id}>
                {motivo.nome}
              </option>
            ))}
          </S.Select>
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="justificativa">Justificativa</S.Label>
          <S.Textarea
            id="justificativa"
            placeholder="Descreva o motivo com pelo menos 10 caracteres."
            value={justificativa}
            onChange={evento => setJustificativa(evento.target.value)}
          />
          {!podeConfirmar && justificativa.length > 0 && (
            <S.Erro>A justificativa precisa ter ao menos 10 caracteres.</S.Erro>
          )}
        </S.Campo>
      </S.Grid>
    </Modal>
  );
};

export default ConfirmarSituacao;
