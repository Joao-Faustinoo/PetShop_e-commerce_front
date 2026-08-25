import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.25rem;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
`;

export const Bloco = styled.div<{ $altura: string; $largura?: string }>`
  height: ${({ $altura }) => $altura};
  width: ${({ $largura }) => $largura ?? '100%'};
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
