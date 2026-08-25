import styled, { css } from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.45);
  /* Acima da casca genérica: uma confirmação pode nascer de dentro dela. */
  z-index: 120;
`;

export const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 29rem;
  padding: 1.75rem 1.5rem 1.5rem;
  border-radius: 12px;
  text-align: center;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  p {
    font-size: 0.95rem;
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.gray88};
    /* Permite quebrar a mensagem em parágrafos com \n. */
    white-space: pre-line;
  }
`;

/** Disco colorido atrás do ícone, na cor da variante. */
export const Icone = styled.div<{ $cor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  color: ${({ $cor }) => $cor};
  background: ${({ $cor }) => `${$cor}1A`};
`;

export const Acoes = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

export const Botao = styled.button<{ $cor: string; $primario?: boolean }>`
  ${({ theme, $cor, $primario }) => css`
    flex: 1;
    height: 2.6rem;
    padding: 0 1rem;
    border-radius: 10px;
    border: 1px solid ${$cor};
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease, background 0.2s ease;
    color: ${$primario ? theme.colors.white : $cor};
    background: ${$primario ? $cor : 'transparent'};

    &:hover:not(:disabled) {
      opacity: 0.85;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `}
`;
