import styled, { keyframes } from 'styled-components';

const pular = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
`;

export const Janela = styled.div`
  display: flex;
  flex-direction: column;
  height: min(70vh, 40rem);
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.grayf5};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Mensagens = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

export const Digitando = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.75rem 1rem;
  width: fit-content;
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};

  span {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.grayb7};
    animation: ${pular} 1.2s infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
`;

export const Form = styled.form`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Input = styled.input`
  flex: 1;
  min-height: 2.75rem;
  padding: 0 1rem;
  border: 1px solid ${({ theme }) => theme.colors.graydf};
  border-radius: 999px;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.gray4c};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Enviar = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: none;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

/** Atalhos de pergunta, para a conversa não começar de uma folha em branco. */
export const Sugestoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1.25rem 1rem;
  background: ${({ theme }) => theme.colors.white};
`;

export const Atalho = styled.button`
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.82rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.secondary};

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.white};
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
