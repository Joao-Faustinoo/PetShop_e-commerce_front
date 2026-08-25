import Link from 'next/link';
import styled, { css } from 'styled-components';

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Container = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0.9rem 1.5rem;
`;

export const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
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
  gap: 0.35rem;
  list-style: none;
  margin-right: auto;

  @media (max-width: 860px) {
    gap: 0;
  }
`;

export const NavLink = styled(Link)<{ $ativo: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 500;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.gray88};
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grayf6};
    color: ${({ theme }) => theme.colors.gray4c};
  }

  ${({ $ativo, theme }) =>
    $ativo &&
    css`
      color: ${theme.colors.primary};
      background: ${theme.colors.grayf6};
      font-weight: 600;
    `}

  span {
    @media (max-width: 860px) {
      display: none;
    }
  }
`;

export const Badge = styled.em`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-style: normal;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
`;

export const Usuario = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 1rem;
  border-left: 1px solid ${({ theme }) => theme.colors.graydf};

  strong {
    font-size: 0.88rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray4c};

    @media (max-width: 860px) {
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
  font-size: 0.88rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.error};

  &:hover {
    background: ${({ theme }) => theme.colors.grayf6};
  }
`;
