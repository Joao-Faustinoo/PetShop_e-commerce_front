import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Resumo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const Indicador = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.1rem 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};

  small {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.grayb7};
  }

  strong {
    font-size: 1.35rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const Bloco = styled.section`
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Colecao = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;

  li {
    padding: 0.75rem 0.9rem;
    border-radius: 8px;
    font-size: 0.87rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.gray88};
    border: 1px solid ${({ theme }) => theme.colors.graydf};

    strong {
      color: ${({ theme }) => theme.colors.gray4c};
    }
  }
`;
