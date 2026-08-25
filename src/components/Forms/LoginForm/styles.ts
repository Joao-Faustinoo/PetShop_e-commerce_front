import styled from 'styled-components';

export * from '@/components/Forms/fields';

export const Card = styled.div`
  width: 100%;
  max-width: 26rem;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
`;

/** Logo da marca acima do título do cartão de login. */
export const Marca = styled.img`
  display: block;
  width: 64px;
  height: 64px;
  margin: 0 auto 0.75rem;
  border-radius: 12px;
`;

export const Titulo = styled.header`
  margin-bottom: 1.75rem;
  text-align: center;

  h1 {
    font-size: 1.6rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    margin-top: 0.35rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;

/** Atalhos dos dois perfis pré-cadastrados (premissa de login mockado). */
export const Atalhos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.graydf};

  small {
    font-size: 0.78rem;
    text-align: center;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;

export const Atalho = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.grayf6};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
  color: ${({ theme }) => theme.colors.gray4c};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Cadastro = styled.p`
  margin-top: 1.5rem;
  font-size: 0.88rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray88};

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }
`;
