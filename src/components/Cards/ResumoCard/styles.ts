import styled from 'styled-components';

export const Card = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};

  h3 {
    margin-bottom: 0.25rem;
    font-size: 1.05rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const Linha = styled.p<{ $destaque?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.9rem;
  color: ${({ theme, $destaque }) =>
    $destaque ? theme.colors.success : theme.colors.gray88};

  span {
    font-weight: 600;
    color: ${({ theme, $destaque }) =>
      $destaque ? theme.colors.success : theme.colors.gray4c};
  }
`;

export const Total = styled.p`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 0.9rem;
  border-top: 1px solid ${({ theme }) => theme.colors.graydf};
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray4c};

  span {
    font-size: 1.4rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

/** Aviso do checkout: quanto ainda falta cobrir para poder finalizar. */
export const Pendente = styled.p`
  padding: 0.7rem 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.warning};
  background: ${({ theme }) => `${theme.colors.warning}1A`};

  strong {
    font-weight: 700;
  }
`;

export const Acoes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
`;
