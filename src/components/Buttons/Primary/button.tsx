/**
 * [VIEW] PrimaryButton
 *
 * O QUE FAZ: botão de ação principal do sistema.
 *
 * COMO FARÁ: recebe label, estado de carregando e desabilitado, exibindo spinner no
 * lugar do texto durante o envio.
 *
 * ATENDE: componente base de UI
 */

'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

import * as S from './styles';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loading?: boolean;
  full?: boolean;
  icon?: ReactNode;
}

const PrimaryButton = ({
  label,
  loading = false,
  full = false,
  icon,
  disabled,
  type = 'button',
  ...rest
}: PrimaryButtonProps) => {
  return (
    <S.Button
      // eslint-disable-next-line react/button-has-type
      type={type}
      $full={full}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <S.Spinner aria-label="Carregando" />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </S.Button>
  );
};

export default PrimaryButton;
