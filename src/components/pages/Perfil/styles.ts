import Link from 'next/link';
import styled from 'styled-components';

export * from '@/components/pages/layout';

/** Atalhos para as demais abas do perfil (endereços, cartões, pets, cupons). */
export const Atalhos = styled.nav`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.75rem;
`;

export const Atalho = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.gray4c};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
  transition: border-color 0.2s ease, color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Identificacao = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};

  div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    strong {
      font-size: 1.1rem;
      color: ${({ theme }) => theme.colors.gray4c};
    }

    small {
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors.gray88};
    }
  }
`;

export const Ranking = styled.span`
  margin-left: auto;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => `${theme.colors.primary}1A`};
`;
