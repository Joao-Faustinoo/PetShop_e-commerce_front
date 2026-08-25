import styled, { css } from 'styled-components';

export * from '@/components/pages/layout';

export const Etapa = styled.section`
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const TituloEtapa = styled.header`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    font-size: 0.85rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.white};
    background: ${({ theme }) => theme.colors.primary};
  }

  h2 {
    font-size: 1.05rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  button {
    margin-left: auto;
  }
`;

/** Cartão selecionável: endereço, cartão de crédito, cupom. */
export const Opcao = styled.label<{ $selecionada: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  border: 1.5px solid
    ${({ theme, $selecionada }) =>
      $selecionada ? theme.colors.primary : theme.colors.graydf};
  background: ${({ theme, $selecionada }) =>
    $selecionada ? `${theme.colors.primary}0D` : 'transparent'};

  input {
    margin-top: 0.2rem;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;

    strong {
      font-size: 0.92rem;
      color: ${({ theme }) => theme.colors.gray4c};
    }

    small {
      font-size: 0.82rem;
      line-height: 1.4;
      color: ${({ theme }) => theme.colors.gray88};
    }
  }
`;

export const Opcoes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

/** Linha de pagamento já adicionado (cartão ou cupom). */
export const Aplicado = styled.div<{ $tipo?: 'cupom' | 'cartao' }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.gray4c};

  ${({ theme, $tipo }) =>
    $tipo === 'cupom'
      ? css`
          background: ${theme.colors.success}14;
        `
      : css`
          background: ${theme.colors.grayf6};
        `}

  strong {
    margin-left: auto;
    font-weight: 700;
  }
`;

export const Aplicados = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
`;

export const LinhaCupom = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  > div {
    flex: 1;
    min-width: 12rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  label {
    font-size: 0.78rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray88};
  }

  input {
    min-height: 2.75rem;
    padding: 0 0.9rem;
    border-radius: 8px;
    font-size: 0.9rem;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.gray4c};
    border: 1px solid ${({ theme }) => theme.colors.graydf};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export const ValorCartao = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  > div {
    flex: 1;
    min-width: 9rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  label {
    font-size: 0.78rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray88};
  }

  select,
  input {
    min-height: 2.75rem;
    padding: 0 0.9rem;
    border-radius: 8px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray4c};
    border: 1px solid ${({ theme }) => theme.colors.graydf};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export const Disponiveis = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

export const CupomChip = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: transparent;
  color: ${({ theme }) => theme.colors.success};
  border: 1px dashed ${({ theme }) => theme.colors.success};

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.white};
    background: ${({ theme }) => theme.colors.success};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;
