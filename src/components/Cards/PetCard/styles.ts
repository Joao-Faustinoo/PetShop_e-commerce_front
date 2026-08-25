import styled from 'styled-components';

export const Card = styled.article`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Avatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  font-size: 1.6rem;
  background: ${({ theme }) => theme.colors.grayf6};
`;

export const Dados = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-right: auto;

  strong {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  small {
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;

export const Acoes = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

export const Acao = styled.button<{ $danger?: boolean }>`
  display: flex;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${({ theme, $danger }) =>
    $danger ? theme.colors.error : theme.colors.secondary};

  &:hover {
    background: ${({ theme }) => theme.colors.grayf6};
  }
`;
