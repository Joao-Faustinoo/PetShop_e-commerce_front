/**
 * [VIEW] ModalConfirmacao
 *
 * O QUE FAZ: modal único de confirmação para as ações importantes do
 * sistema — despachar pedido, confirmar entrega, autorizar troca, sair
 * da conta e afins.
 *
 * COMO FARÁ: a variante define ícone, cor e título padrão; o chamador
 * passa só a mensagem e o que fazer no confirmar. Com
 * `rotuloCancelar="none"` vira um aviso de um botão só (sem escolha), e
 * nesse modo o clique fora e o ESC não fecham, para que a mensagem
 * precise ser reconhecida. Enquanto `carregando`, os dois botões ficam
 * travados para não disparar a ação duas vezes.
 *
 * ATENDE: base para os modais do projeto
 */

'use client';

import {
  FiAlertOctagon,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';
import { useTheme } from 'styled-components';

import { useComportamentoModal } from '../useComportamentoModal';

import * as S from './styles';

export type VarianteConfirmacao = 'alerta' | 'perigo' | 'sucesso' | 'info';

/** Sem botão de cancelar não há como fechar: o ESC não faz nada. */
const naoFecha = (): void => undefined;

interface ConfirmacaoProps {
  aberto: boolean;
  variante: VarianteConfirmacao;
  mensagem: string;
  onClose: () => void;
  onConfirm?: () => void;
  /** Sobrescreve o título padrão da variante. */
  titulo?: string;
  /** `none` remove o botão de cancelar, deixando só o de confirmar. */
  rotuloCancelar?: string;
  rotuloConfirmar?: string;
  carregando?: boolean;
}

const ModalConfirmacao = ({
  aberto,
  variante,
  mensagem,
  onClose,
  onConfirm,
  titulo,
  rotuloCancelar,
  rotuloConfirmar,
  carregando = false,
}: ConfirmacaoProps) => {
  const theme = useTheme();

  const semCancelar = rotuloCancelar === 'none';

  // Sem cancelar, a única saída é o botão de confirmar: o ESC não fecha.
  useComportamentoModal(aberto, semCancelar ? naoFecha : onClose);

  if (!aberto) return null;

  const config: Record<
    VarianteConfirmacao,
    { titulo: string; cor: string; Icone: typeof FiAlertTriangle }
  > = {
    alerta: {
      titulo: 'Atenção!',
      cor: theme.colors.warning,
      Icone: FiAlertTriangle,
    },
    perigo: {
      titulo: 'Atenção!',
      cor: theme.colors.error,
      Icone: FiAlertOctagon,
    },
    sucesso: {
      titulo: 'Sucesso!',
      cor: theme.colors.success,
      Icone: FiCheckCircle,
    },
    info: {
      titulo: 'Confirmação',
      cor: theme.colors.secondary,
      Icone: FiInfo,
    },
  };

  const { titulo: tituloPadrao, cor, Icone } = config[variante];
  const tituloFinal = titulo || tituloPadrao;

  return (
    <S.Overlay
      role="presentation"
      onClick={evento => {
        if (semCancelar) return;
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <S.Box role="alertdialog" aria-modal aria-label={tituloFinal}>
        <S.Icone $cor={cor} aria-hidden>
          <Icone size={28} />
        </S.Icone>

        <h2>{tituloFinal}</h2>
        <p>{mensagem}</p>

        <S.Acoes>
          {!semCancelar && (
            <S.Botao
              type="button"
              $cor={cor}
              onClick={onClose}
              disabled={carregando}
            >
              {rotuloCancelar || 'Cancelar'}
            </S.Botao>
          )}

          <S.Botao
            type="button"
            $primario
            $cor={cor}
            onClick={onConfirm ?? onClose}
            disabled={carregando}
          >
            {rotuloConfirmar || (semCancelar ? 'Fechar' : 'Continuar')}
          </S.Botao>
        </S.Acoes>
      </S.Box>
    </S.Overlay>
  );
};

export default ModalConfirmacao;
