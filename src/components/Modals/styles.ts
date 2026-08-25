import styled, { css, keyframes } from 'styled-components';

const surgir = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.45);
`;

export const Box = styled.div<{ $largura: 'pequena' | 'media' | 'grande' }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 90vh;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  animation: ${surgir} 0.18s ease-out;

  ${({ $largura }) => {
    const larguras = { pequena: '26rem', media: '38rem', grande: '54rem' };

    return css`
      max-width: ${larguras[$largura]};
    `;
  }}
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.graydf};

  h2 {
    font-size: 1.15rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const Close = styled.button`
  display: flex;
  padding: 0.35rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: ${({ theme }) => theme.colors.gray88};

  &:hover {
    background: ${({ theme }) => theme.colors.grayf6};
  }
`;

export const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

export const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.graydf};
`;
