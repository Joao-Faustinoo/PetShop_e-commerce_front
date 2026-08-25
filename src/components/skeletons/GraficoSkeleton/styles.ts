import styled, { keyframes } from 'styled-components';

const pulsar = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

export const Container = styled.div`
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  grid-template-rows: 1fr 2rem;
  gap: 0.75rem;
  height: 26rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
`;

export const EixoY = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.5rem 0;
`;

export const Area = styled.div`
  border-left: 1px solid ${({ theme }) => theme.colors.graydf};
  border-bottom: 1px solid ${({ theme }) => theme.colors.graydf};
  background: ${({ theme }) => theme.colors.grayf6};
  border-radius: 0 0 4px 0;
  animation: ${pulsar} 1.6s ease-in-out infinite;
`;

export const EixoX = styled.div`
  grid-column: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Marca = styled.span<{ $largura?: string }>`
  display: block;
  width: ${({ $largura }) => $largura ?? '3rem'};
  height: 0.7rem;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.grayf6};
  animation: ${pulsar} 1.6s ease-in-out infinite;
`;
