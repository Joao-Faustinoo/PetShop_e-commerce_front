import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Conteudo = styled.div`
  display: grid;
  grid-template-columns: 22rem 1fr;
  align-items: start;
  gap: 2rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

/** Moldura da foto grande; o conteúdo é o ImagemProduto. */
export const Imagem = styled.div`
  height: 22rem;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Marca = styled.small`
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.grayb7};
`;

export const Nome = styled.h1`
  font-size: 1.75rem;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.gray4c};
`;

export const Preco = styled.strong`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Descricao = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.gray88};
`;

export const Compra = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Ficha = styled.div`
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;
