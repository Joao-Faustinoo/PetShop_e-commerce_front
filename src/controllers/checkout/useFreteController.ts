/**
 * [CONTROLLER] useFreteController
 *
 * O QUE FAZ: calcula o frete da compra e conduz a seleção do endereço de
 * entrega.
 *
 * COMO FARÁ: `useQuery` com queryKey ['frete', enderecoId, itens] que
 * recalcula sempre que o endereço ou a composição do carrinho muda,
 * usando peso e dimensões dos itens (RF0034). A integração com
 * transportadora é mockada, conforme as premissas. Expõe a lista de
 * endereços do cliente para escolha e a opção de cadastrar um novo já
 * durante o checkout, com a caixa de "salvar no meu perfil" que a RF0035
 * exige.
 *
 * ATENDE: RF0034, RF0035
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useEnderecosController } from '@/controllers/enderecos/useEnderecosController';
import { delay } from '@/service/api/delay';
import { ItemCarrinho } from '@/types/carrinho/types';
import { Endereco } from '@/types/enderecos/types';

const FRETE_BASE = 12.9;
const PRECO_POR_KG = 3.4;
/** Divisor da cubagem, no padrão usado pelas transportadoras. */
const DIVISOR_CUBAGEM = 6000;

/**
 * RF0034: frete a partir do peso/dimensões dos itens e da região do
 * endereço. A integração com a transportadora é mockada por premissa do
 * DRS — o cálculo abaixo é determinístico e roda em memória.
 */
export const calcularFrete = (
  itens: ItemCarrinho[],
  endereco?: Endereco,
): number => {
  if (!endereco || itens.length === 0) return 0;

  const { pesoTotal, pesoCubado } = itens.reduce(
    (total, item) => {
      const { altura, largura, profundidade, peso } = item.produto.dimensoes;
      const cubagem = (altura * largura * profundidade) / DIVISOR_CUBAGEM;

      return {
        pesoTotal: total.pesoTotal + peso * item.quantidade,
        pesoCubado: total.pesoCubado + cubagem * item.quantidade,
      };
    },
    { pesoTotal: 0, pesoCubado: 0 },
  );

  // A transportadora cobra pelo maior entre peso real e peso cubado.
  const pesoConsiderado = Math.max(pesoTotal, pesoCubado);

  // A região encarece o frete conforme a distância do centro de distribuição.
  const multiplicadorRegiao: Record<string, number> = {
    SP: 1,
    RJ: 1.15,
    MG: 1.15,
    PR: 1.2,
    SC: 1.25,
    RS: 1.35,
    DF: 1.4,
    GO: 1.4,
    BA: 1.5,
    PE: 1.6,
    CE: 1.65,
    AM: 1.9,
    PA: 1.85,
  };

  const multiplicador = multiplicadorRegiao[endereco.estado] ?? 1.5;

  return Number(
    ((FRETE_BASE + pesoConsiderado * PRECO_POR_KG) * multiplicador).toFixed(2),
  );
};

export const useFreteController = (
  clienteId: number | undefined,
  itens: ItemCarrinho[],
) => {
  const {
    enderecosEntrega,
    criar,
    isPending: salvandoEndereco,
  } = useEnderecosController(clienteId);

  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState<number>();

  const enderecoSelecionado =
    enderecosEntrega.find(e => e.id === enderecoSelecionadoId) ??
    enderecosEntrega[0];

  const { data: frete = 0, isLoading } = useQuery({
    // Recalcula quando o endereço ou a composição do carrinho muda.
    queryKey: [
      'frete',
      enderecoSelecionado?.id,
      itens.map(i => `${i.produto.id}x${i.quantidade}`).join(','),
    ],
    queryFn: () => delay(calcularFrete(itens, enderecoSelecionado), 300),
    enabled: !!enderecoSelecionado && itens.length > 0,
  });

  return {
    enderecos: enderecosEntrega,
    enderecoSelecionado,
    selecionarEndereco: setEnderecoSelecionadoId,
    /** RF0035: novo endereço no checkout, com opção de salvar no perfil. */
    cadastrarEndereco: criar,
    salvandoEndereco,
    frete,
    isLoading,
  };
};
