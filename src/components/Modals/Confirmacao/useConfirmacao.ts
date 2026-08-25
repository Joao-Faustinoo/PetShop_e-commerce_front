/**
 * [CONTROLLER] useConfirmacao
 *
 * O QUE FAZ: guarda a ação que está esperando confirmação e devolve as
 * props já prontas do ModalConfirmacao.
 *
 * COMO FARÁ: `pedirConfirmacao` recebe a mensagem e a função a executar;
 * o modal abre e só chama essa função no confirmar, fechando em
 * seguida. Existe para que uma tela com várias ações confirmáveis não
 * precise de um par de `useState` para cada uma.
 *
 * ATENDE: base para os modais do projeto
 */

'use client';

import { useCallback, useMemo, useState } from 'react';

import { VarianteConfirmacao } from '.';

interface PedidoDeConfirmacao {
  variante: VarianteConfirmacao;
  mensagem: string;
  titulo?: string;
  rotuloConfirmar?: string;
  aoConfirmar: () => void;
}

export const useConfirmacao = () => {
  const [pendente, setPendente] = useState<PedidoDeConfirmacao | null>(null);

  const pedirConfirmacao = useCallback(
    (pedido: PedidoDeConfirmacao) => setPendente(pedido),
    [],
  );

  const fechar = useCallback(() => setPendente(null), []);

  const propsDoModal = useMemo(
    () => ({
      aberto: pendente !== null,
      // Enquanto fecha, o modal ainda renderiza um frame: mantém a
      // variante anterior para não piscar em outra cor.
      variante: pendente?.variante ?? ('alerta' as VarianteConfirmacao),
      mensagem: pendente?.mensagem ?? '',
      titulo: pendente?.titulo,
      rotuloConfirmar: pendente?.rotuloConfirmar,
      onClose: fechar,
      onConfirm: () => {
        pendente?.aoConfirmar();
        fechar();
      },
    }),
    [pendente, fechar],
  );

  return { propsDoModal, pedirConfirmacao };
};
