/**
 * [VIEW] SecondaryButton
 *
 * O QUE FAZ: botão de ação secundária, para cancelar e voltar.
 *
 * COMO FARÁ: mesma anatomia do PrimaryButton, com o esquema de cores invertido.
 *
 * ATENDE: componente base de UI
 */

'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

import * as S from './styles';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  full?: boolean;
  /** Usa a cor de erro: para remover, inativar e recusar. */
  danger?: boolean;
  icon?: ReactNode;
}

const SecondaryButton = ({
  label,
  full = false,
  danger = false,
  icon,
  type = 'button',
  ...rest
}: SecondaryButtonProps) => {
  return (
    // eslint-disable-next-line react/button-has-type
    <S.Button type={type} $full={full} $danger={danger} {...rest}>
      {icon}
      {label}
    </S.Button>
  );
};

export default SecondaryButton;
