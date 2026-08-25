import styled from 'styled-components';

export * from '@/components/Forms/fields';

export const Itens = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  margin-bottom: 1.25rem;
`;

export const Item = styled.li<{ $indisponivel: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.graydf};
  opacity: ${({ $indisponivel }) => ($indisponivel ? 0.55 : 1)};

  input {
    width: 1.05rem;
    height: 1.05rem;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;
    cursor: ${({ $indisponivel }) =>
      $indisponivel ? 'not-allowed' : 'pointer'};

    strong {
      font-size: 0.92rem;
      color: ${({ theme }) => theme.colors.gray4c};
    }

    small {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.gray88};
    }
  }

  span {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const Atalho = styled.button`
  align-self: flex-start;
  margin-bottom: 0.75rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.secondary};

  &:hover {
    color: ${({ theme }) => theme.colors.white};
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

export const Total = styled.p`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid ${({ theme }) => theme.colors.graydf};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.gray88};

  strong {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;
