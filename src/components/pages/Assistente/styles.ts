import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Contexto = styled.p`
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.gray88};

  strong {
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;
