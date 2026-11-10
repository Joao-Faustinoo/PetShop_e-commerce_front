/**
 * [CONTROLLER] useCheckoutController
 *
 * O QUE FAZ: orquestra o fluxo de compra do início ao fim, costurando
 * endereço, frete, pagamento e finalização.
 *
 * COMO FARÁ: mantém o estado das etapas e delega cada uma ao seu
 * controller (`useFreteController`, `usePagamentoController`,
 * `useCupomController`). Só libera a finalização quando houver endereço
 * de entrega e forma de pagamento cobrindo o total.
 *
 * A finalização é UMA chamada. Validar o pagamento, decidir entre
 * APROVADA e REPROVADA (RN0038), dar baixa no estoque (RN0028), consumir
 * os cupons, emitir o troco (RN0036) e esvaziar o carrinho acontecem no
 * servidor, dentro de uma transação — como várias chamadas, uma falha no
 * meio deixaria pedido criado, cupom gasto e estoque intacto.
 *
 * ATENDE: RF0033, RF0038, RN0028, RN0037, RN0038
 */

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useCarrinhoController } from '@/controllers/carrinho/useCarrinhoController';
import { useCupomController } from '@/controllers/checkout/useCupomController';
import { useFreteController } from '@/controllers/checkout/useFreteController';
import { usePagamentoController } from '@/controllers/checkout/usePagamentoController';
import { useAuth } from '@/hooks/useAuth';
import { pedidosService } from '@/service/pedidos/service';
import { Pagamento } from '@/types/pedidos/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useCheckoutController = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const clienteId = user?.clienteId;
  const { itens, subtotal } = useCarrinhoController();

  const frete = useFreteController(clienteId, itens);
  const totalComFrete = Number((subtotal + frete.frete).toFixed(2));

  const cupom = useCupomController(clienteId, totalComFrete);
  const pagamento = usePagamentoController(
    clienteId,
    cupom.valorRestante,
    cupom.cuponsAplicados.length > 0,
  );

  /** Só libera a finalização com endereço e pagamento completos. */
  const podeFinalizar = useMemo(
    () =>
      itens.length > 0 &&
      !!frete.enderecoSelecionado &&
      pagamento.totalmenteCoberto,
    [itens.length, frete.enderecoSelecionado, pagamento.totalmenteCoberto],
  );

  const { mutate: finalizarCompra, isPending } = useMutation({
    mutationFn: async () => {
      if (!clienteId) {
        throw new Error('É necessário estar logado para comprar.');
      }
      if (!frete.enderecoSelecionado) {
        throw new Error('Selecione um endereço de entrega.');
      }
      if (!pagamento.totalmenteCoberto) {
        throw new Error('O valor da compra não foi integralmente coberto.');
      }

      const pagamentosDeCupom: Pagamento[] = cupom.cuponsAplicados.map(
        ({ cupom: aplicado, valorConsumido }) => ({
          forma:
            aplicado.tipo === 'TROCA'
              ? ('CUPOM_TROCA' as const)
              : ('CUPOM_PROMOCIONAL' as const),
          valor: valorConsumido,
          cupomCodigo: aplicado.codigo,
        }),
      );

      /**
       * RF0038 e RN0032: a API confere o estoque de novo dentro da
       * transação e recusa a compra se algo mudou desde a adição — por
       * isso não há revalidação separada aqui.
       */
      return pedidosService.finalizarCompra({
        clienteId,
        enderecoEntregaId: frete.enderecoSelecionado.id,
        frete: frete.frete,
        pagamentos: [...pagamentosDeCupom, ...pagamento.montarPagamentos()],
      });
    },
    onSuccess: async pedido => {

      // O servidor já esvaziou o carrinho ao fechar a compra; aqui só
      // soltamos o estado local das etapas.
      cupom.limparCupons();
      pagamento.limparPagamentos();

      queryClient.invalidateQueries({ queryKey: ['carrinho'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });

      handleSuccess(
        pedido.status === 'REPROVADA'
          ? `Compra ${pedido.numero} registrada, mas o pagamento foi recusado.`
          : `Compra ${pedido.numero} aprovada com sucesso!`,
      );
      router.push(`/checkout/sucesso?pedido=${pedido.id}`);
    },
    onError: handleError,
  });

  return {
    itens,
    subtotal,
    frete,
    cupom,
    pagamento,
    totalComFrete,
    podeFinalizar,
    finalizarCompra,
    isPending,
  };
};
