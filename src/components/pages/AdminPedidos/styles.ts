import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const LinhaPedido = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;

  > input {
    margin-top: 1.5rem;
    width: 1.1rem;
    height: 1.1rem;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.3;
    }
  }

  > article {
    flex: 1;
  }
`;
