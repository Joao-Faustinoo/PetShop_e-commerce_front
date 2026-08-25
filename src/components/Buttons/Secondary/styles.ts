import styled, { css } from 'styled-components';

export const Button = styled.button<{ $full: boolean; $danger: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  background: transparent;
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  transition: background 0.2s ease, color 0.2s ease, opacity 0.2s ease;

  ${({ $full }) =>
    $full &&
    css`
      width: 100%;
    `}

  ${({ $danger, theme }) =>
    $danger &&
    css`
      border-color: ${theme.colors.error};
      color: ${theme.colors.error};
    `}

  &:hover:not(:disabled) {
    background: ${({ theme, $danger }) =>
      $danger ? theme.colors.error : theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
