/**
 * [VIEW] Primitivas de formulário
 *
 * O QUE FAZ: reúne os styled-components de campo que os sete formulários
 * do sistema compartilham.
 *
 * COMO FARÁ: exporta `Form`, `Grid`, `Campo`, `Label`, `Input`, `Select`,
 * `Textarea`, `Checkbox`, `Erro`, `Aviso` e `Acoes`, todos parametrizados
 * pelo tema. Cada `styles.ts` de formulário reexporta o que usa e só
 * acrescenta o que é específico dele.
 *
 * ATENDE: base de UI dos formulários
 */

import styled, { css } from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

/** `$colunas` define quantas colunas o bloco tem em telas largas. */
export const Grid = styled.div<{ $colunas?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $colunas }) => $colunas ?? 2}, 1fr);
  gap: 1rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Campo = styled.div<{ $span?: number }>`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  ${({ $span }) =>
    $span &&
    css`
      grid-column: span ${$span};

      @media (max-width: 720px) {
        grid-column: auto;
      }
    `}
`;

export const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray4c};
`;

const baseCampo = css<{ $erro?: boolean }>`
  width: 100%;
  min-height: 2.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.92rem;
  color: ${({ theme }) => theme.colors.gray4c};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid
    ${({ theme, $erro }) => ($erro ? theme.colors.error : theme.colors.graydf)};
  transition: border-color 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.grayb7};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $erro }) =>
      $erro ? theme.colors.error : theme.colors.primary};
  }

  &:disabled {
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.grayf6};
  }
`;

export const Input = styled.input<{ $erro?: boolean }>`
  ${baseCampo}
`;

export const Select = styled.select<{ $erro?: boolean }>`
  ${baseCampo}
  cursor: pointer;
`;

export const Textarea = styled.textarea<{ $erro?: boolean }>`
  ${baseCampo}
  min-height: 6rem;
  resize: vertical;
`;

/** Lista de checkboxes, usada nas categorias do produto (RN0012). */
export const Opcoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding: 0.6rem 0;
`;

export const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.88rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray4c};

  input {
    width: 1rem;
    height: 1rem;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
`;

export const Erro = styled.small`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.error};
`;

/** Caixa informativa: valor sugerido, alerta de margem, reprecificação. */
export const Aviso = styled.p<{ $tipo?: 'info' | 'alerta' }>`
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.45;

  ${({ theme, $tipo }) => {
    const cor =
      $tipo === 'alerta' ? theme.colors.warning : theme.colors.secondary;

    return css`
      color: ${cor};
      background: ${cor}1A;
    `;
  }}

  strong {
    font-weight: 700;
  }
`;

export const Secao = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
  border: none;

  legend {
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const Acoes = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;
