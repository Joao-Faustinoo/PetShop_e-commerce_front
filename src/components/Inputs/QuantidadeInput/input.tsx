/**
 * [VIEW] QuantidadeInput
 *
 * O QUE FAZ: seletor numérico de quantidade usado no produto e no carrinho.
 *
 * COMO FARÁ: botões de mais e menos em torno de um campo numérico, limitado pelo saldo
 * em estoque recebido por prop, impedindo pela própria interface que se
 * peça mais do que existe.
 *
 * ATENDE: RF0032, RN0031
 */

'use client';

import { FiMinus, FiPlus } from 'react-icons/fi';

import * as S from './styles';

interface QuantidadeInputProps {
  value: number;
  onChange: (quantidade: number) => void;
  /** RN0031: teto vindo do saldo em estoque do produto. */
  max: number;
  min?: number;
  disabled?: boolean;
  mostrarLimite?: boolean;
}

const QuantidadeInput = ({
  value,
  onChange,
  max,
  min = 1,
  disabled = false,
  mostrarLimite = false,
}: QuantidadeInputProps) => {
  // RN0031: a interface nunca deixa passar do saldo disponível.
  const limitar = (quantidade: number): number =>
    Math.max(min, Math.min(max, quantidade));

  return (
    <div>
      <S.Container>
        <S.Step
          type="button"
          aria-label="Diminuir quantidade"
          disabled={disabled || value <= min}
          onClick={() => onChange(limitar(value - 1))}
        >
          <FiMinus size={14} />
        </S.Step>

        <S.Input
          type="number"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          aria-label="Quantidade"
          onChange={evento => onChange(limitar(Number(evento.target.value)))}
        />

        <S.Step
          type="button"
          aria-label="Aumentar quantidade"
          disabled={disabled || value >= max}
          onClick={() => onChange(limitar(value + 1))}
        >
          <FiPlus size={14} />
        </S.Step>
      </S.Container>

      {mostrarLimite && (
        <S.Limite>
          {max > 0 ? `${max} em estoque` : 'Sem estoque no momento'}
        </S.Limite>
      )}
    </div>
  );
};

export default QuantidadeInput;
