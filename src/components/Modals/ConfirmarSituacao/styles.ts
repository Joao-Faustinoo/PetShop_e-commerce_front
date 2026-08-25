import styled from 'styled-components';

export * from '@/components/Forms/fields';

export const Produto = styled.p`
  margin-bottom: 1.25rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.gray88};
  background: ${({ theme }) => theme.colors.grayf6};

  strong {
    display: block;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;
