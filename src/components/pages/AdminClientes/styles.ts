import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Situacao = styled.span<{ $ativo: boolean }>`
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  color: ${({ theme, $ativo }) =>
    $ativo ? theme.colors.success : theme.colors.gray88};
  background: ${({ theme, $ativo }) =>
    $ativo ? `${theme.colors.success}1A` : theme.colors.grayf6};
`;

export const Ranking = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray4c};

  small {
    font-weight: 400;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;
