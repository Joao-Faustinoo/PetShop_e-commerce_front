import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/** RNF0046: o aviso que o cliente recebe quando a troca é autorizada. */
export const Avisos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const Aviso = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.grayf6};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.gray4c};

  button {
    flex-shrink: 0;
    border: 0;
    background: none;
    cursor: pointer;
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;
