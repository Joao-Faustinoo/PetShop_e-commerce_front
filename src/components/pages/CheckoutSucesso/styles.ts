import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Confirmacao = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 40rem;
  margin: 0 auto 2rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};

  span {
    font-size: 3rem;
  }

  h1 {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  p {
    font-size: 0.95rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.gray88};
  }

  strong {
    font-size: 1.15rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Resumo = styled.section`
  max-width: 40rem;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Itens = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  margin-bottom: 1rem;

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

export const Total = styled.p`
  display: flex;
  justify-content: space-between;
  padding-top: 0.9rem;
  border-top: 1px solid ${({ theme }) => theme.colors.graydf};
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray4c};

  strong {
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Botoes = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;
