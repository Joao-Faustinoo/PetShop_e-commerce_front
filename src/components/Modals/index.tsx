/**
 * [VIEW] Modal
 *
 * O QUE FAZ: casca genérica de modal reutilizada por todos os modais do sistema.
 *
 * COMO FARÁ: renderiza overlay + caixa central com título, área de conteúdo e rodapé
 * de ações, fechando no ESC e no clique fora. Os modais específicos apenas
 * preenchem o conteúdo.
 *
 * ATENDE: base para os modais do projeto
 */

'use client';

import { ReactNode } from 'react';
import { FiX } from 'react-icons/fi';

import * as S from './styles';
import { useComportamentoModal } from './useComportamentoModal';

interface ModalProps {
  aberto: boolean;
  titulo: string;
  onClose: () => void;
  children: ReactNode;
  /** Botões de ação; quando ausente, o rodapé não é renderizado. */
  acoes?: ReactNode;
  largura?: 'pequena' | 'media' | 'grande';
}

const Modal = ({
  aberto,
  titulo,
  onClose,
  children,
  acoes,
  largura = 'media',
}: ModalProps) => {
  useComportamentoModal(aberto, onClose);

  if (!aberto) return null;

  return (
    <S.Overlay
      role="presentation"
      // Fecha no clique fora, mas não quando o clique nasce dentro da caixa.
      onClick={evento => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <S.Box $largura={largura} role="dialog" aria-modal aria-label={titulo}>
        <S.Header>
          <h2>{titulo}</h2>
          <S.Close type="button" aria-label="Fechar" onClick={onClose}>
            <FiX size={20} />
          </S.Close>
        </S.Header>

        <S.Content>{children}</S.Content>

        {acoes && <S.Footer>{acoes}</S.Footer>}
      </S.Box>
    </S.Overlay>
  );
};

export default Modal;
