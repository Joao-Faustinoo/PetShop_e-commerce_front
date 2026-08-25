import styled from 'styled-components';

/**
 * O login é a única tela sem navbar, então o próprio main centraliza o
 * cartão nos dois eixos. `min-height` em vez de `height` para que o
 * conteúdo continue rolável em telas baixas em vez de ser cortado.
 */
export const Main = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 2rem 1.25rem;
  background: ${({ theme }) => theme.colors.grayf6};
`;
