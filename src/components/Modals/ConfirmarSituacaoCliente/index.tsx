/**
 * [VIEW] ConfirmarSituacaoCliente
 *
 * O QUE FAZ: modal de inativação e reativação do cadastro de cliente.
 *
 * COMO FARÁ: pede a justificativa em texto antes de habilitar o confirmar
 * e devolve o que foi escrito para quem o abriu. Não há categoria de
 * motivo aqui: as tabelas de motivo pertencem ao cadastro de produto
 * (RN0015 e RN0017), não ao de cliente.
 *
 * POR QUE a justificativa: a RF0023 pede apenas que o cliente possa ser
 * inativado, mas a RNF0012 manda registrar os dados alterados em toda
 * operação de escrita. A justificativa é o que dá sentido ao registro —
 * e fica gravada em `justificativaInativacao`, exibida no detalhe do
 * cliente.
 *
 * O cadastro nunca é apagado: inativar troca a situação e preserva o
 * registro, conforme a RF0023.
 *
 * ATENDE: RF0023, RNF0012
 */

'use client';

import { useEffect, useState } from 'react';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import Modal from '@/components/Modals';
import { Cliente } from '@/types/clientes/types';

import * as S from './styles';

/** O mesmo mínimo que a API exige em `alterarSituacaoSchema`. */
const MINIMO_JUSTIFICATIVA = 10;

interface ConfirmarSituacaoClienteProps {
  aberto: boolean;
  onClose: () => void;
  cliente?: Cliente;
  /** Derivada da situação atual de quem foi selecionado. */
  acao: 'INATIVAR' | 'REATIVAR';
  onConfirmar: (justificativa: string) => void;
  isPending?: boolean;
}

const ConfirmarSituacaoCliente = ({
  aberto,
  onClose,
  cliente,
  acao,
  onConfirmar,
  isPending,
}: ConfirmarSituacaoClienteProps) => {
  const [justificativa, setJustificativa] = useState('');

  // Zera o campo a cada abertura, para não vazar a decisão anterior.
  useEffect(() => {
    if (aberto) setJustificativa('');
  }, [aberto]);

  const podeConfirmar = justificativa.trim().length >= MINIMO_JUSTIFICATIVA;

  return (
    <Modal
      aberto={aberto}
      titulo={acao === 'INATIVAR' ? 'Inativar cliente' : 'Reativar cliente'}
      onClose={onClose}
      acoes={
        <>
          <SecondaryButton label="Cancelar" onClick={onClose} />
          <PrimaryButton
            label={acao === 'INATIVAR' ? 'Inativar' : 'Reativar'}
            loading={isPending}
            disabled={!podeConfirmar}
            onClick={() => onConfirmar(justificativa.trim())}
          />
        </>
      }
    >
      {cliente && (
        <S.Cliente>
          <strong>{cliente.nome}</strong>
          {cliente.codigo} · {cliente.email}
        </S.Cliente>
      )}

      <S.Grid $colunas={1}>
        <S.Campo>
          <S.Label htmlFor="justificativa-cliente">Justificativa</S.Label>
          <S.Textarea
            id="justificativa-cliente"
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

export default ConfirmarSituacaoCliente;
