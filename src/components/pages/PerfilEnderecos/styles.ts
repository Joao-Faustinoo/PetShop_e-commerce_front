import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Cartao = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Topo = styled.header`
  display: flex;
  align-items: center;
  gap: 0.6rem;

  strong {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  div {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
  }
`;

export const Tipo = styled.span<{ $cobranca: boolean }>`
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${({ theme, $cobranca }) =>
    $cobranca ? theme.colors.secondary : theme.colors.success};
  background: ${({ theme, $cobranca }) =>
    $cobranca ? `${theme.colors.secondary}1A` : `${theme.colors.success}1A`};
`;

export const Linhas = styled.p`
  font-size: 0.88rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.gray88};
`;

export const Observacao = styled.small`
  font-size: 0.8rem;
  font-style: italic;
  color: ${({ theme }) => theme.colors.grayb7};
`;
