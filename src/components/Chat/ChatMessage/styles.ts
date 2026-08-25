import styled, { css } from 'styled-components';

export const Linha = styled.div<{ $doCliente: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: ${({ $doCliente }) => ($doCliente ? 'flex-end' : 'flex-start')};
`;

export const Bolha = styled.div<{ $doCliente: boolean }>`
  max-width: min(85%, 34rem);
  padding: 0.75rem 1rem;
  border-radius: 14px;
  font-size: 0.92rem;
  line-height: 1.5;

  ${({ $doCliente, theme }) =>
    $doCliente
      ? css`
          color: ${theme.colors.white};
          background: ${theme.colors.primary};
          border-bottom-right-radius: 4px;
        `
      : css`
          color: ${theme.colors.gray4c};
          background: ${theme.colors.white};
          border: 1px solid ${theme.colors.graydf};
          border-bottom-left-radius: 4px;
        `}
`;

export const Horario = styled.small`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.grayb7};
`;

export const Sugestoes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 40rem;
`;
