/**
 * [VIEW] Primitivas de tela
 *
 * O QUE FAZ: reúne o "cromo" que as 23 telas compartilham — container,
 * cabeçalho, barra de filtros, tabela, abas, painéis e estado vazio.
 *
 * COMO FARÁ: exporta styled-components genéricos parametrizados pelo tema.
 * Cada `styles.ts` de tela reexporta o que usa e acrescenta só o que é
 * específico dela, do mesmo jeito que os formulários fazem com `fields`.
 *
 * ATENDE: base de UI das telas
 */

import styled, { css } from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
`;

export const Cabecalho = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;
`;

export const Titulo = styled.div`
  h1 {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  p {
    margin-top: 0.25rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;

export const Acoes = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

export const Painel = styled.section`
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Filtros = styled.div<{ $colunas?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $colunas }) => $colunas ?? 4}, 1fr);
  gap: 0.85rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const CampoFiltro = styled.div<{ $span?: number }>`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  label {
    font-size: 0.78rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray88};
  }

  select,
  input {
    min-height: 2.5rem;
    padding: 0 0.75rem;
    border-radius: 8px;
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.gray4c};
    background: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.graydf};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }

  ${({ $span }) =>
    $span &&
    css`
      grid-column: span ${$span};

      @media (max-width: 560px) {
        grid-column: auto;
      }
    `}
`;

export const TabelaWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;

  thead th {
    padding: 0.9rem 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.gray88};
    background: ${({ theme }) => theme.colors.grayf6};
  }

  tbody td {
    padding: 0.85rem 1rem;
    vertical-align: middle;
    color: ${({ theme }) => theme.colors.gray4c};
    border-top: 1px solid ${({ theme }) => theme.colors.grayf6};
  }

  tbody tr:hover td {
    background: ${({ theme }) => theme.colors.grayf5};
  }

  .numero {
    text-align: right;
    white-space: nowrap;
  }

  .acoes {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.4rem;
  }
`;

export const BotaoIcone = styled.button<{ $danger?: boolean }>`
  display: flex;
  padding: 0.45rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${({ theme, $danger }) =>
    $danger ? theme.colors.error : theme.colors.secondary};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.grayf6};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }
`;

export const Abas = styled.div`
  display: flex;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  border-bottom: 1px solid ${({ theme }) => theme.colors.graydf};
`;

export const Aba = styled.button<{ $ativa: boolean }>`
  position: relative;
  padding: 0.7rem 1.1rem;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ theme, $ativa }) =>
    $ativa ? theme.colors.primary : theme.colors.gray88};

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: ${({ theme, $ativa }) =>
      $ativa ? theme.colors.primary : 'transparent'};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Contador = styled.em`
  margin-left: 0.4rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-style: normal;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.default};
`;

export const Vazio = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3.5rem 1.5rem;
  text-align: center;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px dashed ${({ theme }) => theme.colors.graydf};

  strong {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }

  p {
    max-width: 26rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray88};
  }
`;

/** Layout de duas colunas: conteúdo + coluna lateral (resumo, ações). */
export const DuasColunas = styled.div`
  display: grid;
  grid-template-columns: 1fr 21rem;
  align-items: start;
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Grade = styled.div<{ $minimo?: string }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(${({ $minimo }) => $minimo ?? '15rem'}, 1fr)
  );
  gap: 1.25rem;
`;

export const Alerta = styled.p<{ $tipo?: 'info' | 'alerta' | 'erro' }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  font-size: 0.88rem;
  line-height: 1.45;

  ${({ theme, $tipo }) => {
    const cores = {
      info: theme.colors.secondary,
      alerta: theme.colors.warning,
      erro: theme.colors.error,
    };
    const cor = cores[$tipo ?? 'info'];

    return css`
      color: ${cor};
      background: ${cor}1A;
    `;
  }}

  strong {
    font-weight: 700;
  }
`;

export const Voltar = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.gray88};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

/** Par rótulo/valor usado nas telas de detalhe. */
export const Dados = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem 1.5rem;

  div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  dt {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.grayb7};
  }

  dd {
    font-size: 0.92rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const TituloSecao = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.gray4c};
`;
