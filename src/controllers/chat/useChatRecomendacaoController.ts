/**
 * [CONTROLLER] useChatRecomendacaoController
 *
 * O QUE FAZ: conduz a conversa com o assistente de recomendação.
 *
 * COMO FARÁ: mantém a lista de mensagens em estado local e usa
 * `useMutation` para enviar cada pergunta à API, acrescentando a resposta
 * ao histórico. O contexto que personaliza a resposta — pets, histórico de
 * compras e preferências (RNF0047) — é montado no servidor, que tem os
 * dados e a chave do modelo; aqui só sobe a pergunta.
 *
 * Os pets continuam sendo consultados, mas por outro motivo: a tela avisa
 * o cliente sem pet cadastrado de que a sugestão de tamanho depende disso.
 *
 * ATENDE: RNF0047
 */

'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/service/chat/service';
import { petsService } from '@/service/pets/service';
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

  /** Só para avisar quem ainda não cadastrou pet; a sugestão é do servidor. */
  const { data: pets = [] } = useQuery({
    queryKey: ['pets', clienteId],
    queryFn: () => petsService.fetchPetsPorCliente(clienteId as number),
    enabled: !!clienteId,
  });

  const { mutate: enviar, isPending } = useMutation({
    mutationFn: (texto: string) => chatService.enviarMensagem(texto),
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
    pets,
    temPetCadastrado: pets.length > 0,
  };
};
