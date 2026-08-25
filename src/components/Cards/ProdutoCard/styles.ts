import Link from 'next/link';
import styled from 'styled-components';

export const Card = styled(Link)<{ $indisponivel: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  opacity: ${({ $indisponivel }) => ($indisponivel ? 0.65 : 1)};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
`;

/** Faixa da foto do produto; o conteúdo é o ImagemProduto. */
export const Imagem = styled.div`
  height: 10rem;
`;

export const Selo = styled.span`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.error};
`;

export const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  padding: 0.9rem 1rem 1.1rem;
`;

export const Marca = styled.small`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.grayb7};
`;

export const Nome = styled.strong`
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.gray4c};
`;

export const Atributos = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.gray88};
`;

export const Preco = styled.span`
  margin-top: auto;
  padding-top: 0.6rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;
