/**
 * [VIEW] SearchInput
 *
 * O QUE FAZ: campo de busca usado nas listagens com filtro.
 *
 * COMO FARÁ: campo controlado com ícone de lupa e botão de limpar. Mantém o valor
 * imediato para a digitação ficar fluida; quem debounce é a tela, antes de
 * repassar ao controller.
 *
 * ATENDE: RF0015, RF0024, RNF0011
 */

'use client';

import { FiSearch, FiX } from 'react-icons/fi';

import * as S from './styles';

interface SearchInputProps {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Buscar...',
}: SearchInputProps) => {
  return (
    <S.Container>
      <S.Icon>
        <FiSearch size={18} />
      </S.Icon>

      <S.Input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={evento => onChange(evento.target.value)}
      />

      {value && (
        <S.Clear
          type="button"
          aria-label="Limpar busca"
          onClick={() => onChange('')}
        >
          <FiX size={16} />
        </S.Clear>
      )}
    </S.Container>
  );
};

export default SearchInput;
