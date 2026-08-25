import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Cartao = styled.article<{ $preferencial: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid
    ${({ theme, $preferencial }) =>
      $preferencial ? theme.colors.primary : theme.colors.graydf};
`;

export const Topo = styled.header`
  display: flex;
  align-items: center;
  gap: 0.6rem;

  strong {
    font-size: 1.05rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  div {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
  }
`;

export const Selo = styled.span`
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
`;

export const CartaoDados = styled.p`
  font-size: 0.86rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.gray88};
`;
