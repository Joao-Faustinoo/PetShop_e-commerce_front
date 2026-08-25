import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Troca = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Topo = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;

  div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    strong {
      font-size: 1rem;
      color: ${({ theme }) => theme.colors.gray4c};
    }

    small {
      font-size: 0.82rem;
      color: ${({ theme }) => theme.colors.gray88};
    }
  }
`;

export const Itens = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  list-style: none;
  padding: 0.75rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.grayf6};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayf6};

  li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.86rem;
    color: ${({ theme }) => theme.colors.gray88};

    span {
      color: ${({ theme }) => theme.colors.gray4c};
    }
  }
`;

export const Motivo = styled.p`
  font-size: 0.86rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.gray88};

  strong {
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const Rodape = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const Total = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.gray88};

  strong {
    display: block;
    font-size: 1.15rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const Cupom = styled.small`
  display: block;
  margin-top: 0.35rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.success};
`;
