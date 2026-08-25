import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Movimentacao = styled.span<{ $tipo: string }>`
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;

  ${({ theme, $tipo }) => {
    const cores: Record<string, string> = {
      ENTRADA: theme.colors.success,
      BAIXA: theme.colors.error,
      REENTRADA: theme.colors.secondary,
    };
    const cor = cores[$tipo] ?? theme.colors.gray88;

    return `color: ${cor}; background: ${cor}1A;`;
  }}
`;

export const Zerado = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.error};
`;

export const Bloqueado = styled.small`
  display: block;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.warning};
`;

export const Secao = styled.section`
  margin-top: 2.5rem;
`;
