import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
`;

export const Linha = styled.div<{ $colunas: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $colunas }) => $colunas}, 1fr);
  gap: 1rem;
`;

export const Celula = styled.div<{ $cabecalho?: boolean }>`
  height: ${({ $cabecalho }) => ($cabecalho ? '0.9rem' : '1.15rem')};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.grayf6};
  background-image: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.grayf6} 0px,
    ${({ theme }) => theme.colors.graydf} 200px,
    ${({ theme }) => theme.colors.grayf6} 400px
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s infinite linear;
`;
