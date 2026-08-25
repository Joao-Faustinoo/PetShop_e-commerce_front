import Link from 'next/link';
import styled, { css } from 'styled-components';

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: ${({ theme }) => theme.colors.gray4c};
`;

export const Container = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  max-width: 84rem;
  margin: 0 auto;
  padding: 0.9rem 1.5rem;
`;

export const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.white};
  white-space: nowrap;

  em {
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    font-size: 0.65rem;
    font-style: normal;
    letter-spacing: 0.05em;
    background: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Logo da marca. É um `img` e não o `next/image` de propósito: o SVG tem
 * 93 traçados e renderiza a 28px — passar pelo otimizador (ou inliná-lo
 * via SVGR) custaria mais do que serví-lo estático.
 */
export const Marca = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 6px;
`;

export const Links = styled.ul`
  display: flex;
  align-items: center;
  gap: 0.15rem;
  list-style: none;
  margin-right: auto;
  overflow-x: auto;
`;

export const NavLink = styled(Link)<{ $ativo: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.grayb7};
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.white};
  }

  ${({ $ativo, theme }) =>
    $ativo &&
    css`
      color: ${theme.colors.white};
      background: ${theme.colors.primary};
      font-weight: 600;
    `}

  span {
    @media (max-width: 1100px) {
      display: none;
    }
  }
`;

export const Usuario = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);

  strong {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.white};

    @media (max-width: 1100px) {
      display: none;
    }
  }
`;

export const Sair = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.7rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.grayb7};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.white};
  }
`;
