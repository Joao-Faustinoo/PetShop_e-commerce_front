import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Tela = styled.main`
  min-height: 100vh;
  padding: 3rem 1.5rem;
  background: ${({ theme }) => theme.colors.grayf5};
`;

export const Card = styled.div`
  width: 100%;
  max-width: 52rem;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
`;

export const Topo = styled.header`
  margin-bottom: 2rem;
  text-align: center;

  h1 {
    font-size: 1.6rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    margin-top: 0.35rem;
    font-size: 0.92rem;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;

export const Endereco = styled.fieldset`
  margin-top: 1.5rem;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.graydf};

  legend {
    padding: 0 0.5rem;
    font-size: 0.9rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const Resumo = styled.p`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.gray88};

  strong {
    color: ${({ theme }) => theme.colors.gray4c};
  }

  button {
    margin-left: auto;
  }
`;

export const Login = styled.p`
  margin-top: 1.5rem;
  font-size: 0.88rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray88};

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }
`;
