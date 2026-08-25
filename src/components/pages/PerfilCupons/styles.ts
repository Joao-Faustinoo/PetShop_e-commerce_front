import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Secao = styled.section`
  margin-bottom: 2rem;
`;

export const Cupom = styled.article<{ $indisponivel: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px dashed ${({ theme }) => theme.colors.graydf};
  opacity: ${({ $indisponivel }) => ($indisponivel ? 0.55 : 1)};

  strong {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.success};
  }

  code {
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  small {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;

export const Situacao = styled.span<{ $tipo: 'ok' | 'usado' | 'vencido' }>`
  align-self: flex-start;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;

  ${({ theme, $tipo }) => {
    const cores = {
      ok: theme.colors.success,
      usado: theme.colors.gray88,
      vencido: theme.colors.error,
    };

    return `color: ${cores[$tipo]}; background: ${cores[$tipo]}1A;`;
  }}
`;
