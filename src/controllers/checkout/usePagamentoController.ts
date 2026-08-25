/**
 * [CONTROLLER] usePagamentoController
 *
 * O QUE FAZ: conduz a seleção da forma de pagamento e a divisão do valor
 * entre cartões e cupons.
 *
 * COMO FARÁ: lista os cartões do cliente e permite cadastrar um novo
 * durante o checkout, com a opção de incorporá-lo ao perfil (RF0036).
 * Permite dividir a compra em mais de um cartão exigindo o mínimo de
 * R$ 10,00 por cartão (RN0034), com a exceção prevista na RN0035: quando
 * há cupom junto, o resto no cartão pode ficar abaixo de R$ 10,00.
 * Devolve ao checkout se o total está integralmente coberto e a
 * validação simulada da operadora (RN0037).
 *
 * ATENDE: RF0036, RF0037, RN0034, RN0035, RN0037
 */

'use client';

import { useCallback, useMemo, useState } from 'react';

import { useCartoesController } from '@/controllers/cartoes/useCartoesController';
import { delay } from '@/service/api/delay';
import { Pagamento } from '@/types/pedidos/types';
import handleError from '@/utils/handleToast';

/** RN0034: valor mínimo por cartão em uma compra dividida. */
export const VALOR_MINIMO_POR_CARTAO = 10;

export interface PagamentoCartao {
  cartaoId: number;
  valor: number;
}

export const usePagamentoController = (
  clienteId: number | undefined,
  /** Valor que sobra depois dos cupons — é o que vai para os cartões. */
  valorRestante: number,
  /** Indica se há cupom na compra, o que libera a exceção da RN0035. */
  temCupom: boolean,
) => {
  const {
    cartoes,
    cartaoPreferencial,
    criar: cadastrarCartao,
    isPending: salvandoCartao,
  } = useCartoesController(clienteId);

  const [pagamentos, setPagamentos] = useState<PagamentoCartao[]>([]);

  const valorEmCartoes = useMemo(
    () => Number(pagamentos.reduce((soma, p) => soma + p.valor, 0).toFixed(2)),
    [pagamentos],
  );

  const valorPendente = Number(
    Math.max(0, valorRestante - valorEmCartoes).toFixed(2),
  );

  const totalmenteCoberto = valorPendente <= 0;

  /**
   * RN0034: cada cartão precisa levar ao menos R$ 10,00. RN0035 abre a
   * exceção: havendo cupom na compra, o valor único no cartão pode ficar
   * abaixo do mínimo (ex.: R$ 30,00 em cupons e R$ 5,00 no cartão).
   */
  const validarValorCartao = useCallback(
    (valor: number, quantidadeDeCartoes: number): string | null => {
      if (valor <= 0) return 'Informe um valor maior que zero para o cartão.';

      const excecaoDaRN0035 = temCupom && quantidadeDeCartoes === 1;

      if (valor < VALOR_MINIMO_POR_CARTAO && !excecaoDaRN0035) {
        return `O valor mínimo por cartão é de R$ ${VALOR_MINIMO_POR_CARTAO.toFixed(
          2,
        )}.`;
      }

      return null;
    },
    [temCupom],
  );

  const adicionarPagamento = useCallback(
    (cartaoId: number, valor: number) => {
      if (pagamentos.some(p => p.cartaoId === cartaoId)) {
        handleError(new Error('Este cartão já foi usado nesta compra.'));

        return;
      }

      const erro = validarValorCartao(valor, pagamentos.length + 1);

      if (erro) {
        handleError(new Error(erro));

        return;
      }

      if (valor > valorPendente) {
        handleError(
          new Error(
            `Falta apenas R$ ${valorPendente.toFixed(2)} para cobrir a compra.`,
          ),
        );

        return;
      }

      setPagamentos(atuais => [...atuais, { cartaoId, valor }]);
    },
    [pagamentos, valorPendente, validarValorCartao],
  );

  const removerPagamento = useCallback((cartaoId: number) => {
    setPagamentos(atuais => atuais.filter(p => p.cartaoId !== cartaoId));
  }, []);

  const limparPagamentos = useCallback(() => setPagamentos([]), []);

  /** Converte a seleção da tela no formato que o pedido armazena. */
  const montarPagamentos = useCallback(
    (): Pagamento[] =>
      pagamentos.map(pagamento => {
        const cartao = cartoes.find(c => c.id === pagamento.cartaoId);

        return {
          forma: 'CARTAO' as const,
          valor: pagamento.valor,
          cartaoId: pagamento.cartaoId,
          cartaoFinal: cartao?.numero.slice(-4),
        };
      }),
    [pagamentos, cartoes],
  );

  /**
   * RN0037: valida o aceite da compra pela operadora. A integração é
   * mockada por premissa do DRS — aqui a aprovação é sempre concedida
   * desde que exista ao menos uma forma de pagamento cobrindo o total.
   */
  const validarComOperadora = useCallback(async (): Promise<{
    aprovada: boolean;
    motivo?: string;
  }> => {
    if (!totalmenteCoberto) {
      return delay(
        {
          aprovada: false,
          motivo: 'O valor da compra não foi integralmente coberto.',
        },
        600,
      );
    }

    return delay({ aprovada: true }, 600);
  }, [totalmenteCoberto]);

  return {
    cartoes,
    cartaoPreferencial,
    cadastrarCartao,
    salvandoCartao,
    pagamentos,
    valorEmCartoes,
    valorPendente,
    totalmenteCoberto,
    adicionarPagamento,
    removerPagamento,
    limparPagamentos,
    montarPagamentos,
    validarComOperadora,
  };
};
