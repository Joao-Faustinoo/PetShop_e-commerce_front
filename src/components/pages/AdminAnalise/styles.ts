import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Resumo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Indicador = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  small {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.grayb7};
  }

  strong {
    font-size: 1.15rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

/** Legenda das categorias selecionadas, com a cor de cada linha. */
export const Legenda = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-left: auto;
`;

export const Serie = styled.span<{ $cor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.gray88};

  &::before {
    content: '';
    width: 0.75rem;
    height: 0.25rem;
    border-radius: 2px;
    background: ${({ $cor }) => $cor};
  }
`;
