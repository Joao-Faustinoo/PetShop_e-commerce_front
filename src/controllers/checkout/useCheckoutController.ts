/**
 * [CONTROLLER] useCheckoutController
 *
 * O QUE FAZ: orquestra o fluxo de compra do início ao fim, costurando
 * endereço, frete, pagamento e finalização.
 *
 * COMO FARÁ: mantém o estado das etapas e delega cada uma ao seu
 * controller (`useFreteController`, `usePagamentoController`,
 * `useCupomController`). Só libera a finalização quando houver endereço
 * de entrega e forma de pagamento cobrindo o total. A `useMutation` de
 * `finalizarCompra` cria o pedido em EM_PROCESSAMENTO (RF0038), invalida
 * ['carrinho'] e ['pedidos'] e leva à tela de sucesso. Em seguida
 * dispara a validação de pagamento, que move para APROVADA ou REPROVADA
 * (RN0038) e, se aprovada, autoriza a baixa em estoque (RN0028).
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
import { useMovimentacaoEstoqueController } from '@/controllers/estoque/useMovimentacaoEstoqueController';
import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { useAuth } from '@/hooks/useAuth';
import { clientesService } from '@/service/clientes/service';
import { cuponsService } from '@/service/cupons/service';
import { pedidosService } from '@/service/pedidos/service';
import { Pagamento } from '@/types/pedidos/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useCheckoutController = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const clienteId = user?.clienteId;

  const { registrar } = useLogTransacaoController();
  const { darBaixa } = useMovimentacaoEstoqueController();
  const { itens, subtotal, revalidarDisponibilidade, limpar } =
    useCarrinhoController();

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

      // RN0032: última conferência de estoque antes de fechar a compra.
      const alertas = await revalidarDisponibilidade();

      if (alertas.length > 0) {
        throw new Error(
          'A disponibilidade de alguns itens mudou. Revise o carrinho antes de finalizar.',
        );
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

      // RF0038: a compra nasce EM PROCESSAMENTO.
      const pedido = await pedidosService.finalizarCompra(
        {
          clienteId,
          enderecoEntregaId: frete.enderecoSelecionado.id,
          frete: frete.frete,
          pagamentos: [...pagamentosDeCupom, ...pagamento.montarPagamentos()],
        },
        itens,
      );

      await cuponsService.marcarComoUtilizados(
        cupom.cuponsAplicados.map(c => c.cupom.codigo),
      );

      // RN0036: a sobra dos cupons volta como um novo cupom de troca.
      if (cupom.troco > 0) {
        const cupomTroco = await cuponsService.gerarCupomTroca(
          cupom.troco,
          clienteId,
        );
        await pedidosService.registrarCupomTroco(pedido.id, cupomTroco.codigo);
      }

      // RN0037/RN0038: a operadora valida e o status vira APROVADA ou
      // REPROVADA conforme o retorno.
      const { aprovada } = await pagamento.validarComOperadora();

      const pedidoAtualizado = await pedidosService.atualizarStatus(
        pedido.id,
        aprovada ? 'APROVADA' : 'REPROVADA',
        clienteId,
      );

      // RN0028: só se dá baixa no estoque de compra efetivada.
      if (aprovada) {
        await darBaixa(
          itens.map(item => ({
            produtoId: item.produto.id,
            quantidade: item.quantidade,
          })),
          `Baixa referente ao pedido ${pedido.numero}.`,
        );
        // RN0027: a compra recém-aprovada reposiciona o ranking.
        await clientesService.atualizarRanking(clienteId);
      }

      return pedidoAtualizado;
    },
    onSuccess: async pedido => {
      registrar({
        entidade: 'Pedido',
        entidadeId: pedido.id,
        operacao: 'INSERCAO',
      });

      await limpar();
      cupom.limparCupons();
      pagamento.limparPagamentos();

      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });

      handleSuccess(`Compra ${pedido.numero} registrada com sucesso!`);
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
