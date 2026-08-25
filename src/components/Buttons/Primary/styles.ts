import styled, { css, keyframes } from 'styled-components';

const girar = keyframes`
  to { transform: rotate(360deg); }
`;

export const Button = styled.button<{ $full: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  transition: background 0.2s ease, opacity 0.2s ease;

  ${({ $full }) =>
    $full &&
    css`
      width: 100%;
    `}

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const Spinner = styled.span`
  width: 1.1rem;
  height: 1.1rem;
  border: 2px solid ${({ theme }) => theme.colors.white};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${girar} 0.7s linear infinite;
`;
