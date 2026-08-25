import styled from 'styled-components';

export * from '@/components/Forms/fields';

export const Cabecalho = styled.div`
  margin-bottom: 1.25rem;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.grayf6};

  strong {
    display: block;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  small {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;

export const Itens = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  list-style: none;
  margin-bottom: 1.25rem;

  li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.7rem 0.9rem;
    border-radius: 8px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray4c};
    border: 1px solid ${({ theme }) => theme.colors.graydf};

    span {
      font-weight: 600;
    }
  }
`;

export const Motivo = styled.p`
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.gray88};

  strong {
    display: block;
    margin-bottom: 0.25rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

/** RF0044: a decisão sobre o retorno ao estoque é obrigatória. */
export const Escolhas = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0.5rem 0 1.25rem;
`;

export const Escolha = styled.label<{ $selecionada: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  border: 1.5px solid
    ${({ theme, $selecionada }) =>
      $selecionada ? theme.colors.primary : theme.colors.graydf};
  background: ${({ theme, $selecionada }) =>
    $selecionada ? `${theme.colors.primary}0D` : 'transparent'};

  input {
    margin-top: 0.15rem;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    strong {
      font-size: 0.92rem;
      color: ${({ theme }) => theme.colors.gray4c};
    }

    small {
      font-size: 0.82rem;
      color: ${({ theme }) => theme.colors.gray88};
    }
  }
`;
