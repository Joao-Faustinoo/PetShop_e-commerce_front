/**
 * [CONTROLLER] useChatRecomendacaoController
 *
 * O QUE FAZ: conduz a conversa com o assistente de recomendação e monta
 * o contexto que personaliza as respostas.
 *
 * COMO FARÁ: mantém a lista de mensagens em estado local e usa
 * `useMutation` para enviar cada pergunta ao `chatService`, acrescentando
 * a resposta ao histórico de forma otimista. Monta o
 * `ContextoRecomendacao` reunindo os pets do cliente (espécie, raça,
 * porte), o histórico de compras e as preferências, que é o insumo que a
 * RNF0047 manda usar para sugerir tamanho e itens adequados.
 *
 * ATENDE: RNF0047
 */

'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { chatService, montarContexto } from '@/service/chat/service';
import { Mensagem } from '@/types/chat/types';
import handleError from '@/utils/handleToast';

export const useChatRecomendacaoController = () => {
  const { user } = useAuth();
  const clienteId = user?.clienteId;

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

  const { data: conversaInicial } = useQuery({
    queryKey: ['chat', 'inicial'],
    queryFn: chatService.fetchConversaInicial,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (conversaInicial && mensagens.length === 0) {
      setMensagens(conversaInicial);
    }
    // Só popula a saudação uma vez, no primeiro carregamento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversaInicial]);

  /**
   * RNF0047: pets, histórico de compras e preferências são o insumo que
   * personaliza a resposta e a sugestão de tamanho.
   */
  const { data: contexto } = useQuery({
    queryKey: ['chat', 'contexto', clienteId],
    queryFn: () => montarContexto(clienteId as number),
    enabled: !!clienteId,
  });

  const { mutate: enviar, isPending } = useMutation({
    mutationFn: (texto: string) => {
      if (!contexto) {
        return Promise.reject(
          new Error('Não foi possível carregar seus dados. Tente novamente.'),
        );
      }

      return chatService.enviarMensagem(texto, contexto);
    },
    onSuccess: resposta => {
      setMensagens(atuais => [...atuais, resposta]);
    },
    onError: handleError,
  });

  /** Acrescenta a fala do cliente na hora e só então consulta o assistente. */
  const enviarMensagem = (texto: string) => {
    const limpo = texto.trim();

    if (!limpo || isPending) return;

    setMensagens(atuais => [
      ...atuais,
      {
        id: chatService.proximoId(),
        autor: 'CLIENTE',
        texto: limpo,
        dataHora: new Date().toISOString(),
      },
    ]);

    enviar(limpo);
  };

  return {
    mensagens,
    enviarMensagem,
    /** True enquanto o assistente "digita" a resposta. */
    respondendo: isPending,
    contexto,
    temPetCadastrado: (contexto?.pets.length ?? 0) > 0,
  };
};
