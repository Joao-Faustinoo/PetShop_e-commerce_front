/**
 * [CONTROLLER] useComportamentoModal
 *
 * O QUE FAZ: concentra o comportamento comum a todo modal do sistema —
 * fechar no ESC e travar o scroll do fundo enquanto está aberto.
 *
 * COMO FARÁ: registra o listener de teclado e mexe no overflow do body
 * apenas enquanto `aberto` for verdadeiro, desfazendo os dois no
 * cleanup. Fica isolado aqui porque a casca genérica e o modal de
 * confirmação têm layouts diferentes mas precisam do mesmo
 * comportamento — duplicar o efeito nos dois deixaria as versões
 * livres para divergir.
 *
 * ATENDE: base para os modais do projeto
 */

'use client';

import { useEffect } from 'react';

export const useComportamentoModal = (
  aberto: boolean,
  onClose: () => void,
): void => {
  useEffect(() => {
    if (!aberto) return undefined;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
    };
  }, [aberto, onClose]);
};
