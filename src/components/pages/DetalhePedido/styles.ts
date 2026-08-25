import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Itens = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray4c};
    border: 1px solid ${({ theme }) => theme.colors.graydf};

    div {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      flex: 1;

      small {
        font-size: 0.8rem;
        color: ${({ theme }) => theme.colors.gray88};
      }
    }

    span {
      font-weight: 600;
    }
  }
`;

export const Bloco = styled.section`
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

/** Linha do tempo dos status por onde o pedido passou. */
export const Timeline = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;

  li {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0 0 1.25rem 1.75rem;
    border-left: 2px solid ${({ theme }) => theme.colors.graydf};

    &:last-child {
      padding-bottom: 0;
      border-left-color: transparent;
    }

    &::before {
      content: '';
      position: absolute;
      left: -0.45rem;
      top: 0.15rem;
      width: 0.8rem;
      height: 0.8rem;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.primary};
    }

    strong {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.gray4c};
    }

    small {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.gray88};
    }
  }
`;

export const Pagamentos = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  list-style: none;

  li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray88};

    span {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.gray4c};
    }
  }
`;

export const Totais = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.graydf};

  p {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray88};

    span {
      color: ${({ theme }) => theme.colors.gray4c};
    }

    &:last-child {
      font-size: 1rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.gray4c};

      span {
        font-size: 1.2rem;
        color: ${({ theme }) => theme.colors.primary};
      }
    }
  }
`;
