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
import { carrinhoService } from '@/service/carrinho/service';
import { ItemCarrinho } from '@/types/carrinho/types';

export const useFreteController = (
  clienteId: number | undefined,
  itens: ItemCarrinho[],
) => {
  const {
    enderecosEntrega,
    criar,
    isPending: salvandoEndereco,
    // RF0035: o checkout enxerga também o endereço criado só para esta
    // compra, que não foi guardado no perfil.
  } = useEnderecosController(clienteId, true);

  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState<number>();

  const enderecoSelecionado =
    enderecosEntrega.find(e => e.id === enderecoSelecionadoId) ??
    enderecosEntrega[0];

  /*
   * RF0034: quem calcula o frete é o servidor, que o recalcula de novo ao
   * fechar a compra. Antes a conta existia também aqui, com a tabela de
   * multiplicadores duplicada: as duas concordavam por coincidência, e
   * mudar um multiplicador faria a tela mostrar um valor e a compra
   * registrar outro.
   */
  const { data: resumo, isLoading } = useQuery({
    // Recalcula quando o endereço ou a composição do carrinho muda.
    queryKey: [
      'frete',
      enderecoSelecionado?.id,
      itens.map(i => `${i.produto.id}x${i.quantidade}`).join(','),
    ],
    queryFn: () => carrinhoService.fetchResumo(enderecoSelecionado!.id),
    enabled: !!enderecoSelecionado && itens.length > 0,
  });

  return {
    enderecos: enderecosEntrega,
    enderecoSelecionado,
    selecionarEndereco: setEnderecoSelecionadoId,
    /** RF0035: novo endereço no checkout, com opção de salvar no perfil. */
    cadastrarEndereco: criar,
    salvandoEndereco,
    frete: resumo?.frete ?? 0,
    isLoading,
  };
};
