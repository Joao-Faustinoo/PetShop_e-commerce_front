import styled from 'styled-components';

export * from '@/components/pages/layout';

export const Lista = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  list-style: none;
`;

export const Item = styled.li<{ $expirado?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid
    ${({ theme, $expirado }) =>
      $expirado ? theme.colors.warning : theme.colors.graydf};
  opacity: ${({ $expirado }) => ($expirado ? 0.75 : 1)};

  @media (max-width: 640px) {
    flex-wrap: wrap;
  }
`;

/** Miniatura da foto do item; o conteúdo é o ImagemProduto. */
export const Miniatura = styled.div`
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  overflow: hidden;
  border-radius: 8px;
`;

export const ItemDados = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 10rem;

  strong {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  small {
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;

export const Subtotal = styled.span`
  min-width: 6rem;
  text-align: right;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray4c};
`;

/** Cronômetro do bloqueio de itens (RN0044). */
export const Cronometro = styled.div<{ $alerta: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 0.88rem;
  color: ${({ theme, $alerta }) =>
    $alerta ? theme.colors.error : theme.colors.secondary};
  background: ${({ theme, $alerta }) =>
    $alerta ? `${theme.colors.error}1A` : `${theme.colors.secondary}1A`};

  strong {
    font-variant-numeric: tabular-nums;
  }
`;

export const Removidos = styled.section`
  margin-top: 2rem;
`;
