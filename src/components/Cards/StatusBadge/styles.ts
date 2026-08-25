import styled from 'styled-components';

export const Badge = styled.span<{ $cor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ $cor }) => $cor};
  /* O fundo é a própria cor do status, bem esmaecida. */
  background: ${({ $cor }) => `${$cor}1A`};

  &::before {
    content: '';
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: ${({ $cor }) => $cor};
  }
`;
